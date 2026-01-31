'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Image from 'next/image';
import CreatePostModal from './CreatePostModal';

export default function Navigation() {
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
            href: '#',
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
        <>
            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-0 left-0 w-full bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 z-50 px-4 py-3 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold tracking-wide font-instagram">Instagram</Link>
                <div className="flex items-center gap-4">
                    {/* Add placeholder for notifications or chats if needed */}
                    <button onClick={logout} className="text-sm font-medium text-zinc-500">Log out</button>
                </div>
            </div>

            {/* Desktop Left Sidebar */}
            <div className="hidden md:flex fixed left-0 top-0 h-full w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black z-50 flex-col p-4 transition-all">
                {/* Logo */}
                <div className="mb-8 pl-4 pt-4">
                    <Link href="/" className="block">
                        <h1 className="text-2xl font-bold tracking-wide">Instagram</h1>
                    </Link>
                </div>

                {/* Nav Items */}
                <nav className="space-y-2 flex-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        if (item.onClick) {
                            return (
                                <button
                                    key={item.name}
                                    onClick={item.onClick}
                                    className={`w-full flex items-center gap-4 p-3 rounded-lg transition group hover:bg-zinc-100 dark:hover:bg-zinc-900`}
                                >
                                    {item.icon(false)}
                                    <span>{item.name}</span>
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-4 p-3 rounded-lg transition group ${isActive ? 'font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                            >
                                {item.icon(isActive)}
                                <span>{item.name}</span>
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
                    <span>Log out</span>
                </button>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800 z-50 flex justify-around items-center px-1 py-3 pb-safe-area">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    // For Bottom Nav, we don't show text, just icons.
                    if (item.onClick) {
                        return (
                            <button key={item.name} onClick={item.onClick} className="p-2">
                                {item.icon(false)}
                            </button>
                        )
                    }
                    return (
                        <Link key={item.name} href={item.href} className="p-2">
                            {item.icon(isActive)}
                        </Link>
                    )
                })}
            </div>

            {showCreateModal && (
                <CreatePostModal
                    onClose={() => setShowCreateModal(false)}
                    onPostCreated={() => {
                        window.location.reload();
                    }}
                />
            )}
        </>
    );
}
