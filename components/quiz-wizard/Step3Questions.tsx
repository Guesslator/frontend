"use client";

import { t, Language } from "@/lib/i18n";
import {
  Plus,
  Trash,
  Image as ImageIcon,
  Video,
  Type,
  Music,
} from "lucide-react";
import FileUploader from "@/components/FileUploader";

interface Step3QuestionsProps {
  lang: Language;
  formData: any;
  setFormData: (data: any) => void;
}

export default function Step3Questions({
  lang,
  formData,
  setFormData,
}: Step3QuestionsProps) {
  // Ensure at least one level exists (container for questions)
  if (formData.levels.length === 0) {
    setFormData({
      ...formData,
      levels: [{ id: "main", questions: [] }],
    });
    return null; // Rerender
  }

  const levelIndex = 0; // Always work on first "level" container
  const questions = formData.levels[0].questions;

  const addQuestion = () => {
    const newLevels = [...formData.levels];
    newLevels[levelIndex].questions.push({
      id: Date.now() + Math.random(),
      type: "VIDEO",
      mediaUrl: "",
      stopTime: 10,
      startTime: 0,
      endTime: 20,
      correctAnswerIndex: 0,
      translations: {
        en: { question: "", answers: [""] },
        tr: { question: "", answers: [""] },
        ar: { question: "", answers: [""] },
      },
      duration: 15,
    });
    setFormData({ ...formData, levels: newLevels });
  };

  const removeQuestion = (qIndex: number) => {
    const newLevels = [...formData.levels];
    newLevels[levelIndex].questions.splice(qIndex, 1);
    setFormData({ ...formData, levels: newLevels });
  };

  const updateQuestion = (qIndex: number, field: string, value: any) => {
    const newLevels = [...formData.levels];
    newLevels[levelIndex].questions[qIndex] = {
      ...newLevels[levelIndex].questions[qIndex],
      [field]: value,
    };
    setFormData({ ...formData, levels: newLevels });
  };

  const updateQuestionTranslation = (
    qIndex: number,
    qLang: string,
    field: "question" | "answer",
    value: string,
  ) => {
    const newLevels = [...formData.levels];
    const currentQ = newLevels[levelIndex].questions[qIndex];
    newLevels[levelIndex].questions[qIndex] = {
      ...currentQ,
      translations: {
        ...currentQ.translations,
        [qLang]: {
          ...currentQ.translations[qLang],
          [field]: value,
        },
      },
    };
    setFormData({ ...formData, levels: newLevels });
  };

  const derivedBannerUrl = questions.find(
    (q: any) => q.type === "VIDEO" && q.mediaUrl,
  )?.mediaUrl
    ? `https://img.youtube.com/vi/${
        questions
          .find((q: any) => q.type === "VIDEO" && q.mediaUrl)
          .mediaUrl.split("v=")[1]
          ?.split("&")[0]
      }/hqdefault.jpg`
    : "/placeholder-banner.jpg";

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
      {/* Banner Preview */}
      <div className="bg-card p-6 rounded-xl border border-border flex items-center gap-6">
        <div className="w-[120px] aspect-[2/3] bg-muted rounded-lg overflow-hidden border border-border shadow-sm flex-shrink-0 relative group">
          <img
            src={derivedBannerUrl}
            alt="Quiz Banner Preview"
            className="w-full h-full object-cover"
            onError={(e) =>
              ((e.target as HTMLImageElement).src = "/placeholder-banner.jpg")
            }
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            {t(lang, "bannerPreview") || "Banner Preview"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {derivedBannerUrl.includes("placeholder")
              ? "Add a video question to generate the quiz banner automatically."
              : "This image will be used as the quiz banner (derived from first video)."}
          </p>
        </div>
      </div>

      {questions.map((q: any, qIndex: number) => (
        <div key={q.id} className="bg-card p-6 rounded-xl border border-border">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-4">
              <span className="bg-muted px-3 py-1 rounded-md text-sm font-bold text-muted-foreground">
                Q{qIndex + 1}
              </span>
              <div className="flex gap-2 bg-muted/50 rounded-lg p-1">
                {["VIDEO", "IMAGE", "AUDIO", "TEXT"].map((type) => (
                  <button
                    key={type}
                    onClick={() => updateQuestion(qIndex, "type", type)}
                    className={`p-2 rounded-md transition-colors ${q.type === type ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    title={t(lang, type.toLowerCase() as any)}
                  >
                    {type === "VIDEO" && <Video size={16} />}
                    {type === "IMAGE" && <ImageIcon size={16} />}
                    {type === "AUDIO" && <Music size={16} />}
                    {type === "TEXT" && <Type size={16} />}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => removeQuestion(qIndex)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash size={16} />
            </button>
          </div>

          {q.type === "VIDEO" && (
            <div className="mb-6 space-y-4">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t(lang, "mediaType")} (YouTube URL Only)
              </label>
              <p className="text-[10px] text-blue-500 mb-2">
                * The thumbnail of the first video will be used as the Quiz
                Banner.
              </p>

              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-background border border-input rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none placeholder-muted-foreground text-foreground transition-colors"
                value={q.mediaUrl || ""}
                onChange={(e) =>
                  updateQuestion(qIndex, "mediaUrl", e.target.value)
                }
              />

              <p className="text-[10px] text-muted-foreground mt-1">
                Only YouTube videos are supported. Please paste the full video
                URL.
              </p>

              {q.mediaUrl && (
                <div className="relative rounded-lg overflow-hidden bg-black aspect-video border border-border mt-2">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${q.mediaUrl.split("v=")[1]?.split("&")[0] || ""}?autoplay=0`}
                    title="Video Preview"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          )}

          {q.type === "AUDIO" && (
            <div className="mb-6 space-y-4">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Audio URL (MP3/WAV)
              </label>
              <input
                type="text"
                placeholder="https://example.com/audio.mp3"
                className="w-full bg-background border border-input rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none placeholder-muted-foreground text-foreground transition-colors"
                value={q.mediaUrl || ""}
                onChange={(e) =>
                  updateQuestion(qIndex, "mediaUrl", e.target.value)
                }
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Direct link to an audio file is recommended. Supported formats:
                MP3, WAV, OGG.
              </p>

              {q.mediaUrl && (
                <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-center border border-border">
                  <audio controls src={q.mediaUrl} className="w-full" />
                </div>
              )}
            </div>
          )}

          {/* Question Content Per Language */}
          <div className="grid grid-cols-1 gap-6">
            {/* Question & Answers */}
            {formData.languages.map((l: string) => (
              <div
                key={l}
                className="space-y-3 p-4 bg-muted/20 rounded-lg border border-border"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
                    {l.toUpperCase()}
                  </span>
                </div>

                {/* Question Input */}
                <div className="relative">
                  <input
                    type="text"
                    maxLength={100}
                    placeholder={`${t(lang, "enterQuestion")} (${l.toUpperCase()})`}
                    className="w-full bg-background border border-input rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none placeholder-muted-foreground text-foreground transition-colors pr-16"
                    value={q.translations[l]?.question || ""}
                    onChange={(e) =>
                      updateQuestionTranslation(
                        qIndex,
                        l,
                        "question",
                        e.target.value,
                      )
                    }
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                    {(q.translations[l]?.question || "").length}/100
                  </span>
                </div>

                {/* Answers List */}
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {t(lang, "answers")}
                    </label>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {t(lang, "correctAnswer")}
                    </span>
                  </div>

                  {(q.translations[l]?.answers || [""]).map(
                    (ans: string, ansIndex: number) => (
                      <div key={ansIndex} className="flex gap-2 items-center">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            maxLength={50}
                            placeholder={`${t(lang, "enterAnswer")} ${ansIndex + 1}`}
                            className={`w-full bg-background border ${q.correctAnswerIndex === ansIndex ? "border-green-500" : "border-input"} rounded-lg px-4 py-2 text-sm focus:border-green-500 focus:outline-none transition-colors text-foreground pr-12`}
                            value={ans}
                            onChange={(e) => {
                              const newAnswers = [
                                ...(q.translations[l]?.answers || [""]),
                              ];
                              newAnswers[ansIndex] = e.target.value;

                              // Update state manually since we changed the structure
                              const newLevels = [...formData.levels];
                              const currentQ =
                                newLevels[levelIndex].questions[qIndex];
                              newLevels[levelIndex].questions[qIndex] = {
                                ...currentQ,
                                translations: {
                                  ...currentQ.translations,
                                  [l]: {
                                    ...currentQ.translations[l],
                                    answers: newAnswers,
                                  },
                                },
                              };
                              setFormData({ ...formData, levels: newLevels });
                            }}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                            {ans.length}/50
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              updateQuestion(
                                qIndex,
                                "correctAnswerIndex",
                                ansIndex,
                              )
                            }
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${q.correctAnswerIndex === ansIndex ? "border-green-500 bg-green-500/20 text-green-500" : "border-muted-foreground text-muted-foreground hover:border-foreground"}`}
                            title={t(lang, "makeCorrect")}
                          >
                            {q.correctAnswerIndex === ansIndex && (
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                            )}
                          </button>

                          {(q.translations[l]?.answers || [""]).length > 1 && (
                            <button
                              onClick={() => {
                                const newAnswers = [
                                  ...(q.translations[l]?.answers || []),
                                ];
                                newAnswers.splice(ansIndex, 1);
                                // Update state manually
                                const newLevels = [...formData.levels];
                                const currentQ =
                                  newLevels[levelIndex].questions[qIndex];

                                // Adjust correct index if needed
                                let newCorrectIndex =
                                  currentQ.correctAnswerIndex;
                                if (newCorrectIndex === ansIndex)
                                  newCorrectIndex = 0;
                                else if (newCorrectIndex > ansIndex)
                                  newCorrectIndex--;

                                newLevels[levelIndex].questions[qIndex] = {
                                  ...currentQ,
                                  correctAnswerIndex: newCorrectIndex,
                                  translations: {
                                    ...currentQ.translations,
                                    [l]: {
                                      ...currentQ.translations[l],
                                      answers: newAnswers,
                                    },
                                  },
                                };
                                setFormData({ ...formData, levels: newLevels });
                              }}
                              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ),
                  )}

                  <button
                    onClick={() => {
                      const newAnswers = [
                        ...(q.translations[l]?.answers || [""]),
                      ];
                      newAnswers.push("");
                      // Update state manually
                      const newLevels = [...formData.levels];
                      const currentQ = newLevels[levelIndex].questions[qIndex];
                      newLevels[levelIndex].questions[qIndex] = {
                        ...currentQ,
                        translations: {
                          ...currentQ.translations,
                          [l]: {
                            ...currentQ.translations[l],
                            answers: newAnswers,
                          },
                        },
                      };
                      setFormData({ ...formData, levels: newLevels });
                    }}
                    className="text-xs font-bold text-green-500 hover:text-green-400 flex items-center gap-1 mt-1 transition-colors"
                  >
                    <Plus size={12} />{" "}
                    {t(lang, "addQuestion").replace("Question", "Answer")}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Timing Controls */}
          <div className="mt-6 grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border border-border">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {t(lang, "startTime")} ({t(lang, "seconds")})
              </label>
              <input
                type="number"
                min={0}
                className="w-full bg-background border border-input rounded-lg px-4 py-2 text-sm text-center focus:border-primary focus:outline-none text-foreground transition-colors"
                value={q.startTime || 0}
                onChange={(e) =>
                  updateQuestion(qIndex, "startTime", parseInt(e.target.value))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {t(lang, "stopTime")} ({t(lang, "seconds")})
              </label>
              <input
                type="number"
                min={0}
                className="w-full bg-background border border-input rounded-lg px-4 py-2 text-sm text-center focus:border-primary focus:outline-none text-foreground transition-colors"
                value={q.stopTime || 0}
                onChange={(e) =>
                  updateQuestion(qIndex, "stopTime", parseInt(e.target.value))
                }
                placeholder="Freeze Time"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {t(lang, "endTime")} ({t(lang, "seconds")})
              </label>
              <input
                type="number"
                min={0}
                className="w-full bg-background border border-input rounded-lg px-4 py-2 text-sm text-center focus:border-primary focus:outline-none text-foreground transition-colors"
                value={q.endTime || 0}
                onChange={(e) =>
                  updateQuestion(qIndex, "endTime", parseInt(e.target.value))
                }
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addQuestion}
        className="w-full py-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors flex items-center justify-center gap-2 font-bold"
      >
        <Plus size={20} /> {t(lang, "addQuestion")}
      </button>
    </div>
  );
}
