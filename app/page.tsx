"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

const languages = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', greeting: 'Hoşgeldiniz' },
  { code: 'en', name: 'English', flag: '🇬🇧', greeting: 'Welcome' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', greeting: 'Willkommen' },
];

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
        className="text-center mb-16 z-10"
      >
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-primary mb-4 drop-shadow-2xl">
          GUESSALATOR
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl tracking-widest uppercase font-light">
          The Ultimate Cinematic Quiz
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl z-10">
        {languages.map((lang, index) => (
          <Link key={lang.code} href={`/${lang.code}`} className="block w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors duration-500 shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-0" />

              {/* Hover Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 to-transparent" />

              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6">
                <span className="text-7xl mb-6 filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {lang.flag}
                </span>
                <h2 className="text-3xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {lang.name}
                </h2>
                <p className="text-muted-foreground text-sm font-light tracking-wider group-hover:text-foreground transition-colors">
                  {lang.greeting}
                </p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <footer className="absolute bottom-8 text-muted-foreground text-xs uppercase tracking-widest flex gap-4">
        <span>Experience the thrill</span>
        <span className="text-foreground">|</span>
        <Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link>
      </footer>
    </main>
  );
}
