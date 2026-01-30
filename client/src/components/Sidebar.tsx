'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Image from 'next/image';
import CreatePostModal from './CreatePostModal';

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const [showCreateModal, setShowCreateModal] = useState(false);

    if (!user) return null;

    const navItems = [
        {
            name: 'Home',
            href: '/',
            icon: (active: boolean) => (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 2} className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
            )
        },
        {
            name: 'Search',
            href: '/explore',
            icon: (active: boolean) => (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 3 : 2} className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
            )
        },
        {
            name: 'Create',
            href: '#', // Dummy href
            icon: (active: boolean) => (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 2} className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            ),
            onClick: () => setShowCreateModal(true)
        },
        {
            name: 'Profile',
            href: `/profile/${user.username}`,
            icon: (active: boolean) => (
                <div className={`w-7 h-7 rounded-full overflow-hidden border-2 ${active ? 'border-black dark:border-white' : 'border-transparent'}`}>
                    {user.profilePic ? (
                        <Image src={user.profilePic} alt="Profile" width={28} height={28} className="object-cover w-full h-full" />
                    ) : (
                        <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                            {user.username[0].toUpperCase()}
                        </div>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="fixed left-0 top-0 h-full w-20 md:w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black z-50 flex flex-col p-4 transition-all">
            {/* Logo */}
            <div className="mb-8 pl-2 md:pl-4 pt-4">
                <Link href="/" className="block">
                    {/* Desktop Text Logo */}
                    <h1 className="hidden md:block text-2xl font-bold tracking-wide">Instagram</h1>
                    {/* Mobile Icon Logo */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 md:hidden">
                        <path d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15zm4.125 3a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zm-3.873 8.703a4.126 4.126 0 017.746 0 .75.75 0 01-.351.92 7.47 7.47 0 01-3.522.877 7.47 7.47 0 01-3.522-.877.75.75 0 01-.351-.92zM15 8.25a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" />
                    </svg>
                </Link>
            </div>

            {/* Nav Items */}
            <nav className="space-y-2 flex-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    // Handle special click items like Create
                    if (item.onClick) {
                        return (
                            <button
                                key={item.name}
                                onClick={item.onClick}
                                className={`w-full flex items-center gap-4 p-3 rounded-lg transition group hover:bg-zinc-100 dark:hover:bg-zinc-900`}
                            >
                                {item.icon(false)}
                                <span className="hidden md:block">{item.name}</span>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-4 p-3 rounded-lg transition group ${isActive ? 'font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900'
                                }`}
                        >
                            {item.icon(isActive)}
                            <span className="hidden md:block">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <button
                onClick={logout}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition text-left mt-auto"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                <span className="hidden md:block">Log out</span>
            </button>

            {showCreateModal && (
                <CreatePostModal
                    onClose={() => setShowCreateModal(false)}
                    onPostCreated={() => {
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}
