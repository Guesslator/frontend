"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Play, Info, TrendingUp } from "lucide-react";
import { t } from "@/lib/i18n";

interface HeroItem {
  id: string;
  slug?: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface HeroSectionProps {
  items: HeroItem[];
  lang: string;
}

export default function HeroSection({ items, lang }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFirstMount, setIsFirstMount] = useState(true);

  useEffect(() => {
    setIsFirstMount(false);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 8000); // 8 seconds per slide
    return () => clearInterval(timer);
  }, [items.length]);

  // Reset index when items change to avoid out-of-bounds errors
  useEffect(() => {
    setCurrentIndex(0);
  }, [items]);

  if (!items.length) return null;

  const currentItem = items[currentIndex] || items[0];

  if (!currentItem) return null;

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.4 },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-background group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Background Image with Ken Burns effect */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: isFirstMount ? 1 : 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "linear" }}
          >
            <Image
              src={currentItem.imageUrl}
              alt={currentItem.title}
              fill
              priority={currentIndex === 0}
              fetchPriority={currentIndex === 0 ? "high" : undefined}
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>

          {/* ADAPTIVE OVERLAYS: The magic happens here */}

          {/* 1. Base Overlay for contrast maintenance */}
          <div className="absolute inset-0 bg-black/10 dark:bg-black/40 transition-colors duration-500" />

          {/* 2. Theme-aware Gradient (Left to Right on Desktop, Bottom to Top on Mobile) */}
          {/* Light Mode: White/Platinum Fade | Dark Mode: Navy/Black Fade */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-background via-background/60 to-transparent opacity-95 dark:opacity-90 transition-all duration-500" />

          {/* 3. Subtle Accent Glow */}
          <div className="absolute -left-[10%] -bottom-[20%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full pointer-events-none mix-blend-overlay" />
        </motion.div>
      </AnimatePresence>

      {/* Content Container */}
      <div className="relative z-20 h-full max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col justify-center md:pb-0 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            className="max-w-3xl space-y-6 md:pl-4"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Badge */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-3"
            >
              <span className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg shadow-primary/30">
                <TrendingUp size={14} strokeWidth={2.5} />
                {t(lang, "featured")}
              </span>
              <span className="flex items-center gap-1.5 bg-background/50 backdrop-blur-md border border-foreground/10 text-foreground/80 px-3 py-1 rounded-full text-xs font-medium tracking-wide">
                NEW ARRIVAL
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground leading-[1] tracking-tighter drop-shadow-sm dark:drop-shadow-2xl line-clamp-2 md:min-h-[7.5rem]"
            >
              {currentItem.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-2xl line-clamp-3"
            >
              {currentItem.description}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <Link
                href={`/${lang}/content/${currentItem.slug || currentItem.id}`}
                className="group relative inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
              >
                <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative flex items-center gap-2">
                  <Play fill="currentColor" size={18} />
                  {t(lang, "playNow")}
                </span>
              </Link>

              <Link
                href={`/${lang}/content/${currentItem.slug || currentItem.id}`}
                className="group flex items-center gap-2 px-6 py-4 rounded-full bg-background/40 border-2 border-primary/10 hover:border-primary/50 text-foreground backdrop-blur-sm transition-all font-semibold"
              >
                <Info
                  size={20}
                  className="text-primary group-hover:scale-110 transition-transform"
                />
                <span>{t(lang, "moreInfo")}</span>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-0 w-full px-6 md:px-12">
          <div className="flex items-center gap-2 md:pl-4">
            {items.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-8 bg-primary shadow-glow"
                    : "w-2 bg-foreground/20 hover:bg-foreground/40"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
