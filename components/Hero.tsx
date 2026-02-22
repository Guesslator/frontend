"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Play, Info } from "lucide-react";

interface HeroProps {
  title: string;
  description: string;
  imageUrl: string;
  playUrl: string;
}

export default function Hero({
  title,
  description,
  imageUrl,
  playUrl,
}: HeroProps) {
  return (
    <div className="relative w-full h-[70vh] mb-12 rounded-3xl overflow-hidden shadow-2xl border border-white/5">
      {/* Background Image */}
      <div className="absolute inset-0 transition-transform duration-[10s] hover:scale-105">
        <Image
          src={imageUrl}
          alt={title}
          fill
          priority
          fetchPriority="high"
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 p-8 md:p-16 max-w-3xl z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest text-red-500 uppercase bg-red-500/10 border border-red-500/20 rounded-full">
            Featured Quiz
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight drop-shadow-xl">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 mb-8 line-clamp-3 font-light leading-relaxed">
            {description}
          </p>

          <div className="flex gap-4">
            <Link
              href={playUrl}
              className="flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(220,38,38,0.4)]"
            >
              <Play fill="currentColor" size={20} />
              Start Quiz
            </Link>
            <button className="flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl transition-all border border-white/10">
              <Info size={20} />
              More Info
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
