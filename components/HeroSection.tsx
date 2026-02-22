"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Play, Info } from "lucide-react";
import { t } from "@/lib/i18n";

interface HeroItem {
  id: string;
  slug?: string;
  title: string;
  description: string;
  imageUrl: string;
  questionCount?: number;
  quizType?: string;
}

interface HeroSectionProps {
  items: HeroItem[];
  lang: string;
}

export default function HeroSection({ items, lang }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 30, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 20 });

  // Handle mouse move for parallax
  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 20);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 20);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile, mouseX, mouseY]);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 8000); // 8 seconds per slide
    return () => clearInterval(timer);
  }, [items.length]);

  // Reset index when items change
  useEffect(() => {
    setCurrentIndex(0);
  }, [items]);

  if (!items.length) return null;

  const currentItem = items[currentIndex] || items[0];

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      // Swipe Left - Next
      setCurrentIndex((prev) => (prev + 1) % items.length);
    } else if (info.offset.x > threshold) {
      // Swipe Right - Prev
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }
  };

  return (
    <div className="relative w-full h-[80vh] min-h-[550px] overflow-hidden bg-background group touch-pan-y">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentItem.id}
          className="absolute inset-0 w-full h-full will-change-transform"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          drag={isMobile ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
        >
          {/* Background Image - Modern Cinematic Spotlight Design - Theme Adapted */}
          <div className="absolute inset-0 bg-background transition-colors duration-500">
            <motion.div
              className="relative w-full h-full will-change-transform"
              style={{
                scale: 1.1,
                x: springX,
                y: springY,
              }}
            >
              <Image
                src={currentItem.imageUrl}
                alt={currentItem.title}
                width={1920}
                height={1080}
                priority={currentIndex === 0}
                fetchPriority={currentIndex === 0 ? "high" : "auto"}
                className="w-full h-full object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                quality={70}
              />

              {/* Theme-aware Image Dimmer Overlay (Separated from image for better LCP) */}
              <div className="absolute inset-0 bg-black/15 hidden dark:block pointer-events-none" />

              {/* 1. Grain Texture: Subtle high-end texture - DEFERRED/CLEANER ON MOBILE */}
              {!isMobile && (
                <div
                  className="absolute inset-0 opacity-[0.07] dark:opacity-[0.15] mix-blend-overlay pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  }}
                />
              )}
            </motion.div>

            {/* 2. Spotlight Vignette: Focuses attention to center, hides edges */}
            {/* Creates a 'stage light' feel. Center is clearer, edges fade to background color. */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.8)_120%)] dark:bg-[radial-gradient(circle_at_center,transparent_10%,rgba(0,0,0,0.8)_110%)] mix-blend-normal" />

            {/* 3. Smooth Gradient Overlays for Text Readability */}
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent opacity-100 dark:opacity-90" />
            <div className="absolute inset-0 bg-linear-to-r from-background/90 via-transparent to-transparent opacity-80" />

            {/* 4. Color Grading Overlay: Adds a premium tint without washing out details */}
            <div className="absolute inset-0 bg-blue-900/10 dark:bg-blue-900/20 mix-blend-overlay" />
          </div>

          {/* Content Container */}
          <div className="absolute inset-0 z-20 flex flex-col justify-end pb-16 md:pb-24 lg:pb-32 pt-20 md:pt-32 pointer-events-none">
            <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 pointer-events-auto">
              <div className="max-w-4xl space-y-4 md:space-y-6 lg:space-y-8">
                {/* 1. Category/Tag Pill - Translucent Glass */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center gap-2 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full bg-background/80 dark:bg-white/10 backdrop-blur-md border border-foreground/5 dark:border-white/10 shadow-sm">
                    <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-primary"></span>
                    </span>
                    <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-foreground/70 dark:text-white/80">
                      {t(lang, "featured") || "FEATURED"}
                    </span>
                  </div>
                </motion.div>

                {/* 2. Title - Massive & dynamic with gradient text */}
                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-linear-to-r from-foreground to-foreground/80 dark:from-white dark:to-white/70 leading-[0.95] md:leading-[0.9] tracking-tighter drop-shadow-2xl">
                  {currentItem.title}
                </h1>

                {/* 3. Meta Data Row - Duration, Rating, etc. (Real Data) */}
                <div className="flex items-center gap-3 md:gap-4 text-xs md:text-base font-medium text-muted-foreground dark:text-gray-300">
                  <span className="flex items-center gap-1">
                    <Play
                      size={14}
                      className="fill-current w-3 h-3 md:w-4 md:h-4"
                    />{" "}
                    {currentItem.quizType || "Quiz"}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-current opacity-30" />
                  <span>{currentItem.questionCount || 0} Questions</span>
                  <span className="w-1 h-1 rounded-full bg-current opacity-30" />
                  <span className="px-1.5 py-0.5 rounded border border-current opacity-50 text-[10px]">
                    HD
                  </span>
                </div>

                {/* 4. Description - Limited width for readability */}
                <p className="text-base sm:text-lg md:text-xl text-foreground/80 dark:text-gray-200 font-normal leading-relaxed max-w-xl md:max-w-2xl line-clamp-3 md:line-clamp-4">
                  {currentItem.description}
                </p>

                {/* 5. Action Area - Primary CTA pops out */}
                <div className="flex flex-wrap items-center gap-3 md:gap-4 pt-2">
                  <Link
                    href={`/${lang}/content/${currentItem.id}`}
                    aria-label={`${t(lang, "playNow")}: ${currentItem.title}`}
                    className="group relative px-6 py-3 md:px-10 md:py-5 rounded-xl md:rounded-2xl bg-primary text-primary-foreground font-black text-base md:text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/30 overflow-hidden"
                  >
                    {/* Premium Shimmer Overlay */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                      <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-linear-to-r from-transparent via-white/40 to-transparent opacity-40 animate-shimmer" />
                    </div>

                    <div className="relative flex items-center gap-3">
                      <div className="p-1.5 bg-white/20 rounded-full">
                        <Play
                          fill="currentColor"
                          size={16}
                        />
                      </div>
                      <span>{t(lang, "playNow")}</span>
                    </div>
                  </Link>

                  <Link
                    href={`/${lang}/content/${currentItem.id}`}
                    aria-label={`${t(lang, "moreInfo")}: ${currentItem.title}`}
                    className="group relative px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl bg-background/40 dark:bg-white/5 border border-foreground/10 dark:border-white/10 backdrop-blur-md hover:bg-background/60 dark:hover:bg-white/10 text-foreground dark:text-white transition-all hover:scale-105 active:scale-95 font-semibold text-base md:text-lg overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-y-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
                    <span>{t(lang, "moreInfo")}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute bottom-8 left-0 w-full z-30">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex gap-2">
          {items.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex
                ? "w-8 bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                : "w-2 bg-white/30 hover:bg-white/50"
                } cursor-pointer`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
