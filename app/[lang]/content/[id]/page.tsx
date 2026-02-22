import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { fetchContentDetail } from '../../../../lib/api';
import Leaderboard from '@/components/Leaderboard';
import { Film, Image as ImageIcon, Play, Globe, Edit } from 'lucide-react';
import { t } from '@/lib/i18n';
import YouTubeThumbnail from '@/components/YouTubeThumbnail';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ClientSideDetailEffects, { PremiumPoster, AnimatedHeading, AnimatedQuestionCard, AnimatedProgressBar, AnimatedStatCard } from "@/components/ClientSideDetailEffects";

export default async function ContentDetailPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
    const { lang, id } = await params;
    const session = await getServerSession(authOptions);
    const validLang = (['tr', 'en', 'ar', 'de'].includes(lang) ? lang : 'en') as 'tr' | 'en' | 'ar' | 'de';

    let item = await fetchContentDetail(id, validLang);

    // [SEO FALLBACK] If not found and ID looks like an old slug with suffix, try stripping it
    if (!item && id.includes('-')) {
        const parts = id.split('-');
        if (parts.length > 1) {
            const lastPart = parts[parts.length - 1];
            // Check if suffix looks like our random pattern (5-7 chars)
            if (/^[a-z0-9]{5,7}$/.test(lastPart)) {
                const baseId = parts.slice(0, -1).join('-');
                item = await fetchContentDetail(baseId, validLang);
            }
        }
    }

    if (!item) {
        console.error(`ContentDetailPage: Item not found for ID: ${id}`);
        return <div>Content not found</div>;
    }

    // [SEO] Canonical Redirect: If accessed via UUID ID but slug exists, redirect to slug-based URL
    if (item.slug && id !== item.slug) {
        // Only redirect if id is actually the UUID (not the slug itself)
        // Back-compat ensures old links still work but redirect to the clean one
        redirect(`/${lang}/content/${item.slug}`);
    }

    if (item.questions && item.questions.length > 0) {
        // Questions available
    } else {
        // No questions found
    }

    const translations = (item.translations || {}) as any;

    // Cascading Translation Resolution: Preferred -> English -> First Available
    const translation = (translations[validLang] || translations['en'] || (Object.values(translations)[0] as any)) as any;

    // Cascading Title Resolution: Preferred -> English -> Any Translation -> Top-Level -> Slug -> Default
    let title = [
        (translations[validLang] as any)?.title,
        (translations['en'] as any)?.title,
        (item as any).title,
        (item as any).name,
        (Object.values(translations).find((t: any) => t?.title) as any)?.title,
    ].find(c => c && String(c).trim() !== '');

    if (!title && item.slug) {
        // Humanize Slug: harry-potter-spells-3rj4n -> Harry Potter Spells
        const segments = item.slug.split('-');
        title = segments
            .filter((word, idx) => {
                // Keep if it's not the last segment OR doesn't look like a short random ID
                if (idx !== segments.length - 1) return true;
                return !(/^[a-z0-9]{5,8}$/.test(word) && /[0-9]/.test(word)); // Must contain at least one number to be an ID
            })
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    if (!title) title = 'Quiz Content';

    const getQuizTypeLabel = () => {
        if (!item.quizType) return null;
        switch (item.quizType) {
            case 'VIDEO':
                return { icon: Film, label: t(validLang, 'videoQuiz'), color: 'text-purple-400' };
            case 'IMAGE':
                return { icon: ImageIcon, label: t(validLang, 'imageQuiz'), color: 'text-green-400' };
            case 'TEXT':
            default:
                return { icon: Play, label: t(validLang, 'standardQuiz'), color: 'text-warning' };
        }
    };

    const quizTypeInfo = getQuizTypeLabel();

    const supportedLangs = Object.keys(translations).filter(k =>
        (translations[k] as any)?.title || (translations[k] as any)?.description || (translations[k] as any)?.text
    );

    const getLangLabel = () => {
        // Senior Logic:
        // 1. If the item explicitly defines its primary language, use it.
        // 2. If 'en' translation exists, it's highly likely the base language.
        // 3. Any available translation language is better than defaulting to UI language blindly.
        // 4. Fallback to current UI language only if it's a truly empty content.

        const contentLang = item.language ||
            (supportedLangs.includes('en') ? 'en' : (supportedLangs[0] || validLang));

        const langKeyMap: Record<string, string> = {
            en: 'english', english: 'english',
            tr: 'turkish', turkish: 'turkish', turkce: 'turkish',
            ar: 'arabic', arabic: 'arabic',
            de: 'german', german: 'german'
        };
        const i18nKey = langKeyMap[contentLang.toLowerCase() as keyof typeof langKeyMap] || contentLang;

        return t(validLang, i18nKey as any) || contentLang.toUpperCase();
    };
    const isCreator = session?.user?.id === item.creator?.id;

    return (
        <ClientSideDetailEffects>
            <div className="min-h-screen bg-background text-foreground relative overflow-hidden transition-colors duration-500">
                {/* Film Texture Overlay - Unified Cinematic Look */}
                <div className="absolute inset-0 z-1 film-grain pointer-events-none opacity-[0.12]" />

                {/* Background Ambience - Cinematic Poster Backdrop softened */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <Image
                        src={item.posterUrl.includes('tmdb.org') ? item.posterUrl.replace('/w500/', '/w200/') : item.posterUrl}
                        alt="Background"
                        fill
                        priority
                        fetchPriority="high"
                        className="object-cover opacity-15 blur-3xl scale-125"
                        sizes="20vw"
                    />
                </div>
                {/* Cinematic Spotlight - De-intensified */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/10 blur-[200px] rounded-full animate-spotlight pointer-events-none z-0" />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_95%)] z-0" />
                <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent pointer-events-none z-0" />

                <div className="relative z-30 container mx-auto px-4 md:px-8 pt-20 md:pt-32 pb-32 md:pb-20 min-h-screen flex flex-col">

                    <div className="flex flex-col lg:flex-row gap-10 md:gap-16 lg:gap-20 items-start">
                        {/* Left Column: Poster & Metadata */}
                        <div className="w-full max-w-[320px] md:max-w-[400px] mx-auto lg:mx-0 lg:w-[400px] shrink-0 lg:sticky lg:top-32 z-10">
                            <PremiumPoster
                                src={item.posterUrl}
                                alt={title}
                                status={`${item.quizType} ${t(validLang, 'contentLabel')}`}
                                lang={validLang}
                            />

                            {/* Info Chips - Desktop Only */}
                            <div className="mt-12 hidden lg:flex flex-col gap-5">
                                {quizTypeInfo && (
                                    <div className="premium-card px-7 py-5 flex items-center gap-5 hover:premium-card-hover">
                                        <div className={`p-2.5 rounded-2xl bg-current/10 ${quizTypeInfo.color} flex items-center justify-center shrink-0`}>
                                            <quizTypeInfo.icon size={18} className={quizTypeInfo.color} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] leading-none mb-1.5">{t(validLang, 'categoryLabel')}</span>
                                            <span className={`text-sm font-black uppercase tracking-widest ${quizTypeInfo.color}`}>
                                                {quizTypeInfo.label}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="premium-card px-7 py-5 flex items-center gap-5 hover:premium-card-hover">
                                    <div className="p-2.5 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <Globe size={18} className="text-blue-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] leading-none mb-1.5">{t(validLang, 'language')}</span>
                                        <span className="text-sm font-black uppercase tracking-widest text-blue-400">
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
                                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter drop-shadow-2xl text-white leading-[1.1] mb-6 text-pretty">
                                    {title}
                                </h1>

                                <div className="flex items-center gap-4 text-sm md:text-lg font-medium text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Play size={16} className="fill-current" />
                                        <span className="uppercase tracking-widest font-black text-xs">{item.quizType}</span>
                                    </div>
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                    <span>{item.questions?.length || 0} {t(validLang, 'questions' as any) || 'Questions'}</span>
                                    {isCreator && (
                                        <>
                                            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                            <Link
                                                href={`/${lang}/quiz/${id}/edit`}
                                                className="text-primary hover:text-primary/80 flex items-center gap-1 font-bold transition-colors"
                                            >
                                                <Edit size={16} /> {t(validLang, 'editLabel')}
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Synopsis Box - Refined */}
                            <div className="relative mb-16 lg:mb-20">
                                <div className="absolute -left-4 top-1 mb-1 w-1 bg-linear-to-b from-primary/60 via-primary/20 to-transparent rounded-full" />
                                <div className="pl-6">
                                    <h2 className="text-[10px] uppercase tracking-[0.4em] text-primary/80 font-black mb-5">{t(validLang, 'summaryLabel')}</h2>
                                    <p className="text-lg md:text-xl text-foreground/80 font-light leading-relaxed max-w-2xl text-pretty">
                                        {(translation as any)?.description || (translation as any)?.text || t(validLang, 'noDescription' as any) || t(validLang, 'noDescription')}
                                    </p>
                                </div>
                            </div>

                            <div className="hidden sm:flex flex-wrap items-center gap-6 mb-20 lg:mb-24">
                                <Link
                                    href={`/${lang}/quiz/${item.id}`}
                                    className="group relative z-30 w-full sm:w-auto inline-flex items-center justify-center gap-6 px-14 py-7 bg-primary text-primary-foreground text-3xl font-black rounded-3xl overflow-hidden hover:scale-105 active:scale-95 transition-all duration-500 shadow-[0_20px_50px_rgba(var(--primary-rgb),0.4)]"
                                >
                                    <div className="absolute inset-0 z-0 overflow-hidden">
                                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-linear-to-r from-transparent via-white/40 to-transparent opacity-40 animate-shimmer" />
                                    </div>

                                    <div className="relative flex items-center gap-4 translate-z-10">
                                        <div className="p-2.5 bg-white/20 rounded-2xl">
                                            <Play size={32} fill="currentColor" />
                                        </div>
                                        <div className="flex flex-col items-start leading-none uppercase tracking-tighter">
                                            <span>{t(validLang, 'startQuiz')}</span>
                                            <span className="text-[10px] opacity-80 font-black mt-1 uppercase tracking-widest">
                                                {getLangLabel()}
                                            </span>
                                        </div>
                                    </div>
                                </Link>

                                {/* Quick Stats Cards */}
                                {item.stats && item.stats.totalAttempts > 0 && (
                                    <div className="grid grid-cols-3 gap-3 md:gap-6 w-full lg:w-auto">
                                        <AnimatedStatCard
                                            label={t(validLang, 'passRate')}
                                            value={`${item.stats.passRate}%`}
                                            color={item.stats.passRate > 60 ? 'text-green-400' : 'text-orange-400'}
                                            delay={0.6}
                                        />
                                        <AnimatedStatCard
                                            label={t(validLang, 'avgScore')}
                                            value={`${item.stats.avgScore}`}
                                            color="text-primary"
                                            delay={0.7}
                                        />
                                        <AnimatedStatCard
                                            label={t(validLang, 'attempts')}
                                            value={`${item.stats.totalAttempts}`}
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
                            {item.questions && item.questions.length > 0 && (
                                <div className="space-y-12">
                                    <AnimatedHeading className="text-3xl font-black flex items-center gap-4 uppercase tracking-[0.2em] text-foreground/40 border-b border-white/5 pb-6">
                                        <Film className="text-primary" size={24} />
                                        {t(validLang, 'quizIntel')}
                                    </AnimatedHeading>

                                    <div className="grid gap-8">
                                        {item.questions.slice(0, 5).map((q: any, idx: number) => {
                                            const attempts = q.attempts || 0;
                                            const rate = attempts > 0 ? Math.round((q.correctCount / attempts) * 100) : 0;
                                            const statsColor = rate > 75 ? 'bg-green-500' : rate > 40 ? 'bg-yellow-500' : 'bg-red-500';

                                            return (
                                                <AnimatedQuestionCard
                                                    key={q.id || idx}
                                                    idx={idx}
                                                    className="group/card premium-card hover:premium-card-hover flex flex-col md:flex-row gap-5 md:gap-10 p-4 md:p-8"
                                                >
                                                    <div className="w-full max-w-[280px] md:max-w-none md:w-72 mx-auto md:mx-0 aspect-video rounded-3xl overflow-hidden bg-zinc-950 relative shadow-2xl shrink-0">
                                                        {q.videoUrl ? (
                                                            <YouTubeThumbnail videoUrl={q.videoUrl} alt={`Soru ${idx + 1}`} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-1000" />
                                                        ) : q.imageUrl ? (
                                                            <Image src={q.imageUrl} alt={`Soru ${idx + 1}`} fill className="object-cover group-hover/card:scale-110 transition-transform duration-1000" />
                                                        ) : <div className="w-full h-full bg-linear-to-br from-zinc-800 to-zinc-950 flex items-center justify-center text-zinc-700 font-bold">{t(validLang, 'preview')}</div>}
                                                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                                        <div className="absolute bottom-4 left-5 text-[9px] font-black uppercase tracking-[0.3em] text-white/50">{t(validLang, 'scene')} #{idx + 1}</div>
                                                    </div>

                                                    <div className="flex-1 flex flex-col justify-center gap-6">
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex justify-between items-end">
                                                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t(validLang, 'difficultyRating')}</h3>
                                                                <span className="text-xs font-black text-white tabular-nums tracking-tighter">{rate}% {t(validLang, 'passRate')}</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                                <AnimatedProgressBar progress={rate} idx={idx} statsColor={statsColor} />
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                                                            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                                                                {attempts > 0 ? `${q.correctCount} ${t(validLang, 'successSuffix')}` : t(validLang, 'testingPhase')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </AnimatedQuestionCard>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Sticky CTA Container */}
                <div className="fixed bottom-0 left-0 right-0 z-100 lg:hidden pointer-events-none p-4 safe-bottom">
                    {/* Background Fade Gradient */}
                    <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-transparent -z-10 h-32 pointer-events-none" />

                    <Link
                        href={`/${lang}/quiz/${item.id}`}
                        className="relative w-full h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center gap-4 shadow-[0_15px_35px_rgba(var(--primary-rgb),0.5)] overflow-hidden active:scale-95 transition-transform pointer-events-auto"
                    >
                        <div className="absolute inset-0 z-0">
                            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-linear-to-r from-transparent via-white/20 to-transparent opacity-30 animate-shimmer" />
                        </div>

                        <div className="relative flex items-center gap-3 z-10">
                            <div className="p-1.5 bg-white/15 rounded-lg shrink-0">
                                <Play size={20} fill="currentColor" />
                            </div>
                            <div className="flex flex-col items-start leading-none uppercase tracking-tighter">
                                <span className="text-base font-black tracking-tight">{t(validLang, 'startQuiz')}</span>
                                <span className="text-[7px] opacity-70 font-bold mt-0.5 uppercase tracking-[0.2em] leading-none">
                                    {getLangLabel()}
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </ClientSideDetailEffects >
    );
}
