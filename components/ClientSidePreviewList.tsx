"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { t } from "@/lib/i18n";

interface ClientSidePreviewListProps {
  children: React.ReactNode[];
  lang: string;
  initialCount?: number;
}

export default function ClientSidePreviewList({
  children,
  lang,
  initialCount = 3,
}: ClientSidePreviewListProps) {
  const [visibleCount, setVisibleCount] = useState(initialCount);

  // If there are less items than initialCount, just show them all without a button
  if (children.length <= initialCount) {
    return <div className="grid gap-8">{children}</div>;
  }

  const visibleChildren = children.slice(0, visibleCount);
  const remainingCount = children.length - visibleCount;
  const isFullyExpanded = visibleCount >= children.length;

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + initialCount, children.length));
  };

  const handleShowLess = () => {
    setVisibleCount(initialCount);
  };

  return (
    <div className="flex flex-col gap-8 relative">
      <div className="grid gap-8">
        <AnimatePresence initial={false}>{visibleChildren}</AnimatePresence>
      </div>

      {/* Fade Out Effect when collapsed so it hints that there's more */}
      {!isFullyExpanded && (
        <div className="absolute bottom-16 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent pointer-events-none z-10" />
      )}

      <div className="flex justify-center mt-4 relative z-20">
        {isFullyExpanded ? (
          <button
            onClick={handleShowLess}
            className="group flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-widest transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
          >
            {t(lang as any, "showLess")}
            <ChevronUp
              size={16}
              className="group-hover:-translate-y-1 transition-transform"
            />
          </button>
        ) : (
          <button
            onClick={handleShowMore}
            className="group flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-widest transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
          >
            {t(lang as any, "showMore")} ({remainingCount}{" "}
            {t(lang as any, "videosRemaining")})
            <ChevronDown
              size={16}
              className="group-hover:translate-y-1 transition-transform"
            />
          </button>
        )}
      </div>
    </div>
  );
}
