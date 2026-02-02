import express, { Request, Response } from 'express';
import multer from 'multer';
import { GridFSStorage } from '../utils/GridFSStorage';

const router = express.Router();

// Create GridFS storage engine
const storage = new GridFSStorage({
    bucketName: 'uploads'
});

const upload = multer({ storage });

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

// POST /upload
router.post('/', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error('Upload Error:', err);
            return res.status(500).json({ message: 'Upload failed', error: err.message });
        }
        next();
    });
}, async (req: Request, res: Response): Promise<void> => {
    const multerReq = req as MulterRequest;
    if (!multerReq.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
    }

    // With GridFS, multer-gridfs-storage handles the upload.
    // The file object will contain the 'filename' in GridFS (not 'path' like diskStorage)

    // Construct the URL to serve the file
    // Construct the URL to serve the file
    // Dynamically determine the base URL based on the request
    const protocol = req.headers['x-forwarded-proto'] ? 'https' : req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/file/${multerReq.file.filename}`;

    res.json({ url: fileUrl });
});

export default router;
