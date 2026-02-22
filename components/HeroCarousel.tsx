"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
                    transition={{ duration: 0.5 }}
                    drag={isMobile ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                >
                    {/* Background Image Container */}
                    <div className="absolute inset-0 bg-background">
                        <div className="relative w-full h-full overflow-hidden">
                            <Image
                                src={currentItem.imageUrl}
                                alt={currentItem.title}
                                width={1920}
                                height={1080}
                                priority={currentIndex === 0}
                                unoptimized={isYouTube}
                                className="w-full h-full object-cover"
                                sizes="(max-width: 768px) 100vw, 1200px"
                                quality={75}
                            />

                            {/* Overlays */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_120%)]" />
                            <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" />
                            <div className="absolute inset-0 bg-linear-to-r from-background/60 via-transparent to-transparent" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 z-20 flex flex-col justify-end pb-16 md:pb-24 lg:pb-32 pt-20 px-4 md:px-12 pointer-events-none">
                        <div className="w-full max-w-[1400px] mx-auto pointer-events-auto">
                            <div className="max-w-4xl space-y-4 md:space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/20">
                                        <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-primary">
                                            {t(lang, "featured") || "FEATURED"}
                                        </span>
                                    </div>
                                </div>

                                <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tighter drop-shadow-2xl">
                                    {currentItem.title}
                                </h2>

                                <div className="flex items-center gap-4 text-sm md:text-base font-medium text-gray-300">
                                    <span className="flex items-center gap-1">
                                        <Play size={14} className="fill-current" /> {currentItem.quizType || "Quiz"}
                                    </span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                                    <span>{currentItem.questionCount || 0} Questions</span>
                                </div>

                                <p className="text-base sm:text-lg md:text-xl text-gray-200 font-normal leading-relaxed max-w-2xl line-clamp-3">
                                    {currentItem.description}
                                </p>

                                <div className="flex flex-wrap items-center gap-3 md:gap-4 pt-4">
                                    <Link
                                        href={`/${lang}/content/${currentItem.id}`}
                                        className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 flex items-center gap-2"
                                    >
                                        <Play fill="currentColor" size={18} />
                                        <span>{t(lang, "playNow")}</span>
                                    </Link>
                                    <Link
                                        href={`/${lang}/content/${currentItem.id}`}
                                        className="px-8 py-4 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md hover:bg-white/20 text-white transition-all font-semibold text-lg"
                                    >
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
