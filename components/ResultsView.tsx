"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { submitScore, getTopScores, getPercentile, ScoreDto } from "@/lib/api";
import PercentileChart from "./PercentileChart";
import { Trophy, Home, Loader2, ArrowRight, Share2, Check } from "lucide-react";

interface ResultsViewProps {
  score: number;
  totalQuestions: number;
  contentId: string;
  slug?: string;
  lang: string;
}

export default function ResultsView({
  score,
  totalQuestions,
  contentId,
  slug,
  lang,
}: ResultsViewProps) {
  const validLang = (["tr", "en", "de"].includes(lang) ? lang : "en") as
    | "tr"
    | "en"
    | "de";

  // State
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [topScores, setTopScores] = useState<ScoreDto[]>([]);
  const [percentile, setPercentile] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Calculate percentage for theme
  const percentage = Math.round((score / totalQuestions) * 100);
  const incorrect = totalQuestions - score;

  // Theme logic
  const theme =
    percentage >= 90
      ? {
          gradient: "from-yellow-500/20 via-black to-black",
          textColor: "text-yellow-400",
          borderColor: "border-yellow-500/30",
          title:
            validLang === "tr"
              ? "MÜKEMMEL!"
              : validLang === "de"
                ? "PERFEKT!"
                : "PERFECT!",
        }
      : percentage >= 70
        ? {
            gradient: "from-gray-400/20 via-black to-black",
            textColor: "text-gray-300",
            borderColor: "border-gray-500/30",
            title:
              validLang === "tr"
                ? "HARIKA!"
                : validLang === "de"
                  ? "GROSSARTIG!"
                  : "GREAT!",
          }
        : percentage >= 50
          ? {
              gradient: "from-orange-600/20 via-black to-black",
              textColor: "text-orange-400",
              borderColor: "border-orange-500/30",
              title:
                validLang === "tr"
                  ? "İYİ!"
                  : validLang === "de"
                    ? "GUT!"
                    : "GOOD!",
            }
          : {
              gradient: "from-red-900/20 via-black to-black",
              textColor: "text-red-400",
              borderColor: "border-red-500/30",
              title:
                validLang === "tr"
                  ? "TEKRAR DENE!"
                  : validLang === "de"
                    ? "NOCHMAL!"
                    : "TRY AGAIN!",
            };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      // Submit Score
      await submitScore({
        contentId,
        score,
        guestName: name,
      });

      // Fetch Data in parallel
      const [scores, perc] = await Promise.all([
        getTopScores(contentId),
        getPercentile(contentId, score),
      ]);

      setTopScores(scores);
      setPercentile(perc);
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    const idToShare = slug || contentId;
    const url = `${window.location.origin}/${lang}/quiz/${idToShare}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div
        className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${theme.gradient} -z-10`}
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`text-center max-w-2xl w-full bg-neutral-900/80 backdrop-blur-xl p-6 sm:p-8 md:p-12 rounded-3xl border ${theme.borderColor} shadow-2xl overflow-y-auto max-h-[90vh]`}
      >
        {/* Header */}
        <h1
          className={`text-4xl md:text-5xl font-black mb-6 ${theme.textColor}`}
        >
          {theme.title}
        </h1>

        <div
          className={`text-7xl md:text-8xl font-bold mb-4 ${theme.textColor} drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]`}
        >
          {percentage}%
        </div>

        <div className="space-y-2 mb-8">
          <p className="text-neutral-300 text-lg">
            <span className="text-green-400 font-bold">{score}</span>{" "}
            {validLang === "tr"
              ? "Doğru"
              : validLang === "de"
                ? "Richtig"
                : "Correct"}{" "}
            • <span className="text-red-400 font-bold">{incorrect}</span>{" "}
            {validLang === "tr"
              ? "Yanlış"
              : validLang === "de"
                ? "Falsch"
                : "Incorrect"}
          </p>
        </div>

        {/* Score Submission Form */}
        {!isSubmitted ? (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 bg-white/5 p-6 rounded-2xl border border-white/10"
            onSubmit={handleScoreSubmit}
          >
            <h3 className="text-xl font-bold mb-4 text-white">
              {validLang === "tr"
                ? "Skorunu Kaydet"
                : validLang === "de"
                  ? "Punktestand speichern"
                  : "Save Your Score"}
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={
                  validLang === "tr"
                    ? "Adın / Takma Adın"
                    : validLang === "de"
                      ? "Dein Name"
                      : "Your Name / Nickname"
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/50 transition-colors"
                required
                maxLength={20}
              />
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="animate-spin" size={20} />}
                {validLang === "tr" ? "Kaydet" : "Save"}
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-8"
          >
            {/* Percentile Chart */}
            {percentile !== null && (
              <PercentileChart percentile={percentile} lang={validLang} />
            )}

            {/* Leaderboard */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-left">
              <div className="flex items-center gap-2 mb-4 text-yellow-500">
                <Trophy size={20} />
                <h3 className="font-bold text-lg text-white">
                  {validLang === "tr" ? "En İyi Skorlar" : "Top Scores"}
                </h3>
              </div>
              <div className="space-y-3">
                {topScores.map((s, idx) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono w-6 text-neutral-500 ${idx < 3 ? "text-yellow-400 font-bold" : ""}`}
                      >
                        #{idx + 1}
                      </span>
                      <span className="font-medium text-neutral-200">
                        {s.guestName}
                      </span>
                    </div>
                    <span className="font-bold text-white">{s.score} pts</span>
                  </div>
                ))}
                {topScores.length === 0 && (
                  <p className="text-neutral-500 text-sm text-center py-4">
                    No scores yet. Be the first!
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all hover:scale-105"
          >
            <Home size={20} />
            {validLang === "tr"
              ? "Ana Sayfaya Dön"
              : validLang === "de"
                ? "Zurück"
                : "Back to Home"}
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-primary/20"
          >
            {isCopied ? <Check size={20} /> : <Share2 size={20} />}
            {isCopied
              ? validLang === "tr"
                ? "Kopyalandı!"
                : validLang === "de"
                  ? "Kopiert!"
                  : "Copied!"
              : validLang === "tr"
                ? "Paylaş"
                : validLang === "de"
                  ? "Teilen"
                  : "Share Quiz"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
