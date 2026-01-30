import express, { Response } from 'express';
import Post from '../models/Post';
import User from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// POST /posts - Create a new post
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { caption, image, aspectRatio, aspectRatioValue, rotation } = req.body;
        const userId = req.user;

        if (!caption || !image) {
            console.error('Create Post Error: Missing fields', { caption, image, body: req.body });
            res.status(400).json({ message: 'Caption and Image are required' });
            return;
        }

        console.log('Creating Post with:', { caption, aspectRatio, aspectRatioValue, rotation, imageLength: image.length });

        const newPost = new Post({
            user: userId,
            caption,
            image,
            aspectRatio: aspectRatio || 'portrait',
            aspectRatioValue: aspectRatioValue || 0.8,
            rotation: rotation || 0
        });

        await newPost.save();

        // Populate user info to return complete object
        await newPost.populate('user', 'username profilePic');

        res.status(201).json(newPost);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /posts/following - Get posts from followed users
router.get('/following', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user;
        const currentUser = await User.findById(userId);

        if (!currentUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const posts = await Post.find({ user: { $in: currentUser.following } })
            .sort({ createdAt: -1 })
            .populate('user', 'username profilePic');

        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /posts/user/:userId - Get posts by user
router.get('/user/:userId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /posts - Get all posts (Feed)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('user', 'username profilePic');

        if (posts.length > 0) {
            console.log('Fetching Feed. Latest Post:', {
                id: posts[0]._id,
                aspectRatio: posts[0].aspectRatio
            });
        }

        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /posts/:id/like - Toggle like
router.put('/:id/like', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const postId = req.params.id;
        const userId = req.user;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        // Check if already liked (Robust comparison)
        const isLiked = post.likes.some(id => id.toString() === userId.toString());

        if (isLiked) {
            // Unlike
            await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
        } else {
            // Like
            await Post.findByIdAndUpdate(postId, { $addToSet: { likes: userId } });
        }

        // Return updated post likes
        const updatedPost = await Post.findById(postId);
        res.json(updatedPost?.likes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


// GET /posts/:id/comments - Get comments for a post
router.get('/:id/comments', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const postId = req.params.id;
        // Import Comment model dynamically or at top. Ideally at top.
        // Assuming we add import at top later.
        const Comment = (await import('../models/Comment')).default;

        const comments = await Comment.find({ post: postId })
            .populate('user', 'username profilePic')
            .sort({ createdAt: 1 }); // Oldest first (like Instagram)

        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /posts/:id/comments - Add a comment
router.post('/:id/comments', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user;

        if (!text) {
            res.status(400).json({ message: 'Comment text is required' });
            return;
        }

        const Comment = (await import('../models/Comment')).default;

        const newComment = new Comment({
            post: postId,
            user: userId,
            text
        });

        await newComment.save();
        await newComment.populate('user', 'username profilePic');

        res.status(201).json(newComment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
