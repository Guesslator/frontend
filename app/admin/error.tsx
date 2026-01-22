'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Admin Error Boundary caught:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <h2 className="text-xl font-bold text-red-500">Something went wrong!</h2>
            <p className="text-neutral-400 font-mono text-sm max-w-lg break-words">
                {error.message || 'Unknown error occurred'}
            </p>
            <button
                onClick={reset}
                className="px-4 py-2 bg-indigo-600 rounded text-white hover:bg-indigo-700"
            >
                Try again
            </button>
        </div>
    );
}
