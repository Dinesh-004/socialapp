import express, { Response } from 'express';
import User from '../models/User';
import Post from '../models/Post';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /users/:username - Get user profile
router.get('/:username', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { username } = req.params;

        // Find user
        const user = await User.findOne({ username }).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Get basic stats
        const postCount = await Post.countDocuments({ user: user._id });
        const followersCount = user.followers.length;
        const followingCount = user.following.length;

        // Check if current user is following this profile
        // req.user is the ID string from auth middleware
        // user.followers is an array of ObjectIds
        const isFollowing = user.followers.some(id => id.toString() === req.user);

        res.json({
            user,
            stats: {
                posts: postCount,
                followers: followersCount,
                following: followingCount
            },
            isFollowing
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /users/profile - Update current user profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user;
        const { bio, profilePic, fullName } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { bio, profilePic, fullName },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /users/:id/follow - Toggle follow user
router.post('/:id/follow', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user;

        if (targetUserId === currentUserId) {
            res.status(400).json({ message: 'Cannot follow yourself' });
            return;
        }

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const isFollowing = targetUser.followers.some(id => id.toString() === currentUserId);

        if (isFollowing) {
            // Unfollow
            await targetUser.updateOne({ $pull: { followers: currentUserId } });
            await currentUser.updateOne({ $pull: { following: targetUserId } });
            res.json({ isFollowing: false });
        } else {
            // Follow
            await targetUser.updateOne({ $addToSet: { followers: currentUserId } });
            await currentUser.updateOne({ $addToSet: { following: targetUserId } });
            res.json({ isFollowing: true });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /users/search/all - Search users
// Note: Put this BEFORE generic /:id routes if possible, or make path distinct
// Since we have /:username above, 'search' might be treated as a username if not careful.
// However, 'search' is likely distinct enough. But /search vs /:username order matters.
// Express matches in order. /:username captures everything.
// Solution: Move search ABOVE /:username or use /search endpoint specifically.
// Let's use /current/search pattern or just verify order.
// Since /:username is at top, we should move search to top or use a prefix.
// Actually, earlier I defined get('/:username').
// If I add separate generic search route, I should put it BEFORE /:username.

// RE-PLAN: I will add the search route *above* the /:username route in a separate edit or just assume I can re-order.
// For now, let's use a specific path that won't collide easily, or rely on 'search' not being a valid username (which is true if checked).
// Better yet, I'll use `router.get('/search/results', ...)` to be safe.
router.get('/search/results', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { q } = req.query;
        if (!q) {
            res.json([]);
            return;
        }

        const users = await User.find({
            $or: [
                { username: { $regex: q as string, $options: 'i' } },
                { fullName: { $regex: q as string, $options: 'i' } }
            ]
        }).select('username fullName profilePic').limit(10);

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
