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
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/auth', authRoutes);
app.use('/posts', postsRoutes);
app.use('/upload', uploadRoutes);
app.use('/users', usersRoutes);

app.get('/', (req, res) => {
    res.send('Instagram Clone API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
