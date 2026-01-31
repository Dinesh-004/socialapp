import express, { Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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

    try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(multerReq.file.path, {
            folder: 'instagram-clone', // Organize uploads
        });

        // Clean up local file
        fs.unlinkSync(multerReq.file.path);

        res.json({ url: result.secure_url });
    } catch (err: any) {
        // Clean up local file if it exists
        if (multerReq.file && fs.existsSync(multerReq.file.path)) {
            fs.unlinkSync(multerReq.file.path);
        }

        console.error('Cloudinary Upload Error:', err);
        res.status(500).json({
            message: 'Failed to upload image',
            error: err.message
        });
    }
});

export default router;
