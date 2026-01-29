import Link from 'next/link';
import { fetchContentDetail } from '../../../../lib/api';
import Leaderboard from '@/components/Leaderboard';
import { Film, Image as ImageIcon, Play, Globe, Edit } from 'lucide-react';
import { t } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
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
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden transition-colors duration-300">
            <Navbar lang={lang} />
            {/* Background Ambience */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-110 pointer-events-none"
                style={{ backgroundImage: `url(${item.posterUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />

            <div className="relative z-30 container mx-auto px-4 pt-24 pb-8 min-h-screen flex flex-col">

                <div className="flex flex-col md:flex-row gap-12 items-start mt-8">
                    {/* Poster */}
                    <div className="w-full md:w-1/3 max-w-sm mx-auto md:mx-0">
                        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-border group mb-8">
                            <img
                                src={item.posterUrl}
                                alt={translation?.title || 'Quiz poster'}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>

                        {/* Leaderboard Sidebar - Moved here for mobile flow, or keep as separate col */}
                        <Leaderboard contentId={id} />
                    </div>

                    {/* Details */}
                    <div className="flex-1 md:pt-4">
                        <div className="flex justify-between items-start mb-6">
                            <h1 className="text-5xl md:text-7xl font-black tracking-tight drop-shadow-lg text-foreground">
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
                                href={`/${lang}/quiz/${item.slug || id}`}
                                className="relative z-50 w-full sm:w-auto inline-flex items-center justify-center gap-3 px-12 py-5 bg-gradient-to-r from-primary to-primary/80 text-black text-2xl font-black rounded-full hover:scale-105 hover:shadow-[0_0_30px_rgba(var(--primary),0.6)] transition-all duration-300"
                            >
                                <Play size={36} fill="currentColor" className="text-black" />
                                <div className="flex flex-col items-start leading-none">
                                    <span>{t(validLang, 'startQuiz')}</span>
                                    <span className="text-xs opacity-80 font-medium mt-1 uppercase tracking-wider">{getLangLabel()}</span>
                                </div>
                            </Link>

                            {/* Statistics Placeholder */}
                            {/* Statistics */}
                            {item.stats && item.stats.totalAttempts > 0 && (
                                <div className="flex items-center gap-4 px-6 py-4 bg-card/60 rounded-2xl border border-border backdrop-blur-sm animate-in fade-in zoom-in duration-500">
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Pass Rate</div>
                                        <div className={`text-2xl font-black ${item.stats.passRate > 70 ? 'text-green-500' : item.stats.passRate > 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                                            {item.stats.passRate}%
                                        </div>
                                    </div>
                                    <div className="h-8 w-px bg-border"></div>
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Avg Score</div>
                                        <div className="text-2xl font-black text-blue-500">
                                            {item.stats.avgScore}/{item.questions?.length || 10}
                                        </div>
                                    </div>
                                    <div className="h-8 w-px bg-border"></div>
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Plays</div>
                                        <div className="text-2xl font-black text-purple-500">
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
                                                        <img
                                                            src={q.videoUrl}
                                                            alt={`Question ${idx + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : q.videoUrl ? (
                                                        <YouTubeThumbnail
                                                            videoUrl={q.videoUrl}
                                                            alt={`Question ${idx + 1}`}
                                                            className="w-full h-full"
                                                        />
                                                    ) : q.imageUrl ? (
                                                        <img src={q.imageUrl} alt={`Q${idx + 1}`} className="w-full h-full object-cover" />
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
