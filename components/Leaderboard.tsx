"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { getTopScores } from "@/lib/api";

interface HighScore {
    userName: string;
    score: number;
    avatarUrl?: string;
}

export default function Leaderboard({ contentId }: { contentId: string }) {
    const [scores, setScores] = useState<HighScore[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const data = await getTopScores(contentId);
                // Map backend DTO to local interface
                // Backend returns: { id, guestName, score, ... }
                const mappedScores = data.map((s: any) => ({
                    userName: s.guestName || 'Anonymous',
                    score: s.score,
                    avatarUrl: undefined
                })); // Take top 10
                setScores(mappedScores);
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
            } finally {
                setLoading(false);
            }
        };

        fetchScores();
    }, [contentId]);

    return (
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 w-full max-w-sm shadow-[0_30px_60px_rgba(0,0,0,0.4)] min-h-[400px]">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-2 bg-warning/20 rounded-xl">
                    <Trophy className="text-warning" size={24} />
                </div>
                <h3 className="text-xl font-black text-foreground tracking-[0.1em] uppercase">High Scores</h3>
            </div>

            <div className="space-y-3">
                {loading ? (
                    [...Array(5)].map((_, i) => (
                        <div key={`sk-${i}`} className="h-[60px] w-full bg-white/5 rounded-xl animate-pulse border border-white/5" />
                    ))
                ) : (
                    scores.map((s, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.05)" }}
                            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 transition-all duration-300 shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <span className={`text-lg font-black w-6 text-center ${idx === 0 ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : idx === 1 ? 'text-zinc-400' : idx === 2 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                                    {idx + 1}
                                </span>
                                <span className="text-foreground/90 font-bold tracking-tight">{s.userName}</span>
                            </div>
                            <span className="text-primary font-black tracking-wider">{s.score} <span className="text-[10px] opacity-50 font-medium">PTS</span></span>
                        </motion.div>
                    ))
                )}
            </div>
            {scores.length === 0 && !loading && (
                <p className="text-center text-muted-foreground text-xs font-medium py-4">No scores yet. Be the first!</p>
            )}
        </div>
    );
}
