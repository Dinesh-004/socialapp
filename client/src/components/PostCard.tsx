'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';

interface PostProps {
    post: {
        _id: string;
        user: {
            username: string;
            profilePic?: string;
        };
        caption: string;
        image: string;
        aspectRatio?: 'square' | 'portrait' | 'landscape';
        aspectRatioValue?: number;
        rotation?: number;
        createdAt: string;
        likes?: string[];
    };
}

export default function PostCard({ post }: PostProps) {
    const { user } = useAuthStore();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [showHeartOverlay, setShowHeartOverlay] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

    // Load comments when toggled
    useEffect(() => {
        if (showComments && comments.length === 0) {
            setLoadingComments(true);
            api.get(`/posts/${post._id}/comments`)
                .then(res => {
                    setComments(res.data);
                })
                .finally(() => setLoadingComments(false));
        }
    }, [showComments, post._id, comments.length]);

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            const res = await api.post(`/posts/${post._id}/comments`, { text: commentText });
            setComments([...comments, res.data]);
            setCommentText('');
        } catch (err) {
            console.error('Failed to post comment', err);
        }
    };

    // Initialize state
    useEffect(() => {
        if (post.likes && user) {
            // Check both _id (MongoDB) and id (Virtual) to be safe
            const userId = user._id || user.id;
            if (userId) {
                setIsLiked(post.likes.includes(userId));
            }
            setLikeCount(post.likes.length);
        } else if (post.likes) {
            setLikeCount(post.likes.length);
        }
    }, [post.likes, user]);

    // Cleanup animation
    useEffect(() => {
        if (showHeartOverlay) {
            const timer = setTimeout(() => setShowHeartOverlay(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [showHeartOverlay]);

    const handleLike = async (fromDoubleClick = false) => {
        if (!user) return; // Prevent interaction if not logged in (or redirect)

        // If double click, always show animation
        if (fromDoubleClick) {
            setShowHeartOverlay(true);
            // If already liked, just animate and return (optional, standard generic behavior varies)
            // But Instagram usually just pulses if already liked. 
            // Here we'll ensure it is 'liked' if not already.
            if (isLiked) return;
        }

        // Optimistic update
        const prevIsLiked = isLiked;
        const prevCount = likeCount;

        setIsLiked(!prevIsLiked);
        setLikeCount(prev => prevIsLiked ? prev - 1 : prev + 1);

        try {
            const res = await api.put<string[]>(`/posts/${post._id}/like`);

            // Server returns the updated array of like IDs. 
            // Sync state with specific server truth to ensure consistency.
            if (res.data && Array.isArray(res.data)) {
                const updatedLikes = res.data;
                // Check both _id (MongoDB) and id (Virtual) to be safe
                const userId = user.id || user._id;
                if (userId) {
                    setIsLiked(updatedLikes.includes(userId));
                }
                setLikeCount(updatedLikes.length);
            }
        } catch (err) {
            console.error('Failed to toggle like', err);
            // Revert
            setIsLiked(prevIsLiked);
            setLikeCount(prevCount);
        }
    };

    // Helper to add quality param to Openinary URLs
    // Assuming format: .../t/{transformations}/filename
    // Or .../t/filename -> .../t/q_80/filename
    const getOptimizedUrl = (url: string) => {
        if (!url || !url.includes('/t/')) return url;
        // If already has transformations, append/merge (simplified)
        // If it looks like .../t/filename.jpg, insert q_80
        const parts = url.split('/t/');
        if (parts.length !== 2) return url;

        const [base, rest] = parts;
        // Check if there are already params (segments before filename)
        // This is a basic injection: always add q_80
        return `${base}/t/q_80/${rest}`;
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden mb-6 w-full max-w-lg mx-auto">
            {/* Header */}
            <div className="p-4 flex items-center gap-3">
                <Link href={`/profile/${post.user.username}`} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden relative">
                        {/* Placeholder or Profile Pic */}
                        {post.user.profilePic && (
                            <Image
                                src={getOptimizedUrl(post.user.profilePic)}
                                alt={post.user.username}
                                fill
                                className="object-cover"
                            />
                        )}
                    </div>
                    <span className="font-semibold hover:underline">{post.user.username}</span>
                </Link>
            </div>

            {/* Image */}
            <div
                className="relative w-full bg-zinc-100 dark:bg-zinc-900 group"
                style={{
                    aspectRatio: post.aspectRatioValue || (
                        post.aspectRatio === 'square' ? '1 / 1' :
                            post.aspectRatio === 'landscape' ? '1.91 / 1' :
                                '4 / 5'
                    )
                }}
                onDoubleClick={() => handleLike(true)}
            >
                <Image
                    src={getOptimizedUrl(post.image)}
                    alt={post.caption}
                    fill
                    className="object-cover"
                    style={{ transform: `rotate(${post.rotation || 0}deg)` }}
                />

                {/* Heart Popup Overlay */}
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${showHeartOverlay ? 'opacity-100' : 'opacity-0'}`}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`w-24 h-24 text-white drop-shadow-2xl transition-transform duration-300 ${showHeartOverlay ? 'scale-110' : 'scale-0'}`}
                        style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.3))' }}
                    >
                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                </div>
            </div>

            {/* Actions / Footer */}
            <div className="p-4">
                <div className="flex gap-4 mb-4">
                    <button onClick={() => handleLike(false)} className="focus:outline-none transition-transform active:scale-125">
                        {isLiked ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-red-500">
                                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 hover:text-zinc-600 dark:hover:text-zinc-300">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                        )}
                    </button>

                    <button onClick={() => setShowComments(!showComments)} className="focus:outline-none transition-transform active:scale-125">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 hover:text-zinc-600 dark:hover:text-zinc-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                        </svg>
                    </button>
                </div>

                <div className="mb-2 font-bold text-sm">
                    {likeCount} likes
                </div>

                <div className="mb-2">
                    <span className="font-bold mr-2">{post.user.username}</span>
                    <span>{post.caption}</span>
                </div>

                {/* View all comments toggle */}
                {!showComments && (
                    <button
                        onClick={() => setShowComments(true)}
                        className="text-sm text-zinc-500 mb-2 cursor-pointer focus:outline-none"
                    >
                        View all comments
                    </button>
                )}

                {/* Comments Section */}
                {showComments && (
                    <div className="mt-4 mb-4 space-y-3">
                        {loadingComments ? (
                            <div className="text-zinc-500 text-sm">Loading...</div>
                        ) : (
                            comments.map((c) => (
                                <div key={c._id} className="text-sm flex gap-2">
                                    <span className="font-bold shrink-0">{c.user.username}</span>
                                    <span className="break-words">{c.text}</span>
                                </div>
                            ))
                        )}

                        {/* Comment Input */}
                        <form onSubmit={handlePostComment} className="flex gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                className="bg-transparent flex-1 focus:outline-none text-sm"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            {commentText.trim() && (
                                <button
                                    type="submit"
                                    className="text-blue-500 font-semibold text-sm"
                                >
                                    Post
                                </button>
                            )}
                        </form>
                    </div>
                )}

                <div className="text-xs text-zinc-500 mt-2">
                    {new Date(post.createdAt).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
}
