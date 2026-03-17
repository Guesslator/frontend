import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { fetchContentDetail } from "@/lib/api";
import Leaderboard from "@/components/Leaderboard";
import { t } from "@/lib/i18n";
import { Play, Film, Globe, Image as ImageIcon } from "lucide-react";

export const revalidate = 60;

const ContentEditButton = dynamic(() => import("@/components/ContentEditButton"));
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

  const itemPromise = fetchContentDetail(id, validLang, { preview: true });
  const item = await itemPromise;

  let finalItem = item;
  if (!finalItem && id.includes("-")) {
    const parts = id.split("-");
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1];
      if (/^[a-z0-9]{5,7}$/.test(lastPart)) {
        const baseId = parts.slice(0, -1).join("-");
        finalItem = await fetchContentDetail(baseId, validLang, {
          preview: true,
        });
      }
    }
  }

  if (!finalItem) {
    return <div>Content not found</div>;
  }

  if (finalItem.slug && id !== finalItem.slug) {
    redirect(`/${lang}/content/${finalItem.slug}`);
  }

  const itemData = finalItem;
  const translations = (itemData.translations || {}) as Record<string, any>;
  const translation =
    translations[validLang] ||
    translations.en ||
    (Object.values(translations)[0] as any);

  let title = [
    translations[validLang]?.title,
    translations.en?.title,
    (itemData as any).title,
    (itemData as any).name,
    (Object.values(translations).find((entry: any) => entry?.title) as any)
      ?.title,
  ].find((candidate) => candidate && String(candidate).trim() !== "");

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

  const quizTypeInfo = (() => {
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
      default:
        return {
          icon: Play,
          label: t(validLang, "standardQuiz"),
          color: "text-warning",
        };
    }
  })();

  const supportedLangs = Object.keys(translations).filter(
    (key) =>
      translations[key]?.title ||
      translations[key]?.description ||
      translations[key]?.text,
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

  const previewQuestions = itemData.questions || [];

  return (
    <div className="min-h-svh bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(var(--primary-rgb),0.08),transparent_45%)]" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-linear-to-b from-transparent via-background/90 to-background" />
      <div className="absolute inset-0 z-0 film-grain opacity-[0.06] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-12 pt-16 md:pt-32 pb-32 md:pb-24">
        <div className="flex flex-col lg:flex-row gap-10 md:gap-16 lg:gap-20 items-start">
          <div className="w-full max-w-[300px] md:max-w-[360px] mx-auto lg:mx-0 lg:w-[360px] shrink-0 lg:sticky lg:top-32">
            <div className="relative aspect-3/4 overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
              <Image
                src={itemData.posterUrl || "/placeholder-banner.jpg"}
                alt={title}
                fill
                priority
                fetchPriority="high"
                className="object-cover"
                sizes="(max-width: 768px) 90vw, 360px"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-[2rem]" />
              <div className="absolute inset-x-0 bottom-4 px-4 flex justify-center">
                <div className="bg-black/45 backdrop-blur-xl border border-white/10 rounded-2xl py-2.5 px-6 flex flex-col items-center gap-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
                  <div className="w-6 h-0.5 bg-primary rounded-full" />
                  <span className="text-[9px] font-black text-white/90 uppercase tracking-[0.35em]">
                    {t(validLang, "featuredExperience")}
                  </span>
                  {itemData.quizType && (
                    <span className="text-[7.5px] font-bold text-white/55 uppercase tracking-[0.25em]">
                      {itemData.quizType} {t(validLang, "contentLabel")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-12 hidden lg:flex flex-col gap-5">
              {quizTypeInfo && (
                <div className="px-6 py-4 flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03]">
                  <div
                    className={`p-2.5 rounded-xl bg-current/10 ${quizTypeInfo.color} flex items-center justify-center shrink-0`}
                  >
                    <quizTypeInfo.icon size={16} className={quizTypeInfo.color} />
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

              <div className="px-6 py-4 flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03]">
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
              <Leaderboard contentId={itemData.id} />
            </div>
          </div>

          <div className="flex-1 w-full max-w-4xl">
            <div className="lg:hidden mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {quizTypeInfo?.label}
              </span>
            </div>

            <div className="flex flex-col mb-10">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter drop-shadow-2xl bg-clip-text text-transparent bg-linear-to-b from-white to-white/60 leading-[1.1] mb-6 text-pretty">
                {title}
              </h1>

              <div className="flex items-center gap-4 text-sm font-semibold text-white/50 flex-wrap">
                <div className="flex items-center gap-2">
                  <Play
                    size={16}
                    className="fill-current text-primary/70"
                    aria-hidden="true"
                  />
                  <span className="uppercase tracking-widest font-bold text-[10px]">
                    {itemData.quizType}
                  </span>
                </div>
                <span
                  className="w-1 h-1 rounded-full bg-foreground/10"
                  aria-hidden="true"
                />
                <span>
                  {itemData.questions?.length || 0}{" "}
                  {t(validLang, "questions" as any) || "Questions"}
                </span>
                <ContentEditButton
                  creatorId={itemData.creator?.id}
                  contentId={id}
                  lang={validLang}
                />
              </div>
            </div>

            <div className="relative mb-16 lg:mb-20">
              <div className="pl-6 border-l-2 border-primary/30">
                <h2 className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold mb-4">
                  {t(validLang, "summaryLabel")}
                </h2>
                <p className="text-base md:text-lg text-white/60 font-light leading-relaxed max-w-3xl text-pretty">
                  {translation?.description ||
                    translation?.text ||
                    t(validLang, "noDescription" as any) ||
                    t(validLang, "noDescription")}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex flex-wrap items-center gap-6 mb-16 lg:mb-20">
              <Link
                href={`/${lang}/quiz/${itemData.id}`}
                className="group relative z-30 w-full sm:w-auto inline-flex items-center justify-center gap-4 px-10 py-5 bg-primary/10 border border-primary/20 backdrop-blur-md text-white hover:bg-primary/20 hover:border-primary/50 text-base font-black uppercase tracking-[0.2em] rounded-full overflow-hidden transition-all duration-300 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)] hover:-translate-y-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-95"
                aria-label={t(validLang, "startQuiz")}
              >
                <div className="relative flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-full group-hover:bg-primary group-hover:text-black transition-colors duration-300">
                    <Play
                      size={18}
                      className="text-primary group-hover:text-black transition-colors"
                      fill="currentColor"
                    />
                  </div>
                  <span>{t(validLang, "startQuiz")}</span>
                </div>
              </Link>

              {itemData.stats && itemData.stats.totalAttempts > 0 && (
                <div className="grid grid-cols-3 gap-3 md:gap-6 w-full lg:w-auto">
                  {[
                    {
                      label: t(validLang, "passRate"),
                      value: `${itemData.stats.passRate}%`,
                      color:
                        itemData.stats.passRate > 60
                          ? "text-green-400"
                          : "text-orange-400",
                    },
                    {
                      label: t(validLang, "avgScore"),
                      value: `${itemData.stats.avgScore}`,
                      color: "text-primary",
                    },
                    {
                      label: t(validLang, "attempts"),
                      value: `${itemData.stats.totalAttempts}`,
                      color: "text-white",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="flex flex-col items-center justify-center p-6 md:p-8 rounded-4xl bg-white/[0.03] border border-white/5 shadow-sm w-full"
                    >
                      <span className="text-[9px] md:text-[10px] text-white/40 font-bold uppercase tracking-[0.25em] mb-3 text-center">
                        {stat.label}
                      </span>
                      <span
                        className={`text-2xl sm:text-3xl md:text-4xl font-light tracking-tight ${stat.color}`}
                      >
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:hidden mb-20">
              <Leaderboard contentId={itemData.id} />
            </div>

            {previewQuestions.length > 0 && (
              <div className="space-y-8 mt-12 pb-24">
                <h2 className="text-lg font-bold flex items-center gap-3 uppercase tracking-[0.3em] text-white/40 pb-4 mb-4">
                  <Film className="text-primary/70" size={18} aria-hidden="true" />
                  {t(validLang, "quizIntel")}
                </h2>

                <ClientSidePreviewList lang={validLang} initialCount={6}>
                  {previewQuestions.map((q: any, idx: number) => {
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

                    const previewImage =
                      q.imageUrl ||
                      (q.videoUrl
                        ? `https://img.youtube.com/vi/${getYoutubeId(q.videoUrl) || ""}/hqdefault.jpg`
                        : "");

                    return (
                      <Link
                        key={q.id || idx}
                        href={`/${lang}/quiz/${itemData.id}?q=${idx}`}
                        className="group/card flex flex-col md:flex-row gap-5 md:gap-8 p-4 md:p-6 rounded-3xl bg-white/[0.015] border border-white/5 hover:bg-white/[0.03] hover:border-white/10 transition-colors"
                      >
                        <div className="w-full max-w-[280px] md:max-w-none md:w-64 mx-auto md:mx-0 aspect-video rounded-2xl overflow-hidden bg-black/50 relative shadow-lg shrink-0 border border-white/5">
                          {previewImage ? (
                            <Image
                              src={previewImage}
                              alt={`${t(validLang, "scene")} #${idx + 1}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 256px"
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
                            <div className="flex justify-between items-end gap-4">
                              <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
                                {t(validLang, "difficultyRating")}
                              </h3>
                              <span className="text-[10px] font-bold text-white/60 tabular-nums tracking-widest">
                                {rate}% {t(validLang, "passRate")}
                              </span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${statsColor} opacity-90 shadow-[0_0_10px_rgba(var(--primary-rgb),0.15)]`}
                                style={{ width: `${rate}%` }}
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

                          <p className="text-[10px] text-primary/80 font-bold uppercase tracking-[0.22em]">
                            {idx + 1}. sahneden basla
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </ClientSidePreviewList>

              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pointer-events-none p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
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
  );
}

function getYoutubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2]?.length === 11 ? match[2] : null;
}
