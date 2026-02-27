import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { fetchContentDetail } from "@/lib/api";
import Leaderboard from "@/components/Leaderboard";
import { t, Language } from "@/lib/i18n";
import YouTubeThumbnail from "@/components/YouTubeThumbnail";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  PremiumPoster,
  AnimatedHeading,
  AnimatedQuestionCard,
  AnimatedProgressBar,
  AnimatedStatCard,
} from "@/components/ClientSideDetailEffects";
import {
  Play,
  Clock,
  Award,
  Edit,
  Film,
  Globe,
  CheckCircle2,
  BarChart3,
  Share2,
  Zap,
  TrendingUp,
  Shield,
  Image as ImageIcon,
} from "lucide-react";

const ClientSideDetailEffects = dynamic(
  () => import("@/components/ClientSideDetailEffects"),
);
const QuizClient = dynamic(() => import("@/components/QuizClient"));
const ClientSidePreviewList = dynamic(
  () => import("@/components/ClientSidePreviewList"),
);

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const validLang = (["tr", "en", "ar", "de"].includes(lang) ? lang : "en") as
    | "tr"
    | "en"
    | "ar"
    | "de";

  const [session, item] = await Promise.all([
    getServerSession(authOptions),
    fetchContentDetail(id, validLang),
  ]);

  // [SEO FALLBACK] If not found and ID looks like an old slug with suffix, try stripping it
  let finalItem = item;
  if (!finalItem && id.includes("-")) {
    const parts = id.split("-");
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1];
      if (/^[a-z0-9]{5,7}$/.test(lastPart)) {
        const baseId = parts.slice(0, -1).join("-");
        finalItem = await fetchContentDetail(baseId, validLang);
      }
    }
  }

  if (!finalItem) {
    console.error(`ContentDetailPage: Item not found for ID: ${id}`);
    return <div>Content not found</div>;
  }

  // Use finalItem throughout
  const itemData = finalItem;

  // [SEO] Canonical Redirect
  if (itemData.slug && id !== itemData.slug) {
    redirect(`/${lang}/content/${itemData.slug}`);
  }

  const translations = (itemData.translations || {}) as any;

  // ... (logic remains same but uses itemData instead of item)
  const translation = (translations[validLang] ||
    translations["en"] ||
    (Object.values(translations)[0] as any)) as any;

  let title = [
    (translations[validLang] as any)?.title,
    (translations["en"] as any)?.title,
    (itemData as any).title,
    (itemData as any).name,
    (Object.values(translations).find((t: any) => t?.title) as any)?.title,
  ].find((c) => c && String(c).trim() !== "");

  if (!title && itemData.slug) {
    const segments = itemData.slug.split("-");
    title = segments
      .filter((word, idx) => {
        if (idx !== segments.length - 1) return true;
        return !(/^[a-z0-9]{5,8}$/.test(word) && /[0-9]/.test(word));
      })
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  if (!title) title = "Quiz Content";

  const getQuizTypeLabel = () => {
    if (!itemData.quizType) return null;
    switch (itemData.quizType) {
      case "VIDEO":
        return {
          icon: Film,
          label: t(validLang, "videoQuiz"),
          color: "text-purple-400",
        };
      case "IMAGE":
        return {
          icon: ImageIcon,
          label: t(validLang, "imageQuiz"),
          color: "text-green-400",
        };
      case "TEXT":
      default:
        return {
          icon: Play,
          label: t(validLang, "standardQuiz"),
          color: "text-warning",
        };
    }
  };

  const quizTypeInfo = getQuizTypeLabel();

  const supportedLangs = Object.keys(translations).filter(
    (k) =>
      (translations[k] as any)?.title ||
      (translations[k] as any)?.description ||
      (translations[k] as any)?.text,
  );

  const getLangLabel = () => {
    const contentLang =
      itemData.language ||
      (supportedLangs.includes("en") ? "en" : supportedLangs[0] || validLang);

    const langKeyMap: Record<string, string> = {
      en: "english",
      english: "english",
      tr: "turkish",
      turkish: "turkish",
      turkce: "turkish",
      ar: "arabic",
      arabic: "arabic",
      de: "german",
      german: "german",
    };
    const i18nKey =
      langKeyMap[contentLang.toLowerCase() as keyof typeof langKeyMap] ||
      contentLang;

    return t(validLang, i18nKey as any) || contentLang.toUpperCase();
  };
  const isCreator = session?.user?.id === itemData.creator?.id;

  return (
    <ClientSideDetailEffects>
      <div className="min-h-svh bg-background text-foreground relative overflow-hidden transition-colors duration-500">
        {/* Film Texture Overlay */}
        <div className="absolute inset-0 z-1 film-grain pointer-events-none opacity-[0.08]" />

        {/* Subdued Quiet Luxury Background Ambient Glares */}
        <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-primary/3 blur-[140px] rounded-full pointer-events-none z-0" />
        <div className="absolute top-1/2 left-0 w-[50vw] h-[50vw] bg-indigo-500/3 blur-[140px] rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />
        <div className="absolute bottom-0 right-1/4 w-[70vw] h-[70vw] bg-violet-600/3 blur-[140px] rounded-full translate-y-1/3 pointer-events-none z-0" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(var(--primary-rgb),0.02),transparent_50%)] z-0" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/90 to-background pointer-events-none z-0" />

        <div className="relative z-30 container mx-auto px-4 md:px-6 lg:px-12 pt-16 md:pt-32 pb-32 md:pb-24 min-h-svh flex flex-col">
          <div className="flex flex-col lg:flex-row gap-10 md:gap-16 lg:gap-20 items-start">
            {/* Left Column: Poster & Metadata */}
            <div className="w-full max-w-[300px] md:max-w-[360px] mx-auto lg:mx-0 lg:w-[360px] shrink-0 lg:sticky lg:top-32 z-10 transition-all duration-700">
              <PremiumPoster
                src={itemData.posterUrl}
                alt={title}
                status={`${itemData.quizType} ${t(validLang, "contentLabel")}`}
                lang={validLang}
              />

              {/* Info Chips - Desktop Only */}
              <div className="mt-12 hidden lg:flex flex-col gap-5">
                {quizTypeInfo && (
                  <div className="premium-card px-6 py-4 flex items-center gap-4 hover:premium-card-hover rounded-2xl border border-white/5 bg-white/1 backdrop-blur-sm">
                    <div
                      className={`p-2.5 rounded-xl bg-current/10 ${quizTypeInfo.color} flex items-center justify-center shrink-0`}
                    >
                      <quizTypeInfo.icon
                        size={16}
                        className={quizTypeInfo.color}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-white/40 font-bold uppercase tracking-[0.25em] leading-none mb-1">
                        {t(validLang, "categoryLabel")}
                      </span>
                      <span
                        className={`text-xs font-black uppercase tracking-widest ${quizTypeInfo.color}`}
                      >
                        {quizTypeInfo.label}
                      </span>
                    </div>
                  </div>
                )}

                <div className="premium-card px-6 py-4 flex items-center gap-4 hover:premium-card-hover rounded-2xl border border-white/5 bg-white/1 backdrop-blur-sm mt-4">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Globe size={16} className="text-blue-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-white/40 font-bold uppercase tracking-[0.25em] leading-none mb-1">
                      {t(validLang, "language")}
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest text-blue-400">
                      {getLangLabel()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <Leaderboard contentId={id} />
              </div>
            </div>

            {/* Right Column: Main Info */}
            <div className="flex-1 w-full max-w-4xl">
              {/* Mobile Category Pill */}
              <div className="lg:hidden mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  {quizTypeInfo?.label}
                </span>
              </div>

              <div className="flex flex-col mb-10">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter drop-shadow-2xl bg-clip-text text-transparent bg-linear-to-b from-white to-white/60 leading-[1.1] mb-6 text-pretty">
                  {title}
                </h1>

                <div className="flex items-center gap-4 text-sm font-semibold text-white/50">
                  <div className="flex items-center gap-2">
                    <Play
                      size={16}
                      className="fill-current text-primary/70 dark:text-primary/70"
                      aria-hidden="true"
                    />
                    <span className="uppercase tracking-widest font-bold text-[10px]">
                      {itemData.quizType}
                    </span>
                  </div>
                  <span
                    className="w-1 h-1 rounded-full bg-foreground/10 dark:bg-white/20"
                    aria-hidden="true"
                  />
                  <span>
                    {itemData.questions?.length || 0}{" "}
                    {t(validLang, "questions" as any) || "Questions"}
                  </span>
                  {isCreator && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-foreground/10 dark:bg-white/10" />
                      <Link
                        href={`/${lang}/quiz/${id}/edit`}
                        className="text-primary/80 hover:text-primary flex items-center gap-1.5 font-bold transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
                        aria-label={t(validLang, "editLabel")}
                      >
                        <Edit size={16} /> {t(validLang, "editLabel")}
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="relative mb-16 lg:mb-20">
                <div className="pl-6 border-l-2 border-primary/30">
                  <h2 className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold mb-4">
                    {t(validLang, "summaryLabel")}
                  </h2>
                  <p className="text-base md:text-lg text-white/60 font-light leading-relaxed max-w-3xl text-pretty">
                    {(translation as any)?.description ||
                      (translation as any)?.text ||
                      t(validLang, "noDescription" as any) ||
                      t(validLang, "noDescription")}
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex flex-wrap items-center gap-6 mb-16 lg:mb-20">
                <Link
                  href={`/${lang}/quiz/${itemData.id}`}
                  className="group relative z-30 w-full sm:w-auto inline-flex items-center justify-center gap-4 px-10 py-5 bg-primary/10 border border-primary/20 backdrop-blur-md text-white hover:bg-primary/20 hover:border-primary/50 text-base font-black uppercase tracking-[0.2em] rounded-full overflow-hidden transition-all duration-500 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)] hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.2)] hover:-translate-y-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-95"
                  aria-label={t(validLang, "startQuiz")}
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent" />
                  <div className="relative flex items-center gap-3 translate-z-10">
                    <div className="p-2 bg-primary/20 rounded-full group-hover:bg-primary group-hover:text-black transition-colors duration-500">
                      <Play
                        size={18}
                        className="text-primary group-hover:text-black transition-colors"
                        fill="currentColor"
                      />
                    </div>
                    <span>{t(validLang, "startQuiz")}</span>
                  </div>
                </Link>

                {/* Quick Stats Cards */}
                {itemData.stats && itemData.stats.totalAttempts > 0 && (
                  <div className="grid grid-cols-3 gap-3 md:gap-6 w-full lg:w-auto">
                    <AnimatedStatCard
                      label={t(validLang, "passRate")}
                      value={`${itemData.stats.passRate}%`}
                      color={
                        itemData.stats.passRate > 60
                          ? "text-green-400"
                          : "text-orange-400"
                      }
                      delay={0.6}
                    />
                    <AnimatedStatCard
                      label={t(validLang, "avgScore")}
                      value={`${itemData.stats.avgScore}`}
                      color="text-primary"
                      delay={0.7}
                    />
                    <AnimatedStatCard
                      label={t(validLang, "attempts")}
                      value={`${itemData.stats.totalAttempts}`}
                      color="text-white"
                      delay={0.8}
                    />
                  </div>
                )}
              </div>

              {/* Mobile Leaderboard Fallback */}
              <div className="lg:hidden mb-20">
                <Leaderboard contentId={id} />
              </div>

              {/* Preview Section */}
              {itemData.questions && itemData.questions.length > 0 && (
                <div className="space-y-8 mt-12 pb-24">
                  <AnimatedHeading className="text-lg font-bold flex items-center gap-3 uppercase tracking-[0.3em] text-white/40 pb-4 mb-4">
                    <Film
                      className="text-primary/70"
                      size={18}
                      aria-hidden="true"
                    />
                    {t(validLang, "quizIntel")}
                  </AnimatedHeading>

                  <ClientSidePreviewList lang={validLang} initialCount={3}>
                    {itemData.questions.map((q: any, idx: number) => {
                      const attempts = q.attempts || 0;
                      const rate =
                        attempts > 0
                          ? Math.round((q.correctCount / attempts) * 100)
                          : 0;
                      const statsColor =
                        rate > 75
                          ? "bg-emerald-500/80"
                          : rate > 40
                            ? "bg-amber-500/80"
                            : "bg-rose-500/80";

                      return (
                        <AnimatedQuestionCard
                          key={q.id || idx}
                          idx={idx}
                          className="group/card flex flex-col md:flex-row gap-5 md:gap-8 p-4 md:p-6 rounded-3xl bg-white/1.5 border border-white/5 hover:bg-white/3 hover:border-white/10 transition-all duration-500"
                        >
                          <div className="w-full max-w-[280px] md:max-w-none md:w-64 mx-auto md:mx-0 aspect-video rounded-2xl overflow-hidden bg-black/50 relative shadow-lg shrink-0 border border-white/5">
                            {q.videoUrl ? (
                              <YouTubeThumbnail
                                videoUrl={q.videoUrl}
                                alt={`${t(validLang, "scene")} #${idx + 1}`}
                                className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-1000"
                              />
                            ) : q.imageUrl ? (
                              <Image
                                src={q.imageUrl}
                                alt={`${t(validLang, "scene")} #${idx + 1}`}
                                fill
                                className="object-cover group-hover/card:scale-110 transition-transform duration-1000"
                              />
                            ) : (
                              <div className="w-full h-full bg-linear-to-br from-zinc-800 to-zinc-950 flex items-center justify-center text-zinc-700 font-bold">
                                {t(validLang, "preview")}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60" />
                            <div className="absolute bottom-4 left-5 text-[9px] font-black uppercase tracking-[0.3em] text-white/70">
                              {t(validLang, "scene")} #{idx + 1}
                            </div>
                          </div>

                          <div className="flex-1 flex flex-col justify-center gap-6">
                            <div className="flex flex-col gap-2">
                              <div className="flex justify-between items-end">
                                <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
                                  {t(validLang, "difficultyRating")}
                                </h3>
                                <span className="text-[10px] font-bold text-white/60 tabular-nums tracking-widest">
                                  {rate}% {t(validLang, "passRate")}
                                </span>
                              </div>
                              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <AnimatedProgressBar
                                  progress={rate}
                                  idx={idx}
                                  statsColor={statsColor}
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div
                                className="w-1.5 h-1.5 rounded-full bg-primary opacity-60"
                                aria-hidden="true"
                              />
                              <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
                                {attempts > 0
                                  ? `${q.correctCount} ${t(validLang, "successSuffix")}`
                                  : t(validLang, "testingPhase")}
                              </p>
                            </div>
                          </div>
                        </AnimatedQuestionCard>
                      );
                    })}
                  </ClientSidePreviewList>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sticky CTA Container */}
        <div className="fixed bottom-0 left-0 right-0 z-100 lg:hidden pointer-events-none p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          {/* Background Fade Gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-transparent -z-10 h-32 pointer-events-none" />

          <Link
            href={`/${lang}/quiz/${itemData.id}`}
            className="relative w-full h-16 bg-[#18181b]/60 backdrop-blur-2xl text-white/90 border border-white/10 rounded-[1.25rem] flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden active:scale-[0.98] transition-all pointer-events-auto"
            aria-label={t(validLang, "startQuiz")}
          >
            <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-50" />
            <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none" />
            <div className="relative flex items-center gap-3 z-10">
              <div className="p-1.5 bg-primary/20 rounded-full">
                <Play size={14} fill="currentColor" className="text-primary" />
              </div>
              <span className="text-sm font-black uppercase tracking-[0.2em]">
                {t(validLang, "startQuiz")}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </ClientSideDetailEffects>
  );
}
