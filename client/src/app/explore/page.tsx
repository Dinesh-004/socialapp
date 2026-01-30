'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/axios';

interface SearchResult {
    _id: string;
    username: string;
    fullName?: string;
    profilePic?: string;
}

export default function ExplorePage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim()) {
                setIsSearching(true);
                api.get(`/users/search/results?q=${query}`)
                    .then(res => setResults(res.data))
                    .catch(err => console.error(err))
                    .finally(() => setIsSearching(false));
            } else {
                setResults([]);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    const getOptimizedUrl = (url: string) => {
        if (!url || !url.includes('/t/')) return url;
        const parts = url.split('/t/');
        if (parts.length !== 2) return url;
        return `${parts[0]}/t/q_60/${parts[1]}`;
    };

    return (
        <div className="max-w-xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Explore</h1>

            <div className="relative mb-6">
                <input
                    type="text"
                    placeholder="Search"
                    className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-xl px-4 py-3 pl-11 focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-3.5 top-3.5 text-zinc-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
            </div>

            <div className="space-y-2">
                {results.map(user => (
                    <Link key={user._id} href={`/profile/${user.username}`}>
                        <div className="flex items-center gap-3 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg transition">
                            <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative shrink-0">
                                {user.profilePic ? (
                                    <Image
                                        src={getOptimizedUrl(user.profilePic)}
                                        alt={user.username}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold">
                                        {user.username[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="font-semibold">{user.username}</div>
                                <div className="text-sm text-zinc-500">{user.fullName || user.username}</div>
                            </div>
                        </div>
                    </Link>
                ))}

                {query && !isSearching && results.length === 0 && (
                    <div className="text-center text-zinc-500 py-8">
                        No results found.
                    </div>
                )}
            </div>
        </div>
    );
}
