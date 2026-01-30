import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual populate for user details (though we usually populate explicitly)
// CommentSchema.virtual('author', {
//     ref: 'User',
//     localField: 'user',
//     foreignField: '_id',
//     justOne: true
// });

export default mongoose.model('Comment', CommentSchema);
