"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
    const params = useParams();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                const res = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                });

                if (res?.error) {
                    setError("Invalid email or password");
                } else {
                    router.push(`/${params.lang}`);
                    router.refresh();
                }
            } else {
                const res = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, name }),
                });

                if (res.ok) {
                    // Auto login after register or ask to login
                    // For better UX, let's switch to login and pre-fill
                    setIsLogin(true);
                    setError("Registration successful! Please log in.");
                    // Optionally auto-login here
                } else {
                    const data = await res.json();
                    setError(data.message || "Registration failed");
                }
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
            {/* Dynamic Background */}
            <motion.div
                animate={{
                    background: isLogin
                        ? "radial-gradient(circle at center, rgba(220,38,38,0.15) 0%, rgba(0,0,0,0) 70%)"
                        : "radial-gradient(circle at center, rgba(37,99,235,0.15) 0%, rgba(0,0,0,0) 70%)"
                }}
                transition={{ duration: 1 }}
                className="absolute inset-0 blur-3xl"
            />

            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-neutral-900/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative z-10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                        {isLogin ? "Welcome Back" : "Join the Club"}
                    </h1>
                    <p className="text-neutral-400 text-sm">
                        {isLogin ? "Enter your details to access your quizzes" : "Create an account to verify your score"}
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-lg text-sm text-center mb-6 border ${error.includes("successful") ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <AnimatePresence mode="popLayout">
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors placeholder-neutral-700"
                                    placeholder="John Doe"
                                    required
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none transition-colors placeholder-neutral-700 ${isLogin ? 'focus:border-red-600 focus:ring-red-600' : 'focus:border-blue-600 focus:ring-blue-600'}`}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none transition-colors placeholder-neutral-700 ${isLogin ? 'focus:border-red-600 focus:ring-red-600' : 'focus:border-blue-600 focus:ring-blue-600'}`}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg ${isLogin
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                            } disabled:opacity-50 disabled:cursor-not-allowed mt-4`}
                    >
                        {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
                    </motion.button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-neutral-500 text-sm mb-3">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                    </p>
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError("");
                        }}
                        className={`text-sm font-bold transition-colors ${isLogin ? 'text-red-500 hover:text-red-400' : 'text-blue-500 hover:text-blue-400'}`}
                    >
                        {isLogin ? "Create an account" : "Sign in to existing account"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
