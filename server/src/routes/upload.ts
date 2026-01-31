import express, { Request, Response } from 'express';
import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';

const router = express.Router();

// Create GridFS storage engine
const storage = new GridFsStorage({
    url: process.env.MONGO_URI || 'mongodb://localhost:27017/instagram-clone',
    file: (req: any, file: any) => {
        return {
            bucketName: 'uploads', // Collection name: uploads.files, uploads.chunks
            filename: `${Date.now()}-${file.originalname}`
        };
    }
});

const upload = multer({ storage: storage as any });

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

    // With GridFS, multer-gridfs-storage handles the upload.
    // The file object will contain the 'filename' in GridFS (not 'path' like diskStorage)

    // Construct the URL to serve the file
    // Assuming backend serves this at /file/:filename
    const baseUrl = process.env.API_URL || 'http://localhost:5000'; // Define API_URL or derive it
    const fileUrl = `${baseUrl}/file/${multerReq.file.filename}`;

    res.json({ url: fileUrl });
});

export default router;
