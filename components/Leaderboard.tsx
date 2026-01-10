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
        <div className="bg-card/90 backdrop-blur-md rounded-2xl p-6 border border-border w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <Trophy className="text-warning" size={24} />
                <h3 className="text-xl font-bold text-card-foreground tracking-wide">High Scores</h3>
            </div>

            <div className="space-y-4">
                {scores.map((s, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                    >
                        <div className="flex items-center gap-3">
                            <span className={`text-lg font-bold w-6 text-center ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                                {idx + 1}
                            </span>
                            <span className="text-foreground font-medium">{s.userName}</span>
                        </div>
                        <span className="text-primary font-bold">{s.score} pts</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
