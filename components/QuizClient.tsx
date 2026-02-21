"use client";

import { useState, useEffect } from "react";
import VideoQuestionPlayer from "@/components/VideoQuestionPlayer";
import ImageQuestionPlayer from "@/components/ImageQuestionPlayer";
import AudioQuestionPlayer from "@/components/AudioQuestionPlayer";
import ResultsView from "@/components/ResultsView";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  Clock,
  Play,
  Trophy,
  Info,
} from "lucide-react";
import { Quiz } from "@/lib/mockData";
import {
  incrementContentPopularity,
  registerQuestionAttempt,
  trackEvent,
} from "@/lib/api";
import { t } from "@/lib/i18n";

interface QuizClientProps {
  quiz: Quiz;
  lang: string;
}

const ANSWER_TIME_LIMIT = 15; // seconds

export default function QuizClient({ quiz, lang }: QuizClientProps) {
  const validLang = (["tr", "en", "ar", "de"].includes(lang) ? lang : "en") as
    | "tr"
    | "en"
    | "ar"
    | "de";

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isQuestionActive, setIsQuestionActive] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(ANSWER_TIME_LIMIT);

  const shouldReduceMotion = useReducedMotion();

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🎮 Quiz loaded:", {
        totalQuestions: quiz.questions.length,
        currentIndex: currentQuestionIndex,
        isComplete: quizComplete,
      });
    }

    // Increment popularity
    incrementContentPopularity(quiz.contentId);
  }, []);

  const question = quiz.questions[currentQuestionIndex];
  if (!question)
    return <div className="p-8 text-white">Quiz not found or empty.</div>;

  const qText =
    question.translations[validLang]?.text ||
    question.translations["en"]?.text ||
    "Question";

  // Timer effect - countdown when question is active
  useEffect(() => {
    if (!isQuestionActive || isAnswered) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (process.env.NODE_ENV === "development")
            console.log("⏰ Time expired! Auto-submitting as incorrect");
          handleAnswer(null, false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isQuestionActive, isAnswered]);

  const handleQuestionPoint = () => {
    setIsQuestionActive(true);
    setTimeRemaining(ANSWER_TIME_LIMIT);
  };

  const handleAnswer = (optionId: string | null, correct: boolean) => {
    setSelectedOption(optionId);
    setIsCorrect(correct);
    setIsAnswered(true);
    setIsQuestionActive(false);
    if (correct) setScore((s) => s + 1);

    // Register stats
    registerQuestionAttempt(quiz.questions[currentQuestionIndex].id, correct);
  };

  const handleSceneComplete = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setIsAnswered(false);
      setSelectedOption(null);
      setIsCorrect(null);
      setIsQuestionActive(false);
      setTimeRemaining(ANSWER_TIME_LIMIT);
    } else {
      // console.log('🏁 Quiz complete!');
      trackEvent("quiz_completed", { quizId: quiz.contentId });
      setQuizComplete(true);
    }
  };

  // For image and text quizzes, auto-advance after answering
  useEffect(() => {
    if (
      (question.type === "IMAGE" ||
        question.type === "TEXT" ||
        question.type === "AUDIO") &&
      isAnswered
    ) {
      const timer = setTimeout(() => {
        handleSceneComplete();
      }, 2000); // Wait 2 seconds to show feedback
      return () => clearTimeout(timer);
    }
  }, [isAnswered, question.type]);

  // For TEXT questions, trigger "question point" immediately to show options
  useEffect(() => {
    if (question.type === "TEXT" && !isQuestionActive && !isAnswered) {
      const timer = setTimeout(() => {
        handleQuestionPoint();
      }, 500); // Small delay for smooth transition
      return () => clearTimeout(timer);
    }
  }, [question.id, isQuestionActive, isAnswered]);

  if (quizComplete) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const incorrect = quiz.questions.length - score;

    // Performance theme
    return (
      <ResultsView
        score={score}
        totalQuestions={quiz.questions.length}
        contentId={quiz.contentId}
        slug={quiz.slug}
        lang={validLang}
      />
    );
  }

  const overlayVariants = {
    initial: { opacity: 0, backdropFilter: "blur(0px)" },
    animate: {
      opacity: 1,
      backdropFilter: shouldReduceMotion ? "blur(0px)" : "blur(10px)",
    },
    exit: { opacity: 0, backdropFilter: "blur(0px)" },
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative transition-colors duration-300">
      {/* Header Area */}
      <div className="w-full max-w-6xl flex justify-between items-end mb-4 px-2">
        <Link
          href={`/${lang}`}
          aria-label="Exit Quiz"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-sm font-bold tracking-wide">
            {t(lang, "exitQuiz")}
          </span>
        </Link>

        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
            {t(lang, "questionLabel")}
          </span>
          <div className="text-3xl font-black text-primary leading-none flex items-baseline gap-1">
            <span>{String(currentQuestionIndex + 1).padStart(2, "0")}</span>
            <span className="text-lg text-muted-foreground font-medium">/</span>
            <span className="text-lg text-muted-foreground font-medium">
              {String(quiz.questions.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      <div
        className={`w-full max-w-6xl relative shadow-2xl bg-black rounded-2xl overflow-hidden border border-border transition-all duration-500 ease-in-out ${isQuestionActive ? "min-h-[600px] md:min-h-0 md:aspect-video" : "aspect-video"}`}
      >
        {question.type === "VIDEO" ? (
          <VideoQuestionPlayer
            key={`question-${currentQuestionIndex}-${question.videoUrl}`}
            videoUrl={question.videoUrl || ""}
            startTime={question.startTime || 0}
            stopTime={question.stopTime || 0}
            endTime={question.endTime || 0}
            onQuestionPointReached={handleQuestionPoint}
            onSceneComplete={handleSceneComplete}
            isQuestionActive={isQuestionActive}
            isAnswered={isAnswered}
          />
        ) : question.type === "AUDIO" ? (
          <AudioQuestionPlayer
            key={`question-${currentQuestionIndex}-${question.audioUrl}`}
            audioUrl={question.audioUrl || ""}
            startTime={question.startTime || 0}
            stopTime={question.stopTime || 0}
            endTime={question.endTime || 0}
            onQuestionPointReached={handleQuestionPoint}
            onSceneComplete={handleSceneComplete}
            isQuestionActive={isQuestionActive}
            isAnswered={isAnswered}
          />
        ) : question.type === "IMAGE" ? (
          <ImageQuestionPlayer
            key={`question-${currentQuestionIndex}-${question.imageUrl}`}
            imageUrl={question.imageUrl || ""}
            onImageLoaded={() => {}}
            onQuestionPointReached={handleQuestionPoint}
            isQuestionActive={isQuestionActive}
            isAnswered={isAnswered}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted/20 p-8 text-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
            <div className="mb-4">
              <span className="text-6xl">📝</span>
            </div>
            <p className="text-muted-foreground text-lg max-w-lg">{qText}</p>
          </div>
        )}

        {/* Question Overlay */}
        <AnimatePresence>
          {isQuestionActive && (
            <motion.div
              variants={overlayVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 bg-background/80 z-20 flex flex-col items-center justify-center p-4 md:p-8 lg:p-16"
            >
              {/* Timer Display */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-8 right-8 flex flex-col items-center gap-2"
              >
                <div className="relative w-12 h-12 md:w-20 md:h-20">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 80 80"
                  >
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-muted/20"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - timeRemaining / ANSWER_TIME_LIMIT)}`}
                      className={`transition-all duration-1000 ${
                        timeRemaining > 10
                          ? "text-green-500"
                          : timeRemaining > 5
                            ? "text-yellow-500"
                            : "text-red-500"
                      }`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className={`text-xl md:text-2xl font-bold ${
                        timeRemaining > 10
                          ? "text-green-500"
                          : timeRemaining > 5
                            ? "text-yellow-500"
                            : "text-red-500"
                      }`}
                    >
                      {timeRemaining}
                    </span>
                  </div>
                </div>
                <Clock size={16} className="text-muted-foreground" />
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-xl md:text-3xl lg:text-5xl font-bold mb-6 md:mb-12 text-center leading-tight drop-shadow-lg text-foreground w-full"
              >
                {qText}
              </motion.h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                {question.options.map((opt, idx) => {
                  const optText =
                    opt.translations[validLang]?.text ||
                    opt.translations["en"]?.text ||
                    "Option";
                  return (
                    <motion.button
                      key={opt.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => handleAnswer(opt.id, opt.isCorrect)}
                      className="group relative p-4 md:p-6 bg-card hover:bg-accent border border-border hover:border-primary/50 rounded-xl text-left transition-all hover:scale-[1.02] shadow-sm flex flex-col justify-center min-h-[80px] md:min-h-[100px]"
                    >
                      <span className="text-base md:text-xl font-medium text-foreground group-hover:text-primary transition-colors break-words whitespace-normal leading-tight">
                        {optText}
                      </span>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback Toast */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className={`absolute bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full font-bold z-30 flex items-center gap-3 shadow-2xl backdrop-blur-md border border-border ${
                isCorrect
                  ? "bg-green-500/20 text-green-500"
                  : "bg-red-500/20 text-red-500"
              }`}
            >
              {isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
              <span className="text-lg">
                {isCorrect
                  ? t(lang, "correctFeedback")
                  : t(lang, "wrongFeedback")}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
