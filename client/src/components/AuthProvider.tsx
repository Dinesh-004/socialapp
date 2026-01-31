'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import Navigation from '@/components/Navigation';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user, checkAuth, isLoading } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isLoading) return null;

    if (user) {
        return (
            <div className="flex min-h-screen bg-white dark:bg-black text-black dark:text-white">
                <Navigation />
                {/* 
                   Desktop: ml-64 (Sidebar width)
                   Mobile: ml-0, pt-16 (Top bar), pb-16 (Bottom bar)
                */}
                <div className="flex-1 ml-0 md:ml-64 pt-16 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pt-0 md:pb-0 transition-all duration-300">
                    <div className="max-w-screen-lg mx-auto">
                        {children}
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
