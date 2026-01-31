import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import postsRoutes from './routes/posts';
import uploadRoutes from './routes/upload';
import usersRoutes from './routes/users';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/instagram-clone';

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3001',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Database Connection
let gfsBucket: mongoose.mongo.GridFSBucket;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        const db = mongoose.connection.db;
        if (db) {
            gfsBucket = new mongoose.mongo.GridFSBucket(db, {
                bucketName: 'uploads'
            });
            console.log('GridFS Bucket Initialized');
        }
    })
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/auth', authRoutes);
app.use('/posts', postsRoutes);
app.use('/upload', uploadRoutes);
app.use('/users', usersRoutes);

app.get('/', (req, res) => {
    res.send('Instagram Clone API is running');
});

// Serve Images from GridFS
app.get('/file/:filename', async (req, res) => {
    try {
        if (!gfsBucket) {
            res.status(500).json({ message: 'Database not initialized' });
            return;
        }

        const files = await gfsBucket.find({ filename: req.params.filename }).toArray();
        if (!files || files.length === 0) {
            res.status(404).json({ message: 'File not found' });
            return;
        }

        gfsBucket.openDownloadStreamByName(req.params.filename).pipe(res);
    } catch (err) {
        console.error('File Retrieval Error:', err);
        res.status(500).json({ message: 'Error retrieving file' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
