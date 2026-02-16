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
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background transition-colors duration-300">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />

      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8 mt-8 z-10"
      >
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-primary mb-2 drop-shadow-2xl">
          GUESSALATOR
        </h1>
        <p className="text-muted-foreground text-sm md:text-base tracking-widest uppercase font-light">
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
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group relative h-40 rounded-xl overflow-hidden cursor-pointer border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors duration-300 shadow-md"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-0" />

                {/* Hover Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 to-transparent" />

                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
                  <span className="text-2xl font-black mb-3 text-primary border-2 border-primary/30 rounded-lg px-3 py-1 bg-primary/5 uppercase tracking-wider backdrop-blur-sm group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 shadow-sm">
                    {lang.code}
                  </span>
                  <h2 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors text-center line-clamp-1">
                    {lang.name}
                  </h2>
                  <p className="text-muted-foreground text-xs font-light tracking-wider group-hover:text-foreground transition-colors text-center">
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
