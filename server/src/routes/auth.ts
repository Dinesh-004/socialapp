import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your_refresh_secret_key_change_this';

// POST /auth/register
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user).select('-passwordHash');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post(['/register', '/signup'], async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password, phone } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            res.status(400).json({ message: 'Username or Email already exists' });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new User({
            username,
            email,
            phone,
            passwordHash
        });

        await newUser.save();

        // Generate tokens
        const accessToken = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: newUser._id }, REFRESH_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profilePic: newUser.profilePic
            },
            accessToken,
            refreshToken
        });
    } catch (err: any) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { emailOrUsername, password } = req.body;

        // Find user
        const user = await User.findOne({
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
        });

        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        // Generate tokens
        const accessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePic: user.profilePic
            },
            accessToken,
            refreshToken
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(401).json({ message: 'Refresh Token Required' });
        return;
    }

    try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as { id: string };
        const accessToken = jwt.sign({ id: decoded.id }, JWT_SECRET, { expiresIn: '15m' });

        res.json({ accessToken });
    } catch (err) {
        res.status(403).json({ message: 'Invalid Refresh Token' });
    }
});

export default router;
