"use client";

import { useState, Suspense } from 'react';
import { addQuestions, AddQuestionsDto } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// Helper for empty translation structure
const emptyTrans = () => ({ en: '', tr: '', de: '' });

function CreateQuizContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const contentId = searchParams.get('contentId');
    const contentTitle = searchParams.get('title');

    const [loading, setLoading] = useState(false);

    // We'll manage state in a simplified local format, then convert to DTO on submit
    const [questions, setQuestions] = useState([
        {
            videoUrl: '',
            startTime: 0,
            stopTime: 10,
            endTime: 20,
            text: emptyTrans(),
            options: [
                { isCorrect: true, text: emptyTrans() },
                { isCorrect: false, text: emptyTrans() }
            ]
        }
    ]);

    const addQuestion = () => {
        setQuestions([...questions, {
            videoUrl: '',
            startTime: 0,
            stopTime: 10,
            endTime: 20,
            text: emptyTrans(),
            options: [
                { isCorrect: true, text: emptyTrans() },
                { isCorrect: false, text: emptyTrans() }
            ]
        }]);
    };

    const updateQuestion = (idx: number, field: string, value: string | number) => {
        const newQ = [...questions];
        // @ts-expect-error - Dynamic field update
        newQ[idx][field] = value;
        setQuestions(newQ);
    };

    const updateQTrans = (idx: number, lang: 'en' | 'tr' | 'de', val: string) => {
        const newQ = [...questions];
        newQ[idx].text[lang] = val;
        setQuestions(newQ);
    };

    const updateOptionTrans = (qIdx: number, oIdx: number, lang: 'en' | 'tr' | 'de', val: string) => {
        const newQ = [...questions];
        newQ[qIdx].options[oIdx].text[lang] = val;
        setQuestions(newQ);
    };

    const addOption = (qIdx: number) => {
        const newQ = [...questions];
        newQ[qIdx].options.push({ isCorrect: false, text: emptyTrans() });
        setQuestions(newQ);
    };

    const removeOption = (qIdx: number, oIdx: number) => {
        const newQ = [...questions];
        if (newQ[qIdx].options.length <= 2) return; // Minimum 2 options
        newQ[qIdx].options.splice(oIdx, 1);
        setQuestions(newQ);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contentId) return;
        setLoading(true);

        const payload: AddQuestionsDto = {
            contentId,
            questions: questions.map(q => {
                // Filter empty translations
                const qTrans = [];
                if (q.text.en) qTrans.push({ language: 'en', text: q.text.en });
                if (q.text.tr) qTrans.push({ language: 'tr', text: q.text.tr });
                if (q.text.de) qTrans.push({ language: 'de', text: q.text.de });

                return {
                    type: 'VIDEO',
                    videoUrl: q.videoUrl,
                    startTime: Number(q.startTime),
                    stopTime: Number(q.stopTime),
                    endTime: Number(q.endTime),
                    translations: qTrans,
                    options: q.options.map(o => {
                        const oTrans = [];
                        if (o.text.en) oTrans.push({ language: 'en', text: o.text.en });
                        if (o.text.tr) oTrans.push({ language: 'tr', text: o.text.tr });
                        if (o.text.de) oTrans.push({ language: 'de', text: o.text.de });

                        return {
                            isCorrect: o.isCorrect,
                            translations: oTrans
                        };
                    })
                };
            })
        };

        try {
            await addQuestions(payload);
            router.push('/admin');
        } catch (err: any) {
            toast.error(err.message || 'Failed to add questions');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!contentId) return <div className="p-8 text-foreground">Missing Content ID</div>;

    return (
        <div className="min-h-screen bg-background text-foreground p-8 flex justify-center transition-colors duration-300">
            <div className="w-full max-w-4xl">
                <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft size={20} /> Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold mb-2 text-foreground">Add Quiz Questions</h1>
                <p className="text-muted-foreground mb-8">For: <span className="text-foreground font-bold">{contentTitle}</span></p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {questions.map((q, qIdx) => (
                        <div key={qIdx} className="bg-card p-6 rounded-xl border border-border relative">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">
                                    {qIdx + 1}
                                </span>
                                Video Question
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs text-muted-foreground mb-1">Video URL (YouTube, Vimeo, mp4...)</label>
                                    <input
                                        type="url" required
                                        className="w-full bg-background border border-input rounded p-2 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                                        value={q.videoUrl} onChange={e => updateQuestion(qIdx, 'videoUrl', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-xs text-muted-foreground mb-1">Start (s)</label>
                                        <input type="number" className="w-full bg-background border border-input rounded p-2 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                                            value={q.startTime} onChange={e => updateQuestion(qIdx, 'startTime', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-muted-foreground mb-1">Stop (s)</label>
                                        <input type="number" className="w-full bg-background border border-input rounded p-2 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                                            value={q.stopTime} onChange={e => updateQuestion(qIdx, 'stopTime', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-muted-foreground mb-1">End (s)</label>
                                        <input type="number" className="w-full bg-background border border-input rounded p-2 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                                            value={q.endTime} onChange={e => updateQuestion(qIdx, 'endTime', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <input type="text" placeholder="Question (English - Optional)" className="w-full bg-background border border-blue-500/50 rounded p-2 text-sm text-foreground focus:border-blue-500 transition-colors"
                                    value={q.text.en} onChange={e => updateQTrans(qIdx, 'en', e.target.value)} />
                                <input type="text" placeholder="Soru (Türkçe - Opsiyonel)" className="w-full bg-background border border-red-500/50 rounded p-2 text-sm text-foreground focus:border-red-500 transition-colors"
                                    value={q.text.tr} onChange={e => updateQTrans(qIdx, 'tr', e.target.value)} />
                                <input type="text" placeholder="Frage (Deutsch - Optional)" className="w-full bg-background border border-yellow-500/50 rounded p-2 text-sm text-foreground focus:border-yellow-500 transition-colors"
                                    value={q.text.de} onChange={e => updateQTrans(qIdx, 'de', e.target.value)} />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-foreground">
                                        Cevap Seçenekleri
                                        <span className="text-xs text-muted-foreground ml-2">(Doğru cevabı işaretleyin)</span>
                                    </label>
                                    <button type="button" onClick={() => addOption(qIdx)} className="text-xs bg-green-500/10 text-green-500 px-3 py-1.5 rounded-lg hover:bg-green-500/20 flex items-center gap-1 border border-green-500/30 transition-colors">
                                        <Plus size={14} /> Seçenek Ekle
                                    </button>
                                </div>

                                {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className={`flex gap-4 items-start p-4 rounded-lg relative group transition-all ${opt.isCorrect ? 'bg-green-500/20 border-2 border-green-500/50' : 'bg-muted/50 border-2 border-transparent'
                                        }`}>
                                        <div className="flex flex-col items-center gap-1 pt-1">
                                            <input
                                                type="radio"
                                                name={`correct-${qIdx}`}
                                                checked={opt.isCorrect}
                                                onChange={() => {
                                                    const newQ = [...questions];
                                                    newQ[qIdx].options.forEach((o, i) => o.isCorrect = i === oIdx);
                                                    setQuestions(newQ);
                                                }}
                                                className="w-5 h-5 accent-green-500 cursor-pointer"
                                            />
                                            {opt.isCorrect && (
                                                <span className="text-xs font-bold text-green-500 whitespace-nowrap">✓ Doğru</span>
                                            )}
                                            {!opt.isCorrect && (
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">Yanlış</span>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <input type="text" placeholder="Option (EN)" className="w-full bg-transparent border-b border-border text-sm text-foreground focus:border-foreground outline-none pb-1 transition-colors"
                                                value={opt.text.en} onChange={e => updateOptionTrans(qIdx, oIdx, 'en', e.target.value)} />
                                            <input type="text" placeholder="Seçenek (TR)" className="w-full bg-transparent border-b border-border text-sm text-foreground focus:border-foreground outline-none pb-1 transition-colors"
                                                value={opt.text.tr} onChange={e => updateOptionTrans(qIdx, oIdx, 'tr', e.target.value)} />
                                            <input type="text" placeholder="Option (DE)" className="w-full bg-transparent border-b border-border text-sm text-foreground focus:border-foreground outline-none pb-1 transition-colors"
                                                value={opt.text.de} onChange={e => updateOptionTrans(qIdx, oIdx, 'de', e.target.value)} />
                                        </div>
                                        {q.options.length > 2 && (
                                            <button type="button" onClick={() => removeOption(qIdx, oIdx)} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="flex gap-4">
                        <button type="button" onClick={addQuestion} className="flex-1 py-4 border border-dashed border-border rounded-xl text-muted-foreground hover:text-foreground hover:border-foreground/20 hover:bg-accent/10 transition flex items-center justify-center gap-2">
                            <Plus size={20} /> Add Another Question
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg">
                            {loading ? 'Saving...' : <><Save size={20} /> Save Questions</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CreateQuizPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background text-foreground p-8 flex justify-center items-center">Loading...</div>}>
            <CreateQuizContent />
        </Suspense>
    );
}
