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
import ClientSideDetailEffects, { PremiumPoster, AnimatedHeading, AnimatedQuestionCard, AnimatedProgressBar } from "@/components/ClientSideDetailEffects";

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

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_90%)] z-0" />
                <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent pointer-events-none z-0" />

                <div className="relative z-30 container mx-auto px-4 pt-24 pb-8 min-h-screen flex flex-col">

                    <div className="flex flex-col md:flex-row gap-12 items-start mt-8">
                        {/* Poster - 3D interactions */}
                        <div className="w-full md:w-1/3 max-w-[400px] mx-auto md:mx-0 z-10 sticky top-24">
                            <PremiumPoster
                                src={item.posterUrl}
                                alt={title}
                                badge="Premium Quiz"
                                status={item.quizType + " Content"}
                            />

                            {/* Leaderboard Sidebar - Desktop only here, move below title on mobile */}
                            <div className="mt-8 hidden md:block">
                                <Leaderboard contentId={id} />
                            </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 md:pt-4">
                            <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-6">
                                <h1 className="text-5xl md:text-8xl font-black tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-white leading-[0.9]">
                                    {title}
                                </h1>

                                {/* Edit Button */}
                                {isCreator && (
                                    <Link
                                        href={`/${lang}/quiz/${id}/edit`}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-bold shadow-lg"
                                    >
                                        <Edit size={16} />
                                        {t(validLang, 'editQuiz') || 'Edit Quiz'}
                                    </Link>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-4 mb-8">
                                {quizTypeInfo && (
                                    <div className="px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center gap-3 shadow-2xl z-40">
                                        <quizTypeInfo.icon size={18} className={quizTypeInfo.color} />
                                        <span className={`text-xs font-black uppercase tracking-[0.2em] ${quizTypeInfo.color}`}>
                                            {quizTypeInfo.label}
                                        </span>
                                    </div>
                                )}

                                <div className="px-5 py-2.5 rounded-full bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 flex items-center gap-3 shadow-2xl z-40">
                                    <Globe size={18} className="text-blue-400" />
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
                                        {getLangLabel()}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-zinc-900/60 p-8 md:p-12 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl mb-12 max-w-2xl shadow-2xl relative overflow-hidden group min-h-[160px]">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -translate-y-16 translate-x-16" />
                                <h2 className="text-[10px] uppercase tracking-[0.4em] text-primary/60 font-black mb-6">Synopsis</h2>
                                <p className="text-xl md:text-2xl text-foreground/90 leading-relaxed font-light">
                                    {(translation as any)?.description || (translation as any)?.text || t(validLang, 'noDescription' as any) || 'No description available for this language.'}
                                </p>
                            </div>

                            {/* Mobile Leaderboard - Shown here on mobile */}
                            <div className="md:hidden mb-12">
                                <Leaderboard contentId={id} />
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-6 mb-16 relative">
                                <Link
                                    href={`/${lang}/quiz/${item.id}`}
                                    className="group relative z-30 w-full sm:w-auto inline-flex items-center justify-center gap-4 px-12 py-6 bg-primary text-primary-foreground text-2xl font-black rounded-2xl overflow-hidden hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl shadow-primary/30"
                                >
                                    {/* Premium Shimmer Overlay */}
                                    <div className="absolute inset-0 z-0 overflow-hidden">
                                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-linear-to-r from-transparent via-white/40 to-transparent opacity-40 animate-shimmer" />
                                    </div>

                                    <div className="relative flex items-center gap-4">
                                        <div className="p-2 bg-white/20 rounded-full">
                                            <Play size={28} fill="currentColor" />
                                        </div>
                                        <div className="flex flex-col items-start leading-none uppercase tracking-tight">
                                            <span>{t(validLang, 'startQuiz')}</span>
                                            <span className="text-[10px] opacity-70 font-black mt-1 uppercase tracking-[0.2em]">
                                                {t(validLang, 'testLanguage' as any) || 'Test Language'}: {getLangLabel()}
                                            </span>
                                        </div>
                                    </div>
                                </Link>

                                {/* Sticky CTA for Mobile */}
                                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-white/10 z-100 md:hidden">
                                    <Link
                                        href={`/${lang}/quiz/${item.id}`}
                                        className="w-full h-14 bg-primary text-primary-foreground font-black rounded-xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/40 active:scale-95 transition-all"
                                    >
                                        <Play size={20} fill="currentColor" />
                                        {t(validLang, 'startQuiz')}
                                    </Link>
                                </div>

                                {/* Statistics Placeholder */}
                                {/* Statistics */}
                                {item.stats && item.stats.totalAttempts > 0 && (
                                    <div className="flex flex-wrap items-center gap-4 p-6 bg-card/40 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="text-center px-4">
                                            <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em] mb-1">Pass Rate</div>
                                            <div className={`text-3xl font-black ${item.stats.passRate > 70 ? 'text-green-500' : item.stats.passRate > 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                                                {item.stats.passRate}%
                                            </div>
                                        </div>
                                        <div className="h-10 w-px bg-white/10 hidden sm:block"></div>
                                        <div className="text-center px-4">
                                            <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em] mb-1">Avg Score</div>
                                            <div className="text-3xl font-black text-primary">
                                                {item.stats.avgScore}/{item.questions?.length || 10}
                                            </div>
                                        </div>
                                        <div className="h-10 w-px bg-white/10 hidden sm:block"></div>
                                        <div className="text-center px-4">
                                            <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em] mb-1">Total Plays</div>
                                            <div className="text-3xl font-black text-white/90">
                                                {item.stats.totalAttempts}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Question Breakdown with Stats */}
                            {item.questions && item.questions.length > 0 && (
                                <div className="mb-12">
                                    <AnimatedHeading
                                        className="text-2xl font-black mb-8 flex items-center gap-3 border-b border-white/5 pb-4 uppercase tracking-widest text-foreground/80"
                                    >
                                        {(item.quizType === 'VIDEO' || item.questions[0]?.type === 'VIDEO') ? <Film className="text-primary" /> : <ImageIcon className="text-secondary" />}
                                        {t(validLang, 'preview' as any) || 'Quiz Intel'}
                                    </AnimatedHeading>

                                    <div className="grid gap-6">
                                        {item.questions.map((q: any, idx: number) => {
                                            // Real Stats Calculation
                                            const attempts = q.attempts || 0;
                                            const correctCount = q.correctCount || 0;
                                            const rawRate = attempts > 0 ? (correctCount / attempts) * 100 : 0;
                                            const rate = Math.round(rawRate);

                                            // Color logic based on rate
                                            const statsColor = attempts === 0 ? 'bg-muted' : rate > 80 ? 'bg-green-500' : rate > 60 ? 'bg-yellow-500' : 'bg-red-500';
                                            const textColor = attempts === 0 ? 'text-muted-foreground' : rate > 80 ? 'text-green-500' : rate > 60 ? 'text-yellow-500' : 'text-red-500';

                                            const isGif = q.videoUrl?.toLowerCase().endsWith('.gif') || q.videoUrl?.includes('giphy.com');

                                            return (
                                                <AnimatedQuestionCard
                                                    key={q.id || idx}
                                                    idx={idx}
                                                    className="flex flex-col sm:flex-row gap-6 bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all duration-500 backdrop-blur-md shadow-xl group/card"
                                                >

                                                    {/* Thumbnail - with hover scale */}
                                                    <div className="w-full sm:w-56 aspect-video rounded-xl overflow-hidden shrink-0 bg-black relative shadow-2xl">
                                                        {isGif ? (
                                                            <Image
                                                                src={q.videoUrl}
                                                                alt={`Question ${idx + 1}`}
                                                                fill
                                                                className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                                                                unoptimized={true}
                                                            />
                                                        ) : q.videoUrl ? (
                                                            <div className="w-full h-full transition-transform duration-700 group-hover/card:scale-110">
                                                                <YouTubeThumbnail
                                                                    videoUrl={q.videoUrl}
                                                                    alt={`Question ${idx + 1}`}
                                                                    className="w-full h-full"
                                                                />
                                                            </div>
                                                        ) : q.imageUrl ? (
                                                            <Image src={q.imageUrl} alt={`Q${idx + 1}`} fill className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" sizes="(max-width: 768px) 100vw, 224px" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground font-black">Q{idx + 1}</div>
                                                        )}

                                                        {/* Glow Overlay */}
                                                        <div className="absolute inset-0 bg-linear-to-t from-primary/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                                                    </div>

                                                    {/* Stats Bar - Refined */}
                                                    <div className="flex-1 flex flex-col justify-center">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <span className={`text-xs font-black uppercase tracking-[0.2em] ${textColor}`}>
                                                                {attempts > 0 ? `${rate}% Pass Rate` : 'Untested'}
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/5">
                                                            <AnimatedProgressBar
                                                                progress={attempts > 0 ? rate : 0}
                                                                idx={idx}
                                                                statsColor={statsColor}
                                                            />
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground mt-3 font-black uppercase tracking-wider opacity-60">
                                                            {attempts > 0
                                                                ? `${correctCount} Correct / ${attempts} Total`
                                                                : 'Be the first contender'}
                                                        </p>
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
            </div>
        </ClientSideDetailEffects >
    );
}
