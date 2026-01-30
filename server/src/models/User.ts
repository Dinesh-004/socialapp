import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    phone?: string;
    passwordHash: string;
    profilePic?: string;
    fullName?: string;
    bio?: string;
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    profilePic: { type: String, default: '' },
    fullName: { type: String, default: '' },
    bio: { type: String, default: '' },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isVerified: { type: Boolean, default: false },
}, {
    timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
