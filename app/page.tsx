"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LANGUAGES, languageNames, languageGreetings } from "@/lib/i18n";

const languages = LANGUAGES.map((code) => ({
  code,
  name: languageNames[code] || code,
  greeting: languageGreetings[code] || "Welcome",
}));

export default function LanguageSelectionPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background transition-colors duration-500">
      {/* Background Ambience - Cinematic Spotlight */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full animate-spotlight pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_var(--background)_80%)]" />
      </div>

      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center mb-12 mt-8 z-10"
      >
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/50 mb-4 drop-shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">
          GUESSALATOR
        </h1>
        <p className="text-muted-foreground text-xs md:text-sm tracking-[0.4em] uppercase font-black opacity-80">
          The Ultimate Cinematic Quiz
        </p>
      </motion.div>

      <div className="w-full max-w-7xl z-10 overflow-y-auto max-h-[70vh] px-4 custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-24">
          {languages.map((lang, index) => (
            <Link
              key={lang.code}
              href={`/${lang.code}`}
              className="block w-full"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                whileTap={{ scale: 0.98 }}
                className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer border border-white/5 bg-card/30 backdrop-blur-md hover:border-primary/50 transition-all duration-500 shadow-2xl"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 z-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                </div>

                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/80 z-0" />

                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6">
                  <span className="text-xl font-black mb-4 text-primary border border-primary/20 rounded-lg px-4 py-1.5 bg-primary/5 uppercase tracking-widest group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-500 shadow-xl">
                    {lang.code}
                  </span>
                  <h2 className="text-xl font-black text-foreground mb-1 group-hover:text-primary transition-colors text-center line-clamp-1">
                    {lang.name}
                  </h2>
                  <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase opacity-60 group-hover:opacity-100 transition-all text-center">
                    {lang.greeting}
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      <footer className="absolute bottom-4 text-muted-foreground text-[10px] md:text-xs uppercase tracking-widest flex gap-4 bg-background/80 backdrop-blur-sm py-2 px-4 rounded-full border border-border/50 shadow-sm z-50">
        <span>Experience the thrill</span>
        <span className="text-foreground/50">|</span>
        <Link
          href="/admin"
          className="hover:text-foreground transition-colors font-medium"
        >
          Admin
        </Link>
      </footer>
    </main>
  );
}
