"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { t, Language } from "@/lib/i18n";

export default function AuthPage() {
  const params = useParams();
  const lang = params.lang as Language;
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
          setError(t(lang, "invalidEmailPassword"));
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
          setError(t(lang, "registrationSuccess"));
          // Optionally auto-login here
        } else {
          const data = await res.json();
          setError(data.message || t(lang, "registrationFailed"));
        }
      }
    } catch (err) {
      setError(t(lang, "unexpectedError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden transition-colors duration-1000">
      {/* Dynamic Premium Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.15)_0%,rgba(0,0,0,0)_80%)] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
      </div>

      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
        className="w-full max-w-md bg-background/40 backdrop-blur-2xl p-8 md:p-10 rounded-3xl border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative z-10 before:absolute before:inset-0 before:rounded-3xl before:bg-linear-to-b before:from-white/5 before:to-transparent before:pointer-events-none"
      >
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {isLogin ? t(lang, "welcomeBack") : t(lang, "joinClub")}
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            {isLogin ? t(lang, "enterDetails") : t(lang, "createAccountVerify")}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg text-sm text-center mb-6 border ${error.includes("successful") ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}
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
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                  {t(lang, "name")}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-14 bg-background/50 backdrop-blur-md border border-white/5 rounded-2xl px-5 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground/50 hover:bg-white/5"
                  placeholder="John Doe"
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">
              {t(lang, "emailLabel")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 bg-background/50 backdrop-blur-md border border-white/5 rounded-2xl px-5 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground/50 hover:bg-white/5"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">
              {t(lang, "passwordLabel")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 bg-background/50 backdrop-blur-md border border-white/5 rounded-2xl px-5 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground/50 hover:bg-white/5"
              placeholder="••••••••"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="group relative overflow-hidden w-full font-bold text-[15px] tracking-widest uppercase transition-all duration-700 bg-primary text-primary-foreground px-8 py-4 rounded-full flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-full">
              <div className="absolute top-0 -inset-full h-full w-[150%] z-5 block transform -skew-x-12 bg-linear-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer" />
            </div>
            <span className="relative z-10 transition-transform duration-500">
              {loading
                ? t(lang, "processing")
                : isLogin
                  ? t(lang, "signInBtn")
                  : t(lang, "createAccountBtn")}
            </span>
          </motion.button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-muted-foreground font-medium text-sm mb-3">
            {isLogin
              ? t(lang, "dontHaveAccount")
              : t(lang, "alreadyHaveAccount")}
          </p>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-sm font-bold tracking-wide transition-all duration-300 text-foreground hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left pb-1 cursor-pointer"
          >
            {isLogin
              ? t(lang, "createAccountLink")
              : t(lang, "signInExistingLink")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
