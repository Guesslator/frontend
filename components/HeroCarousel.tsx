"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
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

interface HeroCarouselProps {
    items: HeroItem[];
    lang: string;
    initialIndex?: number;
}

export default function HeroCarousel({ items, lang, initialIndex = 0 }: HeroCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isMobile, setIsMobile] = useState(false);

    // Auto-advance
    useEffect(() => {
        if (items.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [items.length]);

    // Handle Resize
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    if (!items.length) return null;

    const currentItem = items[currentIndex];
    // YouTube Detection
    const isYouTube = currentItem.imageUrl.includes('youtube.com') || currentItem.imageUrl.includes('ytimg.com');

    const getQuizTypeLabel = (type?: string) => {
        if (!type) return t(lang, "quiz");
        switch (type) {
            case "VIDEO": return t(lang, "videoQuiz");
            case "IMAGE": return t(lang, "imageQuiz");
            case "AUDIO": return t(lang, "audioQuiz");
            default: return t(lang, "standardQuiz");
        }
    };

    const handleDragEnd = (event: any, info: any) => {
        const threshold = 50;
        if (info.offset.x < -threshold) {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        } else if (info.offset.x > threshold) {
            setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
        }
    };

    return (
        <div className="absolute inset-0 z-10 w-full h-full">
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={currentItem.id}
                    className="absolute inset-0 w-full h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    drag={isMobile ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                >
                    {/* Background Image Container with Ken Burns Zoom */}
                    <motion.div
                        className="absolute inset-0 bg-background"
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 10, ease: "linear" }}
                    >
                        <div className="relative w-full h-full overflow-hidden">
                            <Image
                                src={currentItem.imageUrl}
                                alt={currentItem.title}
                                fill
                                priority={currentIndex === 0}
                                unoptimized={isYouTube}
                                className="object-cover"
                                sizes="100vw"
                                quality={85}
                            />

                            {/* Overlays - Matching Server Component exactly */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_120%)]" />
                            <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
                            <div className="absolute inset-0 bg-linear-to-r from-background/60 via-transparent to-transparent" />
                        </div>
                    </motion.div>

                    {/* Content */}
                    <div className="absolute inset-0 z-20 flex flex-col justify-end pb-16 md:pb-24 lg:pb-32 pt-20 px-4 md:px-12 pointer-events-none">
                        <div className="w-full max-w-[1400px] mx-auto pointer-events-auto">
                            <div className="max-w-4xl space-y-4 md:space-y-6 lg:space-y-8">

                                <motion.h2
                                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.15] tracking-tight drop-shadow-xl"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
                                >
                                    {currentItem.title}
                                </motion.h2>

                                <motion.div
                                    className="flex items-center gap-4 text-xs md:text-sm font-bold"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ delay: 0.05, duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
                                >
                                    <span className="flex items-center gap-1.5 text-primary/70 dark:text-primary/70">
                                        <Play size={12} className="fill-current" /> {getQuizTypeLabel(currentItem.quizType)}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-foreground/10 dark:bg-white/10" />
                                    <span className="text-foreground/60 dark:text-gray-500">{currentItem.questionCount || 0} {t(lang, "questions")}</span>
                                </motion.div>

                                <motion.p
                                    className="text-sm md:text-base lg:text-lg text-foreground/70 dark:text-gray-400 font-normal leading-loose max-w-2xl line-clamp-3 md:line-clamp-4"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ delay: 0.1, duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
                                >
                                    {currentItem.description}
                                </motion.p>

                                <motion.div
                                    className="flex flex-wrap items-center gap-4 md:gap-6 pt-6"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ delay: 0.15, duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
                                >
                                    <Link
                                        href={`/${lang}/content/${currentItem.id}`}
                                        className="px-7 py-3 rounded-xl bg-primary text-[#0F0F12] font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/10 flex items-center gap-2.5"
                                    >
                                        <Play fill="currentColor" size={18} />
                                        <span>{t(lang as any, "playNow")}</span>
                                    </Link>
                                    <Link
                                        href={`/${lang}/content/${currentItem.id}`}
                                        className="px-7 py-3 rounded-xl bg-foreground/5 dark:bg-white/5 border border-foreground/10 dark:border-white/10 backdrop-blur-md hover:bg-foreground/10 dark:hover:bg-white/10 text-foreground/90 dark:text-white/90 transition-all font-semibold text-lg"
                                    >
                                        <span>{t(lang as any, "moreInfo")}</span>
                                    </Link>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Indicators */}
            <div className="absolute bottom-8 left-0 w-full z-30">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex gap-2">
                    {items.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-8 bg-primary" : "w-2 bg-white/30 hover:bg-white/50"}`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
