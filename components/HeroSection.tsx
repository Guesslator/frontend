import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { t } from "@/lib/i18n";
import HeroCarousel from "./HeroCarousel";

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
  if (!items.length) return null;

  const firstItem = items[0];

  // YouTube Detection for LCP optimization
  const isYouTube = firstItem.imageUrl.includes('youtube.com') || firstItem.imageUrl.includes('ytimg.com');

  return (
    <div className="relative w-full h-[70vh] md:h-[80vh] min-h-[500px] overflow-hidden bg-background">
      {/* 
        CRITICAL: Static Initial Render (LCP)
        This part renders immediately in the HTML without waiting for JS/React.
      */}
      <div className="absolute inset-0 w-full h-full">
        {/* Background Layer */}
        <div className="absolute inset-0 bg-background">
          <div className="relative w-full h-full">
            <Image
              src={firstItem.imageUrl}
              alt={firstItem.title}
              width={1920}
              height={1080}
              priority={true}
              fetchPriority="high"
              unoptimized={isYouTube}
              className="w-full h-full object-cover"
              sizes="(max-width: 768px) 100vw, 1200px" // Optimized sizes as requested
              quality={75}
            />

            {/* Essential Overlays for Text Readability - Rendered Server-side */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_120%)]" />
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-r from-background/70 via-transparent to-transparent" />
          </div>
        </div>

        {/* Hero Content Layer */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end pb-16 md:pb-24 lg:pb-32 pt-20 px-4 md:px-12">
          <div className="w-full max-w-[1400px] mx-auto">
            <div className="max-w-4xl space-y-4 md:space-y-6 lg:space-y-8">
              {/* Category Pill */}
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/20">
                  <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-primary">
                    {t(lang as any, "featured") || "FEATURED"}
                  </span>
                </div>
              </div>

              {/* Title - The Primary LCP Text Element */}
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tighter drop-shadow-2xl">
                {firstItem.title}
              </h1>

              {/* Meta Data */}
              <div className="flex items-center gap-4 text-sm md:text-base font-medium text-gray-200">
                <span className="flex items-center gap-1">
                  <Play size={14} className="fill-current" /> {firstItem.quizType || "Quiz"}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span>{firstItem.questionCount || 0} Questions</span>
              </div>

              {/* Description */}
              <p className="text-base sm:text-lg md:text-xl text-gray-100 font-normal leading-relaxed max-w-2xl line-clamp-3 md:line-clamp-4">
                {firstItem.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 md:gap-4 pt-4">
                <Link
                  href={`/${lang}/content/${firstItem.id}`}
                  className="px-8 py-4 rounded-xl md:rounded-2xl bg-primary text-primary-foreground font-black text-lg md:text-xl transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
                >
                  <Play fill="currentColor" size={20} />
                  <span>{t(lang as any, "playNow")}</span>
                </Link>
                <Link
                  href={`/${lang}/content/${firstItem.id}`}
                  className="px-8 py-4 rounded-xl md:rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md text-white font-semibold text-lg md:text-xl"
                >
                  <span>{t(lang as any, "moreInfo")}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 
        Hydrate interactive features ONLY if there are multiple items.
        HeroCarousel will mount and replace/layer over the static content 
        without a layout shift because the initial markup matches the first slide.
      */}
      {items.length > 1 && (
        <HeroCarousel items={items} lang={lang} />
      )}
    </div>
  );
}
