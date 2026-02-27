import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { t } from "@/lib/i18n";
import HeroCarousel from "@/components/HeroCarousel";

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
  const isYouTube =
    firstItem.imageUrl.includes("youtube.com") ||
    firstItem.imageUrl.includes("ytimg.com");

  const getQuizTypeLabel = (type?: string) => {
    if (!type) return t(lang, "quiz");
    switch (type) {
      case "VIDEO":
        return t(lang, "videoQuiz");
      case "IMAGE":
        return t(lang, "imageQuiz");
      case "AUDIO":
        return t(lang, "audioQuiz");
      default:
        return t(lang, "standardQuiz");
    }
  };

  return (
    <div className="relative w-full h-[75vh] md:h-[85vh] min-h-[550px] overflow-hidden bg-background">
      {/* 
        CRITICAL: Static Initial Render (LCP)
        This part renders immediately in the HTML.
        z-0 to allow HeroCarousel (z-10) to cover it after hydration.
      */}
      <div className="absolute inset-0 w-full h-full z-0">
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
              className="w-full h-full object-cover animate-ken-burns"
              sizes="100vw"
              quality={85}
            />

            {/* Essential Overlays for Text Readability - Rendered Server-side */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_120%)]" />
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-r from-background/60 via-transparent to-transparent" />
          </div>
        </div>

        {/* Hero Content Layer - Fixed z-index to avoid masking carousel later */}
        <div className="absolute inset-0 z-5 flex flex-col justify-end pb-16 md:pb-24 lg:pb-32 pt-20 px-4 md:px-12">
          <div className="w-full max-w-[1400px] mx-auto">
            <div className="max-w-4xl space-y-4 md:space-y-6 lg:space-y-8">
              {/* Title - The Primary LCP Text Element */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                {firstItem.title}
              </h1>

              <div className="flex items-center gap-4 text-xs md:text-sm font-bold">
                <span className="flex items-center gap-1.5 text-primary/70 dark:text-primary/70">
                  <Play size={12} className="fill-current" />{" "}
                  {getQuizTypeLabel(firstItem.quizType)}
                </span>
                <span className="w-1 h-1 rounded-full bg-foreground/10 dark:bg-white/20" />
                <span className="text-foreground/60 dark:text-gray-400">
                  {firstItem.questionCount || 0} {t(lang as any, "questions")}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm md:text-base lg:text-lg text-foreground/70 dark:text-gray-400 font-normal leading-loose max-w-2xl line-clamp-3 md:line-clamp-4">
                {firstItem.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 md:gap-5 pt-8">
                <Link
                  href={`/${lang}/content/${firstItem.id}`}
                  className="group relative overflow-hidden rounded-full font-bold text-[13px] md:text-[15px] tracking-widest uppercase transition-all duration-700 bg-white text-zinc-950 px-8 py-3.5 md:px-10 md:py-4 flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 hover:shadow-[0_0_40px_rgba(255,255,255,0.6)]"
                >
                  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 -inset-full h-full w-[150%] z-5 block transform -skew-x-12 bg-linear-to-r from-transparent via-zinc-950/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer" />
                  </div>
                  <Play
                    fill="currentColor"
                    size={20}
                    className="relative z-10 transition-transform duration-500 group-hover:scale-110"
                  />
                  <span className="relative z-10">
                    {t(lang as any, "playNow")}
                  </span>
                </Link>

                <Link
                  href={`/${lang}/content/${firstItem.id}`}
                  className="group relative overflow-hidden rounded-full font-bold text-[13px] md:text-[15px] tracking-widest uppercase transition-all duration-700 bg-white/10 text-white border border-white/20 backdrop-blur-xl hover:bg-white/20 hover:border-white/40 px-8 py-3.5 md:px-10 md:py-4 active:scale-95"
                >
                  <span className="relative z-10">
                    {t(lang as any, "moreInfo")}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 
        Hydrate interactive features ONLY if there are multiple items.
        HeroCarousel at z-10 will mount and replace/layer over the static content 
      */}
      {items.length > 1 && <HeroCarousel items={items} lang={lang} />}
    </div>
  );
}
