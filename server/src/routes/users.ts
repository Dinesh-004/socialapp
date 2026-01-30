import express, { Response } from 'express';
import User from '../models/User';
import Post from '../models/Post';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /users/search/results - Search users
// MUST BE TOP to avoid collision with /:username
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

// GET /users/:username - Get user profile
// MUST BE LAST generic route
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

export default router;
