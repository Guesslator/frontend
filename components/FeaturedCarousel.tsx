"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Play } from "lucide-react";

interface FeaturedItem {
    id: string;
    slug?: string;
    title: string;
    description: string;
    imageUrl: string;
}

interface FeaturedCarouselProps {
    items: FeaturedItem[];
    lang: string;
}

export default function FeaturedCarousel({ items, lang }: FeaturedCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (items.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [items.length]);

    if (!items.length) return null;

    const currentItem = items[currentIndex];

    return (
        <div className="relative w-full h-[60vh] md:h-[70vh] rounded-3xl overflow-hidden mb-16 group border border-border shadow-[0_25px_50px_-12px_#0A1F44] bg-background">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentItem.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear scale-105"
                        style={{ backgroundImage: `url(${currentItem.imageUrl})` }}
                    />

                    {/* Gradient Overlay - Removed white overlay per user request */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full md:w-2/3 z-20">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-primary/20">
                            Featured
                        </span>
                        <div className="flex gap-1">
                            {items.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-foreground' : 'w-2 bg-foreground/20'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-foreground mb-4 leading-tight drop-shadow-xl">
                        {currentItem.title}
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl mb-8 line-clamp-3 max-w-xl font-light leading-relaxed">
                        {currentItem.description}
                    </p>

                    <div className="flex gap-4">
                        <Link
                            href={`/${lang}/content/${currentItem.slug || currentItem.id}`}
                            className="flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-primary/20 group/btn"
                        >
                            <div className="bg-background text-primary rounded-full p-1 group-hover/btn:rotate-12 transition-transform">
                                <Play size={16} fill="currentColor" />
                            </div>
                            PLAY QUIZ
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Progress Bar for current slide */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-muted">
                <div key={currentIndex} className="h-full bg-primary origin-left animate-progress" />
            </div>
        </div>
    );
}
