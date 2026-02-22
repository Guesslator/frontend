"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState, ReactNode } from "react";
import Image from "next/image";

interface ClientSideDetailEffectsProps {
    children: ReactNode;
}

export default function ClientSideDetailEffects({ children }: ClientSideDetailEffectsProps) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);

        if (isMobile) return;

        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set((e.clientX / window.innerWidth - 0.5) * 40);
            mouseY.set((e.clientY / window.innerHeight - 0.5) * 40);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("resize", checkMobile);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [isMobile, mouseX, mouseY]);

    return (
        <motion.div
            style={{
                "--mouse-x": useTransform(springX, (v) => `${v}px`),
                "--mouse-y": useTransform(springY, (v) => `${v}px`),
            } as any}
        >
            {/* Refined Ambient Background Lighting */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
                <div className="absolute top-0 right-[-10%] w-[60%] h-[70%] bg-primary/5 blur-[120px] rounded-full animate-pulse-slow mix-blend-screen" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[60%] bg-violet-500/5 blur-[120px] rounded-full animate-pulse-slow mix-blend-screen delay-700" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.03)_0%,transparent_70%)]" />
            </div>

            {children}
        </motion.div>
    );
}

import { translations, t } from "@/lib/i18n";

export function PremiumPoster({ src, alt, status, lang }: { src: string; alt: string; status?: string; lang: string }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const glazeX = useMotionValue(50);
    const glazeY = useMotionValue(50);
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 100, damping: 30 });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 100, damping: 30 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (typeof window !== "undefined" && window.innerWidth < 768) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        mouseX.set((x / rect.width) - 0.5);
        mouseY.set((y / rect.height) - 0.5);
        glazeX.set((x / rect.width) * 100);
        glazeY.set((y / rect.height) * 100);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const glazeBackground = useTransform(
        [glazeX, glazeY],
        ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.3) 0%, transparent 60%)`
    );

    return (
        <motion.div
            className="group/poster relative aspect-3/4 rounded-4xl p-[3px] bg-linear-to-br from-white/20 via-white/5 to-transparent shadow-[0_30px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(var(--primary-rgb),0.1)] preserve-3d cursor-pointer overflow-hidden border border-white/10 active:scale-[0.98] transition-all duration-500"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                perspective: 2000,
                backfaceVisibility: "hidden",
                transformStyle: "preserve-3d"
            }}
        >
            {/* Elegant Reflective Frame with Depth */}
            <div className="absolute inset-0 border border-white/20 rounded-4xl pointer-events-none z-50 bg-linear-to-br from-white/10 via-transparent to-transparent opacity-40" />
            <div className="absolute inset-px border border-black/40 rounded-4xl pointer-events-none z-50" />

            {/* Subtle Marquee Accent - Top (Integrated into frame) */}
            <div className="absolute top-[10px] left-[25%] right-[25%] h-px flex justify-between px-6 z-50 opacity-30">
                {[...Array(4)].map((_, i) => (
                    <div key={`t-${i}`} className="w-[1.5px] h-[1.5px] rounded-full bg-white shadow-[0_0_5px_white] animate-marquee-pulse" style={{ animationDelay: `${i * 0.5}s` }} />
                ))}
            </div>

            {/* Main Poster Container */}
            <div className="relative w-full h-full rounded-[2.2rem] overflow-hidden bg-zinc-950">
                <Image
                    src={src}
                    alt={alt}
                    fill
                    priority
                    fetchPriority="high"
                    className="object-cover contrast-[1.08] transition-all duration-1000 group-hover/poster:scale-110 group-hover/poster:rotate-1"
                    style={{ transform: "translateZ(0)" }}
                    sizes="(max-width: 768px) 100vw, 400px"
                />

                {/* Film Texture Overlay */}
                <div className="absolute inset-0 z-30 film-grain pointer-events-none opacity-[0.03]" />

                {/* Refined Lens Flare */}
                <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden opacity-10">
                    <div className="absolute top-0 -inset-full h-full w-[200%] bg-linear-to-r from-transparent via-white/10 to-transparent animate-cinema-sweep" />
                </div>

                {/* Sophisticated Vignette */}
                <div className="absolute inset-0 z-10 bg-linear-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover/poster:opacity-60 transition-all duration-1000 pointer-events-none" />
            </div>

            {/* Glaze Reflection */}
            <motion.div
                className="absolute inset-0 z-40 opacity-0 group-hover/poster:opacity-15 transition-opacity duration-1000 pointer-events-none"
                style={{
                    background: glazeBackground,
                    transform: "translateZ(40px) scale(1.15)"
                }}
            />

            {/* Refined Footer */}
            <div className="absolute inset-x-0 bottom-0 z-50 p-6 bg-linear-to-t from-black via-black/90 to-transparent flex flex-col items-center gap-1.5 translate-z-20">
                <div className="w-6 h-0.5 bg-primary/60 rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                <span className="text-[9px] font-black text-primary/90 uppercase tracking-[0.4em] drop-shadow-sm">
                    {t(lang as any, 'featuredExperience')}
                </span>
                {status && <span className="text-[7px] font-medium text-white/50 uppercase tracking-[0.2em]">{status}</span>}
            </div>

            <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent z-20" />

            {/* Inner Depth Glow Detail */}
            <div className="absolute inset-[10px] border border-white/5 rounded-4xl z-50 pointer-events-none opacity-10 group-hover/poster:opacity-40 transition-opacity duration-1000" />
        </motion.div>
    );
}

export function AnimatedHeading({ children, className, ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) {
    return (
        <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={className}
            {...props}
        >
            {children}
        </motion.h2>
    );
}

export function AnimatedQuestionCard({ children, className, idx, ...props }: { children: React.ReactNode, className?: string, idx: number, [key: string]: any }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedProgressBar({ progress, className, idx, statsColor }: { progress: number, className?: string, idx: number, statsColor: string }) {
    return (
        <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${progress}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 + (idx * 0.1) }}
            className={`h-full ${statsColor} shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]`}
        />
    );
}

export function AnimatedStatCard({ label, value, color, delay }: { label: string, value: string, color: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 rounded-3xl md:rounded-4xl bg-white/3 border border-white/5 backdrop-blur-3xl shadow-xl hover:bg-white/6 transition-all duration-300 w-full"
        >
            <span className="text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-1.5 text-center">{label}</span>
            <span className={`text-lg md:text-3xl font-black tracking-tighter ${color}`}>{value}</span>
        </motion.div>
    );
}
