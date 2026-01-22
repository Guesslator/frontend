"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileQuestion, Flag, Activity, Settings, ShieldAlert, FileText } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming utils exists, usually standard in shadcn/tailwind projects. If not, I'll use simple class string.

const NAV_ITEMS = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Quizzes", href: "/admin/quizzes", icon: FileQuestion },
    { label: "Reports", href: "/admin/reports", icon: Flag },
    // { label: "Analytics", href: "/admin/analytics", icon: Activity },
    { label: "System Health", href: "/admin/health", icon: ShieldAlert },
    { label: "Audit Logs", href: "/admin/audits", icon: FileText },
    { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ role }: { role: string }) {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 backdrop-blur-xl p-6 flex flex-col gap-6">
            <div className="flex items-center gap-2 px-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30">
                    A
                </div>
                <div>
                    <h1 className="font-bold text-lg tracking-tight">Admin</h1>
                    <p className="text-xs text-neutral-500 uppercase tracking-wider">{role.replace('_', ' ')}</p>
                </div>
            </div>

            <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-neutral-800">
                <p className="text-xs text-neutral-600 px-2">v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}</p>
            </div>
        </aside>
    );
}
