import { Trophy } from "lucide-react";
import { getTopScores } from "@/lib/api";

export default async function Leaderboard({ contentId }: { contentId: string }) {
    const data = await getTopScores(contentId, { revalidate: 60 });
    const scores = data.map((s: any) => ({
        userName: s.guestName || 'Anonymous',
        score: s.score,
    }));

    return (
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 w-full max-w-sm shadow-[0_30px_60px_rgba(0,0,0,0.4)] min-h-[400px]">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-2 bg-warning/20 rounded-xl">
                    <Trophy className="text-warning" size={24} />
                </div>
                <h2 className="text-xl font-black text-foreground tracking-widest uppercase">High Scores</h2>
            </div>

            <div className="space-y-3">
                {scores.length > 0 ? (
                    scores.map((s, idx) => (
                        <div
                            key={`${s.userName}-${idx}`}
                            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 transition-colors duration-300 shadow-sm hover:bg-white/[0.07]"
                        >
                            <div className="flex items-center gap-4">
                                <span className={`text-lg font-black w-6 text-center ${idx === 0 ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : idx === 1 ? 'text-zinc-400' : idx === 2 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                                    {idx + 1}
                                </span>
                                <span className="text-foreground/90 font-bold tracking-tight">{s.userName}</span>
                            </div>
                            <span className="text-primary font-black tracking-wider">{s.score} <span className="text-[10px] opacity-50 font-medium">PTS</span></span>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground text-xs font-medium py-4">No scores yet. Be the first!</p>
                )}
            </div>
        </div>
    );
}
