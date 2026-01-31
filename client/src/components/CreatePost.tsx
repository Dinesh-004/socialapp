'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';

export default function CreatePost({ onPostCreated }: { onPostCreated: () => void }) {
    const { user } = useAuthStore();
    const [caption, setCaption] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [aspectRatio, setAspectRatio] = useState<'square' | 'portrait' | 'landscape'>('portrait');
    const [aspectRatioValue, setAspectRatioValue] = useState<number>(0.8);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !caption) return;

        setIsLoading(true);
        setError(null);

        try {
            // Upload to Openinary
            const formData = new FormData();
            formData.append('file', file);

            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const imageUrl = res.data.url; // Assign the URL from the response

            // Create Post on Server
            await api.post('/posts', {
                caption,
                image: imageUrl,
                aspectRatio,
                aspectRatioValue
                // rotation - Removed, we rotate the file itself now
            });

            setCaption('');
            setFile(null);
            setAspectRatio('portrait');
            setAspectRatioValue(0.8);
            onPostCreated(); // Refresh feed
        } catch (err) {
            console.error(err);
            setError('Failed to create post. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    // Helper to process/rotate image file
    const processImageFile = async (file: File, degrees: number = 0): Promise<File> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject('No canvas context');

                // Browser auto-handles EXIF orientation in img.width/height
                // So img.width is the *visual* width.

                // Swap dimensions if rotating 90 or 270 explicitly relative to current visual state
                if (degrees % 180 !== 0) {
                    canvas.width = img.height;
                    canvas.height = img.width;
                } else {
                    canvas.width = img.width;
                    canvas.height = img.height;
                }

                // Translate & Rotate
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate((degrees * Math.PI) / 180);
                ctx.drawImage(img, -img.width / 2, -img.height / 2);

                canvas.toBlob((blob) => {
                    if (!blob) return reject('Canvas to Blob failed');
                    // Create new file, strictly strictly enforcing jpeg can help, but file.type is fine
                    const newFile = new File([blob], file.name, { type: file.type });
                    resolve(newFile);
                }, file.type);
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 mb-8 w-full max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4">Create Post</h3>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg resize-none outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What's on your mind?"
                    rows={3}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                />

                {/* Aspect Ratio Selector */}
                {file && (
                    <div className="flex gap-2 mb-4">
                        {(['square', 'portrait', 'landscape'] as const).map((ratio) => (
                            <button
                                key={ratio}
                                type="button"
                                onClick={() => {
                                    setAspectRatio(ratio);
                                    // Set default values for manual selection if needed, 
                                    // but usually we rely on auto-detect. 
                                    // If user forces a change, we might want to force a standard ratio.
                                    if (ratio === 'square') setAspectRatioValue(1);
                                    if (ratio === 'portrait') setAspectRatioValue(0.8);
                                    if (ratio === 'landscape') setAspectRatioValue(1.91);
                                }}
                                className={`px-3 py-1 text-sm rounded-full border transition-colors ${aspectRatio === ratio
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                    }`}
                            >
                                {ratio.charAt(0).toUpperCase() + ratio.slice(1)}
                            </button>
                        ))}
                    </div>
                )}

                {/* Image Preview */}
                {file && (
                    <div className="relative w-full rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-4"
                        style={{ aspectRatio: aspectRatioValue }}
                    >
                        <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="absolute inset-0 w-full h-full object-cover"
                        // Removed CSS transform since we rotate the actual file
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={async () => {
                                    if (!file) return;
                                    setIsLoading(true); // Show loading state briefly
                                    try {
                                        const newFile = await processImageFile(file, 90);
                                        setFile(newFile);

                                        // Recalculate Aspect Ratio
                                        const img = new Image();
                                        img.onload = () => {
                                            const ratio = img.width / img.height;
                                            setAspectRatioValue(ratio);
                                            // Heuristics for labels
                                            if (Math.abs(ratio - 1) < 0.1) setAspectRatio('square');
                                            else if (ratio > 1) setAspectRatio('landscape');
                                            else setAspectRatio('portrait');
                                        };
                                        img.src = URL.createObjectURL(newFile);
                                    } catch (err) {
                                        console.error('Rotation failed', err);
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    {/* Rotate Icon */}
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFile(null)}
                                className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setFile(file);
                                // Auto-detect aspect ratio from the raw file URL
                                // (Note: URL.createObjectURL often respects EXIF in img tags, which helps preview)
                                const img = new Image();
                                img.onload = () => {
                                    const ratio = img.width / img.height;
                                    setAspectRatioValue(ratio);

                                    if (Math.abs(ratio - 1) < 0.1) setAspectRatio('square');
                                    else if (ratio > 1) setAspectRatio('landscape');
                                    else setAspectRatio('portrait');
                                };
                                img.src = URL.createObjectURL(file);
                            }
                        }}
                        className="text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                    />

                    <button
                        type="submit"
                        disabled={isLoading || !file || !caption}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </form>
        </div>
    );
}
