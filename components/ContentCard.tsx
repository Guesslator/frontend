"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  PlayCircle,
  Trash2,
  Film,
  Image as ImageIcon,
  Music,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { deleteUserContent } from "@/lib/api";
import { t, Language } from "@/lib/i18n";
import { toast } from "sonner";

interface ContentCardProps {
  id: string;
  slug?: string;
  title: string;
  description: string;
  posterUrl: string;
  lang: string;
  index: number;
  creatorType?: "ADMIN" | "USER";
  creator?: { id: string; name: string; email: string };
  quizType?: "TEXT" | "VIDEO" | "IMAGE" | "AUDIO";
  stats?: {
    totalAttempts: number;
    avgScore: number;
    passRate: number;
  };
}

export default function ContentCard({
  id,
  slug,
  title,
  description,
  posterUrl,
  lang,
  index,
  creatorType,
  creator,
  quizType,
  stats,
}: ContentCardProps) {
  const { data: session } = useSession();
  const [deleting, setDeleting] = useState(false);
  const [imgSrc, setImgSrc] = useState(posterUrl || "/placeholder-banner.jpg");

  const canDelete = creatorType === "USER" && session?.user?.id === creator?.id;

  const getQuizTypeLabel = () => {
    switch (quizType) {
      case "VIDEO":
        return {
          icon: Film,
          label: t(lang as Language, "videoQuiz"),
          color: "text-primary",
        };
      case "IMAGE":
        return {
          icon: ImageIcon,
          label: t(lang as Language, "imageQuiz"),
          color: "text-secondary",
        };
      case "AUDIO":
        return {
          icon: Music,
          label: t(lang as Language, "audioQuiz"),
          color: "text-pink-500",
        };
      case "TEXT":
      default:
        return {
          icon: PlayCircle,
          label: t(lang as Language, "standardQuiz"),
          color: "text-accent",
        };
    }
  };

  const quizTypeInfo = getQuizTypeLabel();
  const attemptsLabel = stats
    ? new Intl.NumberFormat(lang).format(stats.totalAttempts)
    : null;
  const passRatePct = stats
    ? Math.round(stats.passRate <= 1 ? stats.passRate * 100 : stats.passRate)
    : null;
  const avgScoreLabel = stats
    ? Number.isInteger(stats.avgScore)
      ? stats.avgScore.toString()
      : stats.avgScore.toFixed(1)
    : null;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toast(t(lang as Language, "confirmDelete"), {
      action: {
        label: t(lang as Language, "deleteQuiz"),
        onClick: () => performDelete(),
      },
      cancel: {
        label: t(lang as Language, "cancel"),
        onClick: () => {},
      },
    });
  };

  const performDelete = async () => {
    setDeleting(true);
    if (!session?.accessToken) {
      toast.error("Not authenticated");
      setDeleting(false);
      return;
    }

    try {
      await deleteUserContent(session.accessToken, id);
      window.location.reload();
    } catch (err) {
      toast.error("Failed to delete");
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.04,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className="group relative h-full flex flex-col"
    >
      <Link
        href={`/${lang}/content/${id}`}
        className="block flex-1 bg-card rounded-[1.2rem] overflow-hidden border border-border shadow-sm transition-all duration-300 ease-out hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 dark:bg-card/40 dark:backdrop-blur-sm dark:border-white/5 dark:hover:border-primary/50 dark:hover:shadow-primary/20"
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden w-full bg-muted">
          <Image
            src={imgSrc}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            onError={() => {
              setImgSrc("/placeholder-banner.jpg");
            }}
          />

          {/* Overlay Gradient - Cinematic Fade (Intellectual Blue Tint) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Top Info Bar */}
          <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start z-10">
            {/* Quiz Type Badge */}
            {quizTypeInfo && (
              <div className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-black/40 backdrop-blur-md text-white border border-white/10 flex items-center gap-1.5 shadow-lg">
                <quizTypeInfo.icon size={12} className={quizTypeInfo.color} />
                <span className="uppercase tracking-wide">
                  {quizTypeInfo.label}
                </span>
              </div>
            )}

            {/* User Badge */}
            {creatorType === "USER" && (
              <div className="px-2 py-1 rounded-md text-[9px] font-black bg-secondary text-secondary-foreground shadow-lg shadow-secondary/20 uppercase tracking-wider">
                {t(lang as Language, "user")}
              </div>
            )}
          </div>

          {/* Hover Play Button - Animated */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100 translate-y-4 group-hover:translate-y-0">
              <div className="absolute inset-0 bg-primary blur-2xl opacity-40" />
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-2xl relative z-10">
                <PlayCircle size={36} fill="currentColor" strokeWidth={1} />
              </div>
            </div>
          </div>

          {/* Stats Overlay on Image (Bottom) - Only shows if Stats exist */}
          {stats && (
            <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-1 text-center z-10">
              <div className="bg-black/80 backdrop-blur-md rounded-lg p-1.5 border border-white/10 flex flex-col items-center shadow-sm">
                <span className="text-[10px] text-white/80 font-medium uppercase tracking-wide">
                  {t(lang as Language, "attempts").slice(0, 3)}
                </span>
                <span className="text-xs font-bold text-white drop-shadow-sm">
                  {attemptsLabel}
                </span>
              </div>
              <div className="bg-black/80 backdrop-blur-md rounded-lg p-1.5 border border-white/10 flex flex-col items-center shadow-sm">
                <span className="text-[10px] text-white/80 font-medium uppercase tracking-wide">
                  {t(lang as Language, "passRate").slice(0, 4)}
                </span>
                <span
                  className={`text-xs font-bold drop-shadow-sm ${stats.passRate > 0.7 ? "text-green-400" : "text-white"}`}
                >
                  {passRatePct}%
                </span>
              </div>
              <div className="bg-black/80 backdrop-blur-md rounded-lg p-1.5 border border-white/10 flex flex-col items-center shadow-sm">
                <span className="text-[10px] text-white/80 font-medium uppercase tracking-wide">
                  {t(lang as Language, "avgScore").slice(0, 3)}
                </span>
                <span className="text-xs font-bold text-secondary drop-shadow-sm">
                  {avgScoreLabel}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-5 flex flex-col gap-3 flex-grow">
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors tracking-tight">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground font-medium line-clamp-2 min-h-[2.5rem] leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Delete Button (only for own content) */}
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="absolute top-2 right-2 p-2.5 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-30 shadow-lg translate-x-2 group-hover:translate-x-0"
            title={t(lang as Language, "deleteQuiz")}
          >
            <Trash2 size={16} />
          </button>
        )}
      </Link>
    </motion.div>
  );
}
