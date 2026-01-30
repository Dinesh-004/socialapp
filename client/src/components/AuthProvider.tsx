'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

import Sidebar from '@/components/Sidebar';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user, checkAuth, isLoading } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isLoading) return null; // Or a loading spinner

    if (user) {
        return (
            <div className="flex min-h-screen bg-white dark:bg-black text-black dark:text-white">
                <Sidebar />
                <div className="flex-1 ml-20 md:ml-64 transition-all duration-300">
                    {children}
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
