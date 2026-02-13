"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Step3Questions from "@/components/quiz-wizard/Step3Questions";
import { updateQuestions, APIContentItem } from "@/lib/api";
import { Loader2, Save, X } from "lucide-react";
import { t } from "@/lib/i18n";

import { useSession } from "next-auth/react";

interface QuizEditorProps {
  item: APIContentItem;
  lang: string;
}

export default function QuizEditor({ item, lang }: QuizEditorProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);

  // Transform API item to Wizard FormData
  const initialQuestions = (item.questions || []).map((q: any) => {
    // Map API translations to Wizard translations
    const translations: any = {};
    const supportedLangs = Object.keys(item.translations);

    supportedLangs.forEach((l) => {
      const qTrans = q.translations[l];
      const answers =
        q.options?.map((o: any) => o.translations[l]?.text || "") || [];
      translations[l] = {
        question: qTrans?.text || "",
        answers: answers,
      };
    });

    // Find correct answer index from first option that is correct
    const correctIndex = q.options?.findIndex((o: any) => o.isCorrect) ?? 0;

    return {
      id: q.id,
      type: q.type,
      mediaUrl: q.videoUrl || q.imageUrl || q.audioUrl || "",
      stopTime: q.stopTime,
      startTime: q.startTime,
      endTime: q.endTime,
      correctAnswerIndex: correctIndex >= 0 ? correctIndex : 0,
      translations,
      duration: (q.endTime || 0) - (q.startTime || 0),
    };
  });

  const [formData, setFormData] = useState({
    levels: [{ id: "main", questions: initialQuestions }],
    languages: Object.keys(item.translations),
  });

  const handleSave = async () => {
    if (!session?.accessToken) {
      toast.error(t(lang, "loginRequired"));
      return;
    }

    setSaving(true);
    try {
      // Transform Wizard Data back to API DTO
      const questionsDto = formData.levels[0].questions.map((q: any) => {
        const questionTranslations = formData.languages.map((l) => ({
          language: l,
          text: q.translations[l]?.question || "",
        }));

        // Determine max number of answers to create options
        const maxAnswers = Math.max(
          ...formData.languages.map(
            (l) => (q.translations[l]?.answers || []).length,
          ),
        );

        const options = [];
        for (let i = 0; i < maxAnswers; i++) {
          const optionTranslations = formData.languages
            .map((l) => ({
              language: l,
              text: q.translations[l]?.answers?.[i] || "",
            }))
            .filter((t) => t.text); // Filter empty? Or keep to preserve index? Keep empty if needed.

          options.push({
            isCorrect: i === q.correctAnswerIndex,
            translations: optionTranslations,
          });
        }

        return {
          id: typeof q.id === "string" && q.id.length > 20 ? q.id : undefined,
          type: q.type,
          videoUrl: q.type === "VIDEO" ? q.mediaUrl : undefined,
          imageUrl: q.type === "IMAGE" ? q.mediaUrl : undefined,
          audioUrl: q.type === "AUDIO" ? q.mediaUrl : undefined,
          startTime: q.startTime,
          stopTime: q.stopTime,
          endTime: q.endTime,
          translations: questionTranslations,
          options,
        };
      });

      await updateQuestions(session.accessToken, {
        contentId: item.id,
        questions: questionsDto,
      });

      router.push(`/${lang}/content/${item.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save quiz updates.");
      setSaving(false);
    }
  };

  return (
    <div className="bg-background min-h-screen text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black">
            {t(lang as any, "editQuiz") || "Edit Quiz"}
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 rounded-full border border-border hover:bg-muted transition-colors flex items-center gap-2"
            >
              <X size={18} /> {t(lang as any, "cancel") || "Cancel"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-2 font-bold"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {t(lang as any, "save") || "Save Changes"}
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <Step3Questions
            lang={lang as any}
            formData={formData}
            setFormData={setFormData}
          />
        </div>
      </div>
    </div>
  );
}
