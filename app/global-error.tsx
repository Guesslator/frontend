"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
                    <div className="text-center max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
                        <div className="bg-red-900/20 text-red-200 p-4 rounded-lg mb-6 text-sm overflow-auto max-h-40">
                            {error.message || "Unknown error"}
                        </div>
                        <button
                            onClick={() => reset()}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
