import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    caption: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    aspectRatio: {
        type: String,
        enum: ['square', 'portrait', 'landscape'],
        default: 'portrait'
    },
    aspectRatioValue: {
        type: Number,
        default: 0.8 // 4:5 default
    },
    rotation: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Post', PostSchema);
