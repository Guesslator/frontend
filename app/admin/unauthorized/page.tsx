'use client';

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-neutral-100 p-4">
            <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl flex flex-col items-center max-w-md text-center">
                <div className="bg-red-500/20 p-4 rounded-full mb-6">
                    <ShieldAlert className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-neutral-400 mb-8">
                    You do not have the required permissions (SUPER_ADMIN) to access this area.
                </p>

                <div className="flex gap-4">
                    <Link
                        href="/"
                        className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-medium transition-colors"
                    >
                        Go Home
                    </Link>
                    <Link
                        href="/auth/logout" // Assuming logout route exists or logic
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
                    >
                        Log Out
                    </Link>
                </div>
            </div>
        </div>
    );
}
