'use client';

import CreatePost from './CreatePost';

interface CreatePostModalProps {
    onClose: () => void;
    onPostCreated: () => void;
}

export default function CreatePostModal({ onClose, onPostCreated }: CreatePostModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-transparent">
                <button
                    onClick={onClose}
                    className="absolute -top-10 right-0 text-white hover:text-zinc-200 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* We render CreatePost here. 
                    It has its own BG and Border, which works fine as the modal content. 
                */}
                <CreatePost onPostCreated={() => {
                    onPostCreated();
                    onClose();
                }} />
            </div>

            {/* Backdrop click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
}
