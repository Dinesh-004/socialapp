import express, { Request, Response } from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Openinary URL (Internal Docker Network or Localhost)
// Openinary URL (Internal Docker Network, Localhost, or External Service)
const OPENINARY_URL = process.env.OPENINARY_URL || 'http://localhost:3000';

// Multer adds 'file' to the Request object
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

// POST /upload
router.post('/', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
    const multerReq = req as MulterRequest;
    if (!multerReq.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
    }

    console.log('Proxying Upload:', {
        filename: multerReq.file.originalname,
        type: multerReq.file.mimetype,
        size: multerReq.file.size,
        hasApiKey: !!process.env.OPENINARY_API_KEY
    });

    try {
        // Read file into buffer to ensure correct Content-Length in proxy request
        const fileBuffer = fs.readFileSync(multerReq.file.path);
        const formData = new FormData();
        // Changing field name to 'files' as per Openinary source code
        formData.append('files', fileBuffer, {
            filename: multerReq.file.originalname,
            contentType: multerReq.file.mimetype,
        });

        const headers = {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.OPENINARY_API_KEY}`
        };

        console.log('Sending Headers (Buffer):', headers);

        // Proxy to Openinary
        const response = await axios.post(`${OPENINARY_URL}/api/upload`, formData, {
            headers
        });

        // Clean up temp file
        fs.unlinkSync(multerReq.file.path);

        // Return Openinary response (URL)
        // Return Openinary response (URL)
        // Openinary returns { success: true, files: [{ url: '/t/...' }] }
        const imageUrl = response.data.files?.[0]?.url;
        if (!imageUrl) {
            throw new Error('No URL in response');
        }

        // Prepend Openinary URL if it's a relative path (Openinary often returns /t/...)
        const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${OPENINARY_URL}${imageUrl}`;

        res.json({ url: fullUrl });
    } catch (err: any) {
        // Clean up temp file
        if (multerReq.file) fs.unlinkSync(multerReq.file.path);

        console.error('Upload Error:', err.response?.data || err.message);
        res.status(500).json({
            message: 'Failed to upload to Openinary',
            error: err.response?.data || err.message,
            status: err.response?.status
        });
    }
});

export default router;
