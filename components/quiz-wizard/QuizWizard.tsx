"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t, Language } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, Save, Check } from "lucide-react";
import { createUserContent, addQuestions } from "@/lib/api";
import { toast } from "sonner";
import Step1Config from "./Step1Config";
import Step2Metadata from "./Step2Metadata";
import Step3Questions from "./Step3Questions";

const getYoutubeId = (url: string) => {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
};

interface QuizWizardProps {
  lang: Language;
  accessToken: string;
}

export default function QuizWizard({ lang, accessToken }: QuizWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "MOVIE",
    subcategory: "",
    languages: [lang] as Language[], // Default to current lang
    posterUrl: "",
    translations: {
      en: { title: "", description: "" },
      tr: { title: "", description: "" },
      ar: { title: "", description: "" },
    } as Record<Language, { title: string; description: string }>,
    levels: [] as { id: number; questions: any[] }[], // Array of { id, questions: [] }
  });

  const nextStep = () => {
    // Validation
    if (step === 1) {
      if (formData.languages.length === 0) {
        toast.error(t(lang, "selectLanguages"));
        return;
      }
    }
    if (step === 2) {
      // Check if titles are filled for selected languages
      for (const l of formData.languages) {
        if (!formData.translations[l as Language]?.title) {
          toast.error(`${t(lang, "title")} (${l.toUpperCase()}) is required`);
          return;
        }
      }
      /* Poster URL check removed - auto generated */
    }

    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Determine Poster URL from First Video Question
      const allQuestions = formData.levels.flatMap((l) => l.questions);
      const firstVideoQ = allQuestions.find(
        (q: any) => q.type === "VIDEO" && q.mediaUrl,
      );
      let autoPosterUrl = "";

      if (firstVideoQ && firstVideoQ.mediaUrl) {
        const videoId = getYoutubeId(firstVideoQ.mediaUrl);
        if (videoId) {
          autoPosterUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
      }

      // 1.5. Validation: Poster Must Exist
      if (!autoPosterUrl) {
        toast.error(t(lang, "posterRequired") || "Kapak fotoğrafı oluşturulamadı. Lütfen Step 3'e en az bir geçerli YouTube video linki ekleyin.");
        setLoading(false);
        return;
      }

      // 2. Create Content
      const contentPayload: any = {
        type: formData.type,
        posterUrl: autoPosterUrl, // Use auto-generated URL
        isPublished: true,
        translations: formData.languages.map((l: string) => ({
          language: l,
          title: formData.translations[l as Language].title,
          description: formData.translations[l as Language].description,
        })),
      };

      if (formData.type === "SPORTS" && formData.subcategory) {
        contentPayload.subcategory = formData.subcategory;
      }

      const content = await createUserContent(accessToken, contentPayload);
      const contentId = content.id;

      // 3. Create Questions
      // 2. Create Questions
      const questions = formData.levels.flatMap((l) => l.questions); // Flatten legacy level structure if we keep it in UI for a moment, or better:

      // Wait, I should refactor the State first to be flat.
      // But to save time and risk, I can just flatten the existing "levels" array into one "questions" array for submission.
      // Since the user wants "Levels removed", the UI shouldn't show "Level 1".
      // I will refactor Step3Questions next.
      // For now, let's update submission logic to assume flat list (or flattened).

      const questionsPayload = questions.map((q: any) => ({
        type: q.type,
        videoUrl: q.type === "VIDEO" ? q.mediaUrl : undefined,
        imageUrl: q.type === "IMAGE" ? q.mediaUrl : undefined,
        startTime: q.startTime || 0,
        endTime: q.endTime || 0,
        stopTime: q.stopTime || 0,
        translations: formData.languages.map((l: string) => ({
          language: l,
          text: q.translations[l]?.question || "...",
        })),
        options: (q.translations[formData.languages[0]]?.answers || []).map(
          (_: any, ansIdx: number) => ({
            isCorrect: (q.correctAnswerIndex ?? 0) === ansIdx,
            translations: formData.languages
              .map((l: string) => ({
                language: l,
                text: q.translations[l]?.answers?.[ansIdx] || "",
              }))
              .filter((t) => t.text),
          }),
        ),
      }));

      console.log(`Adding ${questionsPayload.length} questions...`);
      await addQuestions({
        contentId,
        questions: questionsPayload,
      });
      console.log(`Questions added.`);

      // Success!
      router.push(`/${lang}/content/${contentId}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-700">
      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-12 relative px-2">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 rounded-full -z-10" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-primary rounded-full -z-10 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        />

        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500 relative ${step > s
                ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] scale-100"
                : step === s
                  ? "bg-background border-2 border-primary text-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] scale-110"
                  : "bg-background/50 backdrop-blur-md border border-white/10 text-muted-foreground scale-90"
              }`}
          >
            {step > s ? <Check size={20} strokeWidth={3} /> : s}
            {step === s && (
              <div className="absolute -inset-2 rounded-full border border-primary/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
            )}
          </div>
        ))}
      </div>

      <h1 className="text-3xl md:text-4xl font-black mb-10 text-center text-foreground tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
        {step === 1 && t(lang, "setup")}
        {step === 2 && t(lang, "metadata")}
        {step === 3 && t(lang, "questions")}
      </h1>

      {step === 1 && (
        <Step1Config
          lang={lang}
          formData={formData}
          setFormData={setFormData}
        />
      )}
      {step === 2 && (
        <Step2Metadata
          lang={lang}
          formData={formData}
          setFormData={setFormData}
        />
      )}
      {step === 3 && (
        <Step3Questions
          lang={lang}
          formData={formData}
          setFormData={setFormData}
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-12 bg-background/60 backdrop-blur-2xl p-4 md:p-6 rounded-2xl border border-white/5 sticky bottom-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)] z-50">
        <button
          onClick={prevStep}
          disabled={step === 1 || loading}
          className="px-6 py-3 md:px-8 md:py-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-0 disabled:pointer-events-none flex items-center gap-2 font-bold transition-all duration-300"
        >
          <ArrowLeft size={20} />{" "}
          <span className="hidden md:inline">{t(lang, "back")}</span>
        </button>

        {step < 3 ? (
          <button
            onClick={nextStep}
            className="group relative overflow-hidden px-8 py-3 md:px-10 md:py-4 bg-white text-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center gap-2 font-black tracking-widest uppercase shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            {t(lang, "next")}{" "}
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="group relative overflow-hidden px-8 py-3 md:px-10 md:py-4 bg-primary text-primary-foreground rounded-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center gap-2 font-black tracking-widest uppercase shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-xl">
              <div className="absolute top-0 -inset-full h-full w-[150%] z-5 block transform -skew-x-12 bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer" />
            </div>
            <span className="relative z-10 flex items-center gap-2">
              {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
              ) : (
                <Save size={20} />
              )}
              {t(lang, "finish")}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
