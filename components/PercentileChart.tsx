'use client';

import { motion } from 'framer-motion';

interface PercentileChartProps {
    percentile: number;
    lang: string;
}

export default function PercentileChart({ percentile, lang }: PercentileChartProps) {
    const isTr = lang === 'tr';
    const isDe = lang === 'de';

    const title = isTr ? 'Yüzdelik Dilim' : isDe ? 'Prozentrang' : 'Percentile Rank';
    const desc = isTr
        ? `Diğer oyuncuların %${percentile}'sinden daha iyi skor yaptın!`
        : isDe
            ? `Du warst besser als ${percentile}% der anderen Spieler!`
            : `You scored better than ${percentile}% of other players!`;

    // Calculate bar width based on percentile, but min 5% for visibility
    const barWidth = Math.max(percentile, 5);

    return (
        <div className="w-full bg-white/5 rounded-2xl p-6 border border-white/10 mt-8">
            <h3 className="text-xl font-bold mb-2 text-white/90">{title}</h3>
            <p className="text-neutral-400 text-sm mb-6">{desc}</p>

            <div className="relative h-8 w-full bg-neutral-800/50 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    className={`h-full rounded-full relative flex items-center justify-end pr-3 ${percentile >= 80 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' :
                            percentile >= 50 ? 'bg-gradient-to-r from-green-600 to-green-400' :
                                'bg-gradient-to-r from-blue-600 to-blue-400'
                        }`}
                >
                    <span className="text-xs font-bold text-black drop-shadow-md">
                        {percentile}%
                    </span>
                </motion.div>
            </div>

            <div className="flex justify-between text-xs text-neutral-500 mt-2 font-mono">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
            </div>
        </div>
    );
}
