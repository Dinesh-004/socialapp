'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import PostCard from '@/components/PostCard';

interface Post {
    _id: string;
    user: {
        username: string;
        profilePic?: string;
    };
    caption: string;
    image: string;
    createdAt: string;
}

export default function Home() {
    const { isAuthenticated, isLoading: authLoading } = useAuthStore();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [feedType, setFeedType] = useState<'all' | 'following'>('all');

    const fetchPosts = async () => {
        setLoadingPosts(true);
        try {
            const endpoint = feedType === 'following' ? '/posts/following' : '/posts';
            const res = await api.get(endpoint);
            setPosts(res.data);
        } catch (err) {
            console.error('Failed to fetch posts', err);
        } finally {
            setLoadingPosts(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchPosts();
        }
    }, [isAuthenticated, feedType]);

    if (authLoading) return <div className="flex justify-center p-8">Loading...</div>;

    if (!isAuthenticated) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
                <h1 className="text-4xl font-bold mb-6">Instagram Clone</h1>
                <p className="mb-8 text-xl text-zinc-600 dark:text-zinc-400">Share your moments with the world.</p>
                <div className="flex gap-4">
                    <Link href="/auth/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full">
                        Login
                    </Link>
                    <Link href="/auth/signup" className="bg-zinc-200 hover:bg-zinc-300 text-black px-6 py-2 rounded-full">
                        Sign Up
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
            <div className="flex gap-8 mb-6 border-b border-zinc-200 dark:border-zinc-800 w-full max-w-2xl justify-center">
                <button
                    onClick={() => setFeedType('all')}
                    className={`pb-3 font-semibold text-sm transition ${feedType === 'all'
                        ? 'text-black dark:text-white border-b-2 border-black dark:border-white'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                        }`}
                >
                    For You
                </button>
                <button
                    onClick={() => setFeedType('following')}
                    className={`pb-3 font-semibold text-sm transition ${feedType === 'following'
                        ? 'text-black dark:text-white border-b-2 border-black dark:border-white'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                        }`}
                >
                    Following
                </button>
            </div>

            <div className="w-full max-w-2xl">
                {loadingPosts ? (
                    <div className="text-center py-4">Loading feed...</div>
                ) : posts.length > 0 ? (
                    posts.map(post => <PostCard key={post._id} post={post} />)
                ) : (
                    <div className="text-center py-10 text-zinc-500">
                        No posts yet. Be the first to post!
                    </div>
                )}
            </div>
        </main>
    );
}
