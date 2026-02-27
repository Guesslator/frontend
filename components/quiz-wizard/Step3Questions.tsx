"use client";

import { useState, useEffect } from "react";
import { t, Language } from "@/lib/i18n";
import { Plus, Trash, Image as ImageIcon, Video, Type } from "lucide-react";
import FileUploader from "@/components/FileUploader";

const getYoutubeId = (url: string) => {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
};

const formatSecondsToHHMMSS = (totalSeconds: number) => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return "00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const parseHHMMSSToSeconds = (timeStr: string) => {
  if (!timeStr) return 0;
  const parts = timeStr.split(":").map(Number);
  if (parts.some(isNaN)) return 0;

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return 0;
};

const TimeInput = ({ value, onChange, placeholder, className }: any) => {
  const [localValue, setLocalValue] = useState(() =>
    formatSecondsToHHMMSS(value || 0),
  );

  useEffect(() => {
    // Only update local state if it differs significantly to prevent cursor jumping
    if (parseHHMMSSToSeconds(localValue) !== value) {
      setLocalValue(formatSecondsToHHMMSS(value || 0));
    }
  }, [value]);

  const handleBlur = () => {
    const seconds = parseHHMMSSToSeconds(localValue);
    setLocalValue(formatSecondsToHHMMSS(seconds));
    onChange(seconds);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^[\d:]*$/.test(val)) {
      setLocalValue(val);
      onChange(parseHHMMSSToSeconds(val));
    }
  };

  return (
    <input
      type="text"
      placeholder={placeholder || "00:00"}
      className={className}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};

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
  useEffect(() => {
    if (formData.levels.length === 0) {
      setFormData({
        ...formData,
        levels: [{ id: "main", questions: [] }],
      });
    }
  }, [formData.levels.length, setFormData, formData]);

  if (formData.levels.length === 0) {
    return null; // Await initial structural injection
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

  const firstVideo = questions.find(
    (q: any) => q.type === "VIDEO" && q.mediaUrl,
  );
  const bannerVideoId = firstVideo ? getYoutubeId(firstVideo.mediaUrl) : "";
  const derivedBannerUrl = bannerVideoId
    ? `https://img.youtube.com/vi/${bannerVideoId}/hqdefault.jpg`
    : "/placeholder-banner.jpg";

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Banner Preview */}
      <div className="bg-background/40 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col md:flex-row items-center gap-6 md:gap-8 group relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="w-full md:w-[160px] aspect-video md:aspect-2/3 bg-background/50 rounded-xl overflow-hidden border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] shrink-0 relative group/image">
          <img
            src={derivedBannerUrl}
            alt="Quiz Banner Preview"
            className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110"
            onError={(e) =>
              ((e.target as HTMLImageElement).src = "/placeholder-banner.jpg")
            }
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-500" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
            {t(lang, "bannerPreview") || "Banner Preview"}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {derivedBannerUrl.includes("placeholder")
              ? "Add a video question to generate the quiz banner automatically."
              : "This cinematic image will be used as the quiz banner (derived from first video)."}
          </p>
        </div>
      </div>

      {questions.map((q: any, qIndex: number) => (
        <div
          key={q.id}
          className="bg-background/40 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group/q"
        >
          {/* subtle highlight edge */}
          <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <span className="bg-primary/20 border border-primary/30 px-4 py-1.5 rounded-full text-sm font-black text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
                Q{qIndex + 1}
              </span>
              <div className="flex gap-1 bg-background/50 backdrop-blur-md rounded-xl p-1 border border-white/5">
                {["VIDEO", "IMAGE", "TEXT"].map((type) => (
                  <button
                    key={type}
                    onClick={() => updateQuestion(qIndex, "type", type)}
                    className={`p-2.5 rounded-lg transition-all duration-300 ${q.type === type ? "bg-white text-black shadow-md scale-105" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
                    title={t(lang, type.toLowerCase() as any)}
                  >
                    {type === "VIDEO" && <Video size={18} />}
                    {type === "IMAGE" && <ImageIcon size={18} />}
                    {type === "TEXT" && <Type size={18} />}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => removeQuestion(qIndex)}
              className="text-muted-foreground hover:text-red-400 hover:bg-red-400/10 p-2.5 rounded-xl transition-all duration-300 ml-auto md:ml-0"
            >
              <Trash size={20} />
            </button>
          </div>

          {q.type === "VIDEO" && (
            <div className="mb-8 space-y-4">
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                {t(lang, "mediaType")}{" "}
                <span className="text-primary/70 ml-1">(YouTube URL)</span>
              </label>

              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full h-14 bg-background/50 backdrop-blur-md border border-white/5 rounded-2xl px-5 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground/50 hover:bg-white/5 font-medium"
                value={q.mediaUrl || ""}
                onChange={(e) =>
                  updateQuestion(qIndex, "mediaUrl", e.target.value)
                }
              />

              {q.mediaUrl && (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/10 mt-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group/video">
                  <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-2xl z-10" />
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${getYoutubeId(q.mediaUrl)}?autoplay=0`}
                    title="Video Preview"
                    frameBorder="0"
                    className="relative z-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
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
                className="space-y-4 p-5 md:p-6 bg-background/30 backdrop-blur-md rounded-2xl border border-white/5 relative group/translation"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-black tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg">
                    {l.toUpperCase()}
                  </span>
                </div>

                {/* Question Input */}
                <div className="relative">
                  <input
                    type="text"
                    maxLength={100}
                    placeholder={`${t(lang, "enterQuestion")} (${l.toUpperCase()})`}
                    className="w-full h-14 bg-background/50 backdrop-blur-md border border-white/5 rounded-2xl px-5 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground/50 hover:bg-white/5 font-medium pr-16"
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
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground bg-white/5 px-2 py-1 rounded-md">
                    {(q.translations[l]?.question || "").length}/100
                  </span>
                </div>

                {/* Answers List */}
                <div className="space-y-3 mt-6">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      {t(lang, "answers")}
                    </label>
                    <span className="text-[10px] font-black text-primary/70 uppercase tracking-widest">
                      {t(lang, "correctAnswer")}
                    </span>
                  </div>

                  {(q.translations[l]?.answers || [""]).map(
                    (ans: string, ansIndex: number) => (
                      <div
                        key={ansIndex}
                        className="flex gap-3 items-center group/answer"
                      >
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            maxLength={50}
                            placeholder={`${t(lang, "enterAnswer")} ${ansIndex + 1}`}
                            className={`w-full h-12 bg-background/50 backdrop-blur-md border ${q.correctAnswerIndex === ansIndex ? "border-primary/50 shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)]" : "border-white/5"} rounded-xl px-4 text-foreground focus:outline-none focus:border-primary/30 transition-all duration-300 placeholder:text-muted-foreground/50 hover:bg-white/5 font-medium pr-14`}
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
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">
                            {ans.length}/50
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() =>
                              updateQuestion(
                                qIndex,
                                "correctAnswerIndex",
                                ansIndex,
                              )
                            }
                            className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-500 hover:scale-105 active:scale-95 ${q.correctAnswerIndex === ansIndex ? "border-primary bg-primary/20 text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]" : "border-white/10 text-muted-foreground hover:border-white/30 bg-background/50"}`}
                            title={t(lang, "makeCorrect")}
                          >
                            <div
                              className={`w-3 h-3 rounded-full transition-all duration-500 ${q.correctAnswerIndex === ansIndex ? "bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)] scale-100" : "bg-transparent scale-0"}`}
                            />
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
                              className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-300"
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
                    className="inline-flex items-center gap-2 mt-4 text-[11px] font-black uppercase tracking-widest text-primary hover:text-primary-foreground hover:bg-primary/20 px-4 py-2 rounded-lg transition-all duration-300"
                  >
                    <Plus size={14} strokeWidth={3} />{" "}
                    {t(lang, "addQuestion").replace("Question", "Answer")}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Timing Controls */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 bg-background/30 backdrop-blur-md rounded-2xl border border-white/5 relative overflow-hidden group/time">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-white/10 to-transparent" />
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 text-center sm:text-left">
                {t(lang, "startTime")}{" "}
                <span className="text-white/30 truncate">(HH:MM:SS)</span>
              </label>
              <TimeInput
                className="w-full h-12 bg-background/50 backdrop-blur-md border border-white/5 rounded-xl px-4 text-center text-foreground font-black text-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 hover:bg-white/5"
                value={q.startTime || 0}
                onChange={(seconds: number) =>
                  updateQuestion(qIndex, "startTime", seconds)
                }
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 text-center sm:text-left">
                {t(lang, "stopTime")}{" "}
                <span className="text-white/30 truncate">(HH:MM:SS)</span>
              </label>
              <TimeInput
                className="w-full h-12 bg-background/50 backdrop-blur-md border border-white/5 rounded-xl px-4 text-center text-primary font-black text-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)] hover:bg-white/5"
                value={q.stopTime || 0}
                onChange={(seconds: number) =>
                  updateQuestion(qIndex, "stopTime", seconds)
                }
                placeholder="Freeze Time"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 text-center sm:text-left">
                {t(lang, "endTime")}{" "}
                <span className="text-white/30 truncate">(HH:MM:SS)</span>
              </label>
              <TimeInput
                className="w-full h-12 bg-background/50 backdrop-blur-md border border-white/5 rounded-xl px-4 text-center text-foreground font-black text-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 hover:bg-white/5"
                value={q.endTime || 0}
                onChange={(seconds: number) =>
                  updateQuestion(qIndex, "endTime", seconds)
                }
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addQuestion}
        className="w-full py-6 md:py-8 border-2 border-dashed border-white/10 rounded-3xl text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 flex flex-col items-center justify-center gap-3 font-black tracking-widest uppercase mb-10 group"
      >
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-transform duration-500">
          <Plus size={24} className="group-hover:text-primary" />
        </div>
        {t(lang, "addQuestion")}
      </button>
    </div>
  );
}
