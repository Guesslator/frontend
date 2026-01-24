"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginClient({ lang = "en" }: { lang?: string }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    // Mounted guard to prevent hydration mismatch from browser extensions
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Invalid credentials");
        } else {
            router.push("/");
            router.refresh();
        }
    };

    // Prevent hydration mismatch by rendering simpler or null before mount if critical
    // However, with ssr: false in the parent, this component effectively mounts on client only.
    // The mounted check is double safety for extensions interacting immediately.

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden transition-colors duration-300">
            <div className="absolute inset-0 bg-primary/10 blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-card/80 backdrop-blur-md p-8 rounded-2xl border border-border shadow-2xl relative z-10"
            >
                <h1 className="text-3xl font-black text-foreground mb-2 text-center">Welcome Back</h1>
                <p className="text-muted-foreground text-center mb-8">Sign in to continue your quiz journey</p>

                {error && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm text-center mb-6 border border-destructive/20">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
                        {/* Extension-safe: Render input only after mount if strict safety needed, 
                            but ssr: false handles main mismatch. explicit autocomplete helps too. */}
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-background/50 border border-input rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-muted-foreground"
                            placeholder="you@example.com"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-background/50 border border-input rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-muted-foreground"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg transition-colors shadow-lg shadow-primary/20"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link href={`/${lang}/auth/register`} className="text-foreground hover:text-primary font-medium transition-colors">
                        Register
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
