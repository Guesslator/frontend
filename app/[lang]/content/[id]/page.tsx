import Link from 'next/link';
import Image from 'next/image';
import { fetchContentDetail } from '../../../../lib/api';
import Leaderboard from '@/components/Leaderboard';
import { Film, Image as ImageIcon, Play, Globe, Edit } from 'lucide-react';
import { t } from '@/lib/i18n';

import YouTubeThumbnail from '@/components/YouTubeThumbnail';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ContentDetailPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
    const { lang, id } = await params;
    const session = await getServerSession(authOptions);
    const validLang = (['tr', 'en', 'ar', 'de'].includes(lang) ? lang : 'en') as 'tr' | 'en' | 'ar' | 'de';

    const item = await fetchContentDetail(id, validLang);

    if (!item) {
        console.error(`ContentDetailPage: Item not found for ID: ${id}`);
        return <div>Content not found</div>;
    }

    if (item.questions && item.questions.length > 0) {
        // Questions available
    } else {
        // No questions found
    }

    const translation = item.translations[validLang] || item.translations['en'];

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


    const supportedLangs = Object.keys(item.translations);
    const getLangLabel = () => {
        if (supportedLangs.length > 1) return t(validLang, 'multipleLanguages') || 'Multiple Languages';
        const l = supportedLangs[0];
        if (!l) return 'Unknown';
        const names: Record<string, string> = { en: "English", tr: "Turkish", ar: "Arabic", de: "German" };
        return names[l] || l.toUpperCase();
    };

    const isCreator = session?.user?.id === item.creator?.id;

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden transition-colors duration-500">

            {/* Background Ambience - Cinematic Poster Backdrop */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center opacity-25 blur-[100px] scale-125 pointer-events-none"
                style={{ backgroundImage: `url(${item.posterUrl})` }}
            />
            {/* Cinematic Spotlight */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/20 blur-[150px] rounded-full animate-spotlight pointer-events-none" />

            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none z-0" />

            <div className="relative z-30 container mx-auto px-4 pt-24 pb-8 min-h-screen flex flex-col">

                <div className="flex flex-col md:flex-row gap-12 items-start mt-8">
                    {/* Poster */}
                    <div className="w-full md:w-1/3 max-w-sm mx-auto md:mx-0">
                        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-border group mb-8">
                            <Image
                                src={item.posterUrl}
                                alt={translation?.title || 'Quiz poster'}
                                fill
                                priority
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />
                        </div>

                        {/* Leaderboard Sidebar - Moved here for mobile flow, or keep as separate col */}
                        <Leaderboard contentId={id} />
                    </div>

                    {/* Details */}
                    <div className="flex-1 md:pt-4">
                        <div className="flex justify-between items-start mb-6">
                            <h1 className="text-5xl md:text-8xl font-black tracking-tighter drop-shadow-[0_0_30px_rgba(0,0,0,0.5)] text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/60 dark:from-white dark:to-white/50 leading-[0.9] mb-4">
                                {translation?.title || 'Untitled'}
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

                        {/* Quiz Type and Language Badges */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            {quizTypeInfo && (
                                <div className="px-4 py-2 rounded-full bg-card/80 backdrop-blur-md border border-border flex items-center gap-2">
                                    <quizTypeInfo.icon size={16} className={quizTypeInfo.color} />
                                    <span className={`text-sm font-bold ${quizTypeInfo.color}`}>
                                        {quizTypeInfo.label}
                                    </span>
                                </div>
                            )}

                            <div className="px-4 py-2 rounded-full bg-card/80 backdrop-blur-md border border-border flex items-center gap-2">
                                <Globe size={16} className="text-blue-400" />
                                <span className="text-sm font-bold text-blue-400">
                                    {t(validLang, 'language')}: {getLangLabel()}
                                </span>
                            </div>
                        </div>

                        <div className="glass p-8 rounded-2xl mb-12 max-w-2xl">
                            <h3 className="text-sm uppercase tracking-widest text-primary font-bold mb-3">Synapsis</h3>
                            <p className="text-lg text-muted-foreground leading-relaxed font-light">
                                {translation?.description || 'No description available.'}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6 mb-16">
                            <Link
                                href={`/${lang}/quiz/${item.id}`}
                                className="group relative z-50 w-full sm:w-auto inline-flex items-center justify-center gap-4 px-12 py-6 bg-primary text-primary-foreground text-2xl font-black rounded-2xl overflow-hidden hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl shadow-primary/30"
                            >
                                {/* Premium Shimmer Overlay */}
                                <div className="absolute inset-0 z-0 overflow-hidden">
                                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-40 animate-shimmer" />
                                </div>

                                <div className="relative flex items-center gap-4">
                                    <div className="p-2 bg-white/20 rounded-full">
                                        <Play size={28} fill="currentColor" />
                                    </div>
                                    <div className="flex flex-col items-start leading-none">
                                        <span>{t(validLang, 'startQuiz')}</span>
                                        <span className="text-[10px] opacity-70 font-black mt-1 uppercase tracking-[0.2em]">{getLangLabel()}</span>
                                    </div>
                                </div>
                            </Link>

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
                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-border pb-4">
                                    {(item.quizType === 'VIDEO' || item.questions[0]?.type === 'VIDEO') ? <Film className="text-primary" /> : <ImageIcon className="text-secondary" />}
                                    {t(validLang, 'preview' as any) || 'Soru İstatistikleri'}
                                </h3>

                                <div className="space-y-6">
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
                                            <div key={q.id || idx} className="flex flex-col sm:flex-row gap-4 bg-card/50 p-4 rounded-xl border border-border hover:bg-card/80 transition-colors">
                                                {/* Thumbnail */}
                                                <div className="w-full sm:w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-black relative">
                                                    {isGif ? (
                                                        <Image
                                                            src={q.videoUrl}
                                                            alt={`Question ${idx + 1}`}
                                                            fill
                                                            className="w-full h-full object-cover"
                                                            unoptimized={true}
                                                        />
                                                    ) : q.videoUrl ? (
                                                        <YouTubeThumbnail
                                                            videoUrl={q.videoUrl}
                                                            alt={`Question ${idx + 1}`}
                                                            className="w-full h-full"
                                                        />
                                                    ) : q.imageUrl ? (
                                                        <Image src={q.imageUrl} alt={`Q${idx + 1}`} fill className="w-full h-full object-cover" sizes="(max-width: 768px) 100vw, 192px" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">Q{idx + 1}</div>
                                                    )}
                                                </div>

                                                {/* Stats Bar */}
                                                <div className="flex-1 flex flex-col justify-center">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className={`text-sm font-black ${textColor}`}>
                                                            {attempts > 0 ? `${rate}% Correct Rate` : 'No attempts yet'}
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${statsColor.replace('bg-', 'bg-')} transition-all duration-1000`}
                                                            style={{ width: `${attempts > 0 ? rate : 0}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {attempts > 0
                                                            ? `${correctCount} out of ${attempts} players answered correctly.`
                                                            : 'Be the first to play!'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
