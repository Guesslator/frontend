"use client";

import { useState } from "react";
import { banUser } from "@/lib/adminApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Shield, ShieldAlert, Ban, CheckCircle } from "lucide-react";

interface UserRowProps {
    user: any;
    token: string;
}

export default function UserRow({ user, token }: UserRowProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleBanToggle = async () => {
        setIsLoading(true);
        try {
            await banUser(user.id, !user.isBanned, token);
            toast.success(user.isBanned ? "User unbanned" : "User banned");
            router.refresh();
        } catch (e) {
            toast.error("Action failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <tr className={`border-b border-neutral-800 transition-colors ${user.isBanned ? 'bg-red-900/10 hover:bg-red-900/20' : 'hover:bg-neutral-800/30'}`}>
            <td className="px-6 py-4">
                <div className="flex flex-col">
                    <span className={`font-medium ${user.isBanned ? 'text-red-300' : 'text-neutral-200'}`}>
                        {user.email}
                    </span>
                    <span className="text-xs text-neutral-500">{user.name || 'No Name'}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-xs border inline-flex items-center gap-1 ${user.role === 'SUPER_ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    user.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        'bg-neutral-800 text-neutral-400 border-neutral-700'
                    }`}>
                    {user.role === 'SUPER_ADMIN' && <ShieldAlert size={10} />}
                    {user.role === 'ADMIN' && <Shield size={10} />}
                    {user.role}
                </span>
            </td>
            <td className="px-6 py-4">
                {user.isBanned ? (
                    <span className="inline-flex items-center gap-1 text-red-400 text-xs font-bold px-2 py-0.5 bg-red-400/10 rounded-full">
                        <Ban size={10} /> Banned
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 text-green-400 text-xs font-bold px-2 py-0.5 bg-green-400/10 rounded-full">
                        <CheckCircle size={10} /> Active
                    </span>
                )}
            </td>
            <td className="px-6 py-4 text-xs text-neutral-500">
                {user._count?.createdContent} quizzes<br />
                {user._count?.scores} plays
            </td>
            <td className="px-6 py-4 text-xs text-neutral-500">
                {new Date(user.createdAt).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                    <button
                        onClick={handleBanToggle}
                        disabled={isLoading || user.role === 'SUPER_ADMIN'}
                        className={`text-xs px-3 py-1.5 rounded transition-colors border ${user.isBanned
                            ? 'bg-green-600/10 text-green-400 border-green-600/20 hover:bg-green-600/20'
                            : 'bg-red-600/10 text-red-400 border-red-600/20 hover:bg-red-600/20'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isLoading ? '...' : user.isBanned ? 'Activate' : 'Deactivate'}
                    </button>
                </div>
            </td>
        </tr>
    );
}
