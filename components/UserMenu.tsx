"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { User, LogOut, Settings, ChevronDown, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { t, Language } from "@/lib/i18n";

export default function UserMenu({ lang }: { lang: string }) {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const validLang = (['tr', 'en', 'ar', 'de'].includes(lang) ? lang : 'en') as Language;

    if (!session?.user) {
        return (
            <Link href={`/${lang}/auth`}>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 rounded-xl transition-all backdrop-blur-md group shadow-sm hover:shadow-secondary/20"
                >
                    <User size={16} className="text-secondary group-hover:text-secondary-foreground transition-colors" />
                    <span className="font-bold text-sm text-secondary group-hover:text-secondary-foreground uppercase tracking-wider">
                        {t(validLang, 'login')}
                    </span>
                </motion.div>
            </Link>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors cursor-pointer"
            >
                <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xs shadow-md">
                    {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || "U"}
                </div>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                        <div className="p-3 border-b border-border bg-muted/50">
                            <p className="text-sm font-bold text-card-foreground truncate">{session.user.name || "User"}</p>
                            <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                        </div>

                        <div className="p-1">
                            <Link
                                href={`/${lang}/my-quizzes`}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
                            >
                                <List size={16} />
                                {t(validLang, 'myQuizzes')}
                            </Link>

                            {session.user.role === 'ADMIN' && (
                                <Link
                                    href={`/${lang}/admin`}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-warning hover:text-warning/80 hover:bg-warning/10 rounded-lg transition-colors mb-1 border-b border-border pb-2"
                                >
                                    <Settings size={16} />
                                    Admin Dashboard
                                </Link>
                            )}


                            <Link
                                href={`/${lang}/settings`}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
                            >
                                <Settings size={16} />
                                {t(validLang, 'settings')}
                            </Link>

                            <button
                                onClick={() => signOut()}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            >
                                <LogOut size={16} />
                                {t(validLang, 'logout')}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
