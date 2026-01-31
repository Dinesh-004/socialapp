'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import Image from 'next/image';

interface EditProfileModalProps {
    user: {
        username: string;
        fullName?: string;
        bio?: string;
        profilePic?: string;
    };
    onClose: () => void;
    onUpdate: (updatedUser: any) => void;
}

export default function EditProfileModal({ user, onClose, onUpdate }: EditProfileModalProps) {
    const [fullName, setFullName] = useState(user.fullName || '');
    const [bio, setBio] = useState(user.bio || '');
    const [profilePic, setProfilePic] = useState(user.profilePic || '');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfilePic(res.data.url);
        } catch (err) {
            console.error('Upload failed', err);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.put('/users/profile', {
                fullName,
                bio,
                profilePic
            });
            onUpdate(res.data);
            onClose();
        } catch (err) {
            console.error('Update failed', err);
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const getOptimizedUrl = (url: string) => {
        if (!url || !url.includes('/t/')) return url;
        const parts = url.split('/t/');
        if (parts.length !== 2) return url;
        return `${parts[0]}/t/q_60/${parts[1]}`;
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="border-b border-zinc-200 dark:border-zinc-800 p-4 flex justify-between items-center">
                    <h2 className="font-semibold text-lg">Edit Profile</h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Profile Pic */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative group">
                            {profilePic ? (
                                <Image
                                    src={getOptimizedUrl(profilePic)}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-400 text-3xl font-bold">
                                    {user.username[0].toUpperCase()}
                                </div>
                            )}

                            {/* Overlay */}
                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold">
                                {uploading ? '...' : 'Change'}
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                            </label>
                        </div>
                        <button type="button" className="text-blue-500 font-semibold text-sm">
                            <label className="cursor-pointer">
                                Change Profile Photo
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                            </label>
                        </button>
                    </div>

                    {/* Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-zinc-400"
                                placeholder="Name"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 mb-1">Bio</label>
                            <textarea
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                rows={3}
                                className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-zinc-400 resize-none"
                                placeholder="Write something about yourself..."
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Done'}
                    </button>
                </form>
            </div>
        </div>
    );
}
