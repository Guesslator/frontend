"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    // Toggle visibility based on scroll position - throttle/debounce for performance
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility, { passive: true });
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    whileHover={{
                        scale: 1.1,
                        y: -4,
                        transition: { type: "spring", stiffness: 400, damping: 10 }
                    }}
                    whileTap={{ scale: 0.9 }}
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-60 flex items-center justify-center pointer-events-auto"
                    aria-label="Scroll to top"
                >
                    {/* Main Button Container - Glassmorph Glow */}
                    <div className="relative group">
                        {/* Pulsing Aura */}
                        <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center overflow-hidden border border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/20 backdrop-blur-2xl shadow-2xl transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                            {/* Subtle Gradient Overlay */}
                            <div className="absolute inset-0 bg-linear-to-tr from-primary/10 to-purple-500/10 opacity-50 group-hover:opacity-100" />

                            <ChevronUp
                                className="relative z-10 transition-transform duration-500 group-hover:translate-y-[-2px]"
                                size={28}
                                strokeWidth={2.5}
                            />
                        </div>

                        {/* Top highlight shine */}
                        <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20 rounded-t-full pointer-events-none opacity-50 group-hover:opacity-0 transition-opacity" />
                    </div>
                </motion.button>
            )}
        </AnimatePresence>
    );
}
