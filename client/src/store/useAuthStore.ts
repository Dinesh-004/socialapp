import { create } from 'zustand';
import api from '@/lib/axios';

interface User {
    _id: string; // MongoDB ID
    id?: string; // Optional alias
    username: string;
    email: string;
    profilePic?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setToken: (token) => {
        localStorage.setItem('token', token || '');
        set({ token });
    },

    login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/auth/login', credentials);
            const { user, accessToken } = res.data;

            localStorage.setItem('token', accessToken);
            set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
            set({
                error: err.response?.data?.message || 'Login failed',
                isLoading: false
            });
            throw err;
        }
    },

    register: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/auth/signup', data);
            const { user, accessToken } = res.data;

            localStorage.setItem('token', accessToken);
            set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
            set({
                error: err.response?.data?.message || 'Registration failed',
                isLoading: false
            });
            throw err;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        set({ isLoading: true });
        const token = localStorage.getItem('token');

        if (!token) {
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
            return;
        }

        try {
            // Set token in state so axios interceptor picks it up (if configured) or we pass it manually
            // Assuming api interceptor reads from localStorage or store. 
            // If api helper reads from store, we need to set token first.
            // But api helper likely reads from localStorage or we rely on headers logic.
            // For now, let's assume api instance handles headers if token is in localStorage 
            // OR we need to recreate the axios instance's header. 
            // Let's set the token in state first just in case.
            set({ token });

            const res = await api.get('/auth/me');
            set({ user: res.data, isAuthenticated: true, isLoading: false });
        } catch (err) {
            console.error('Session restoration failed:', err);
            localStorage.removeItem('token');
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
    }
}));
