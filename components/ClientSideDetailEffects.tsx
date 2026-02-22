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
            {children}
        </motion.div>
    );
}

export function PremiumPoster({ src, alt, badge, status }: { src: string; alt: string; badge?: string; status?: string }) {
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
            className="group/poster relative aspect-3/4 rounded-4xl p-[10px] bg-linear-to-br from-zinc-800 via-zinc-900 to-black shadow-[0_30px_60px_rgba(0,0,0,0.6)] preserve-3d cursor-pointer overflow-hidden border border-white/5 active:scale-[0.98] transition-all duration-500"
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
            {/* The Outer metallic frame detail */}
            <div className="absolute inset-0 border-2 border-white/5 rounded-4xl pointer-events-none z-50 mix-blend-overlay" />

            {/* Marquee Bulbs - Top */}
            <div className="absolute top-[4px] left-[15%] right-[15%] h-[2px] flex justify-between px-2 z-50">
                {[...Array(6)].map((_, i) => (
                    <div key={`t-${i}`} className="w-[2px] h-[2px] rounded-full bg-white/40 animate-marquee-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
                ))}
            </div>
            {/* Marquee Bulbs - Bottom */}
            <div className="absolute bottom-[4px] left-[15%] right-[15%] h-[2px] flex justify-between px-2 z-50">
                {[...Array(6)].map((_, i) => (
                    <div key={`b-${i}`} className="w-[2px] h-[2px] rounded-full bg-white/40 animate-marquee-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
                ))}
            </div>

            {/* Main Poster Container */}
            <div className="relative w-full h-full rounded-3xl overflow-hidden bg-zinc-950">
                {/* Film Texture Overlay */}
                <div className="absolute inset-0 z-30 film-grain pointer-events-none opacity-[0.05]" />

                {/* Cinema Sweep / Lens Flare */}
                <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden opacity-10">
                    <div className="absolute top-0 -inset-full h-full w-[200%] bg-linear-to-r from-transparent via-white/10 to-transparent animate-cinema-sweep" />
                </div>

                <div className="w-full h-full relative overflow-hidden">
                    <Image
                        src={src}
                        alt={alt}
                        fill
                        priority
                        fetchPriority="high"
                        className="object-cover grayscale-[0.2] contrast-[1.1] transition-all duration-1000 group-hover/poster:grayscale-0 group-hover/poster:contrast-100"
                        style={{ transform: "translateZ(0)" }}
                        sizes="(max-width: 768px) 100vw, 400px"
                    />

                    {/* Cinematic Cinematic Overlay ("Perde") */}
                    <div className="absolute inset-0 z-10 bg-linear-to-tr from-black/60 via-transparent to-white/5 opacity-40 group-hover/poster:opacity-20 transition-all duration-1000 pointer-events-none" />
                    <div className="absolute inset-0 z-10 bg-black/20 group-hover/poster:bg-transparent transition-all duration-1000 pointer-events-none" />

                    {/* Subtle Internal Vignette */}
                    <div className="absolute inset-0 z-20 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] pointer-events-none" />
                </div>

                {/* Glaze / Reflection Layer */}
                <motion.div
                    className="absolute inset-0 z-40 opacity-0 group-hover/poster:opacity-20 transition-opacity duration-1000 pointer-events-none"
                    style={{
                        background: glazeBackground,
                        transform: "translateZ(20px) scale(1.2)"
                    }}
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 z-50 flex flex-col gap-2">
                    {badge && (
                        <div className="px-3 py-1 bg-primary/80 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-md shadow-lg backdrop-blur-md border border-white/10">
                            {badge}
                        </div>
                    )}
                </div>

                {/* "Now Showing" style footer */}
                <div className="absolute inset-x-0 bottom-0 z-50 p-4 bg-linear-to-t from-black via-black/70 to-transparent flex flex-col items-center gap-1">
                    <div className="w-8 h-px bg-primary/40 rounded-full mb-1" />
                    <span className="text-[9px] font-black text-primary/80 uppercase tracking-widest">Now Showing</span>
                    {status && <span className="text-[7px] font-bold text-white/30 uppercase tracking-[0.2em]">{status}</span>}
                </div>

                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent z-20 opacity-60" />
            </div>

            {/* Inner frame depth glow */}
            <div className="absolute inset-[14px] border border-white/5 rounded-[1.3rem] z-50 pointer-events-none opacity-20 group-hover/poster:opacity-50 transition-opacity duration-1000" />
        </motion.div>
    );
}

export function AnimatedHeading({ children, className, ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) {
    return (
        <motion.h3
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={className}
            {...props}
        >
            {children}
        </motion.h3>
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
            className={`h-full ${statsColor} shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]`}
        />
    );
}
