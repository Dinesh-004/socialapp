'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import EditProfileModal from '@/components/EditProfileModal';

interface UserProfile {
    user: {
        _id: string;
        username: string;
        fullName?: string;
        bio?: string;
        profilePic?: string;
    };
    stats: {
        posts: number;
        followers: number;
        following: number;
    };
    isFollowing: boolean;
}

interface Post {
    _id: string;
    image: string;
    likes: string[];
    commentCount?: number;
}

export default function ProfilePage() {
    const { username } = useParams();
    const { user: currentUser } = useAuthStore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);

    const isOwnProfile = currentUser && profile && (currentUser.username === profile.user.username);

    const handleProfileUpdate = (updatedUser: any) => {
        if (profile) {
            setProfile({ ...profile, user: updatedUser });
        }
    };

    const handleFollow = async () => {
        if (!profile) return;

        // Optimistic update
        const wasFollowing = profile.isFollowing;
        setProfile(prev => prev ? ({
            ...prev,
            isFollowing: !wasFollowing,
            stats: {
                ...prev.stats,
                followers: prev.stats.followers + (wasFollowing ? -1 : 1)
            }
        }) : null);

        try {
            await api.post(`/users/${profile.user._id}/follow`);
        } catch (err) {
            console.error('Follow failed', err);
            // Revert on failure
            setProfile(prev => prev ? ({
                ...prev,
                isFollowing: wasFollowing,
                stats: {
                    ...prev.stats,
                    followers: prev.stats.followers + (wasFollowing ? 1 : -1)
                }
            }) : null);
        }
    };

    useEffect(() => {
        if (!username) return;

        const fetchData = async () => {
            try {
                // Fetch Profile
                const profileRes = await api.get(`/users/${username}`);
                setProfile(profileRes.data);

                // Fetch Posts
                const user = profileRes.data.user;
                const postsRes = await api.get(`/posts/user/${user._id}`);
                setPosts(postsRes.data);
            } catch (err) {
                console.error('Failed to load profile', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [username]);

    const getOptimizedUrl = (url: string) => {
        if (!url || !url.includes('/t/')) return url;
        const parts = url.split('/t/');
        if (parts.length !== 2) return url;
        return `${parts[0]}/t/q_60/${parts[1]}`; // Lower quality for thumbnails
    };

    if (loading) return <div className="flex justify-center p-8">Loading...</div>;
    if (!profile) return <div className="flex justify-center p-8">User not found</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
                {/* Avatar */}
                <div className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative shrink-0">
                    {profile.user.profilePic ? (
                        <Image
                            src={getOptimizedUrl(profile.user.profilePic)}
                            alt={profile.user.username}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400 text-4xl font-bold">
                            {profile.user.username[0].toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col items-center md:items-start gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl md:text-2xl font-normal">{profile.user.username}</h1>
                        {isOwnProfile ? (
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg font-semibold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                            >
                                Edit profile
                            </button>
                        ) : (
                            <button
                                onClick={handleFollow}
                                className={`px-4 py-1.5 rounded-lg font-semibold text-sm transition ${profile.isFollowing
                                        ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    }`}
                            >
                                {profile.isFollowing ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </div>

                    <div className="flex gap-8 text-sm md:text-base">
                        <div><span className="font-bold">{profile.stats.posts}</span> posts</div>
                        <div><span className="font-bold">{profile.stats.followers}</span> followers</div>
                        <div><span className="font-bold">{profile.stats.following}</span> following</div>
                    </div>

                    <div className="text-sm md:text-base text-center md:text-left">
                        <div className="font-bold">{profile.user.fullName || profile.user.username}</div>
                        <div className="whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
                            {profile.user.bio || 'No bio yet.'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <div className="flex justify-center gap-12 text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-4">
                    <span className="text-black dark:text-white border-t border-black dark:border-white pt-2 -mt-4.5">Posts</span>
                    <span>Saved</span>
                    <span>Tagged</span>
                </div>

                <div className="grid grid-cols-3 gap-1 md:gap-4">
                    {posts.map(post => (
                        <div key={post._id} className="aspect-square relative group bg-zinc-100 dark:bg-zinc-900 cursor-pointer overflow-hidden">
                            <Image
                                src={getOptimizedUrl(post.image)}
                                alt="Post"
                                fill
                                className="object-cover transition duration-300 group-hover:opacity-90"
                            />
                            {/* Hover Overlay Stats */}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold">
                                <div className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                    </svg>
                                    {post.likes?.length || 0}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showEditModal && profile && (
                <EditProfileModal
                    user={profile.user}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={handleProfileUpdate}
                />
            )}
        </div>
    );
}
