"use client";

import { useState } from "react";
import { setFlag } from "@/lib/adminApi";
import { toast } from "sonner"; // Assuming sonner is installed as seen in package.json
import { useRouter } from "next/navigation";

export default function FlagsTable({ initialFlags, token }: { initialFlags: any[], token: string }) {
    const [flags, setFlags] = useState(initialFlags);
    const router = useRouter();

    const handleToggle = async (key: string, currentValue: boolean) => {
        const newValue = !currentValue;
        // Optimistic
        setFlags(prev => prev.map(f => f.key === key ? { ...f, value: newValue } : f));

        try {
            await setFlag(key, newValue, token);
            toast.success(`Flag ${key} updated`);
            router.refresh();
        } catch (e) {
            setFlags(prev => prev.map(f => f.key === key ? { ...f, value: currentValue } : f));
            toast.error("Failed to update flag");
        }
    };

    return (
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-neutral-900/80 text-neutral-400 uppercase text-xs font-medium border-b border-neutral-800">
                    <tr>
                        <th className="px-6 py-3">Key</th>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3">Value</th>
                        <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                    {flags.map((flag) => (
                        <tr key={flag.key} className="hover:bg-neutral-800/30">
                            <td className="px-6 py-4 font-mono text-indigo-300">{flag.key}</td>
                            <td className="px-6 py-4 text-neutral-500">{flag.description || '-'}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${flag.value ? 'bg-green-500/10 text-green-500' : 'bg-neutral-800 text-neutral-500'}`}>
                                    {flag.value ? 'ENABLED' : 'DISABLED'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={() => handleToggle(flag.key, flag.value)}
                                    className="text-neutral-400 hover:text-white underline text-xs"
                                >
                                    Toggle
                                </button>
                            </td>
                        </tr>
                    ))}
                    {flags.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                                No feature flags defined.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
