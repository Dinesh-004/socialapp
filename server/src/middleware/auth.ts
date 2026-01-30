import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this';

export interface AuthRequest extends Request {
    user?: string; // User ID
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        res.status(401).json({ message: 'Access Token Required' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        req.user = decoded.id;
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid or Expired Token' });
    }
};
