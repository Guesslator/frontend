"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { t, Language } from '@/lib/i18n';
import { ArrowLeft, ArrowRight, Save, Check } from 'lucide-react';
import { createUserContent, addQuestions } from '@/lib/api';
import { toast } from 'sonner';
import Step1Config from './Step1Config';
import Step2Metadata from './Step2Metadata';
import Step3Questions from './Step3Questions';

interface QuizWizardProps {
    lang: Language;
    accessToken: string;
}

export default function QuizWizard({ lang, accessToken }: QuizWizardProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'MOVIE',
        subcategory: '',
        languages: [lang] as Language[], // Default to current lang
        posterUrl: '',
        translations: {
            en: { title: '', description: '' },
            tr: { title: '', description: '' },
            ar: { title: '', description: '' }
        } as Record<Language, { title: string; description: string }>,
        levels: [] as { id: number; questions: any[] }[] // Array of { id, questions: [] }
    });

    const nextStep = () => {
        // Validation
        if (step === 1) {
            if (formData.languages.length === 0) {
                toast.error(t(lang, 'selectLanguages'));
                return;
            }
        }
        if (step === 2) {
            // Check if titles are filled for selected languages
            for (const l of formData.languages) {
                if (!formData.translations[l as Language]?.title) {
                    toast.error(`${t(lang, 'title')} (${l.toUpperCase()}) is required`);
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
            const allQuestions = formData.levels.flatMap(l => l.questions);
            const firstVideoQ = allQuestions.find((q: any) => q.type === 'VIDEO' && q.mediaUrl);
            let autoPosterUrl = '';

            if (firstVideoQ && firstVideoQ.mediaUrl) {
                try {
                    // Extract Video ID
                    const videoId = firstVideoQ.mediaUrl.split('v=')[1]?.split('&')[0];
                    if (videoId) {
                        autoPosterUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                    }
                } catch (e) {
                    // Failed to extract YouTube ID
                }
            }

            // 2. Create Content
            const contentPayload: any = {
                type: formData.type,
                posterUrl: autoPosterUrl, // Use auto-generated URL
                isPublished: true,
                translations: formData.languages.map((l: string) => ({
                    language: l,
                    title: formData.translations[l as Language].title,
                    description: formData.translations[l as Language].description
                }))
            };

            if (formData.type === 'SPORTS' && formData.subcategory) {
                contentPayload.subcategory = formData.subcategory;
            }

            const content = await createUserContent(accessToken, contentPayload);
            const contentId = content.id;

            // 3. Create Questions
            // 2. Create Questions
            const questions = formData.levels.flatMap(l => l.questions); // Flatten legacy level structure if we keep it in UI for a moment, or better:

            // Wait, I should refactor the State first to be flat.
            // But to save time and risk, I can just flatten the existing "levels" array into one "questions" array for submission.
            // Since the user wants "Levels removed", the UI shouldn't show "Level 1".
            // I will refactor Step3Questions next.
            // For now, let's update submission logic to assume flat list (or flattened).

            const questionsPayload = questions.map((q: any) => ({
                type: q.type,
                videoUrl: q.type === 'VIDEO' ? q.mediaUrl : undefined,
                imageUrl: q.type === 'IMAGE' ? q.mediaUrl : undefined,
                startTime: q.startTime || 0,
                endTime: q.endTime || 0,
                stopTime: q.stopTime || 0,
                translations: formData.languages.map((l: string) => ({
                    language: l,
                    text: q.translations[l]?.question || '...'
                })),
                options: (q.translations[formData.languages[0]]?.answers || []).map((_: any, ansIdx: number) => ({
                    isCorrect: (q.correctAnswerIndex ?? 0) === ansIdx,
                    translations: formData.languages.map((l: string) => ({
                        language: l,
                        text: q.translations[l]?.answers?.[ansIdx] || ''
                    })).filter(t => t.text)
                }))
            }));

            console.log(`Adding ${questionsPayload.length} questions...`);
            await addQuestions({
                contentId,
                questions: questionsPayload
            });
            console.log(`Questions added.`);

            // Success!
            router.push(`/${lang}/content/${contentId}`);

        } catch (error) {
            console.error(error);
            toast.error('Failed to create quiz');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Stepper Header */}
            <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-border -z-10" />
                {[1, 2, 3].map((s) => (
                    <div
                        key={s}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 transition-colors ${step >= s ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground'}`}
                    >
                        {step > s ? <Check size={16} /> : s}
                    </div>
                ))}
            </div>

            <h1 className="text-3xl font-bold mb-8 text-center text-foreground">
                {step === 1 && t(lang, 'setup')}
                {step === 2 && t(lang, 'metadata')}
                {step === 3 && t(lang, 'questions')}
            </h1>

            {step === 1 && <Step1Config lang={lang} formData={formData} setFormData={setFormData} />}
            {step === 2 && <Step2Metadata lang={lang} formData={formData} setFormData={setFormData} />}
            {step === 3 && <Step3Questions lang={lang} formData={formData} setFormData={setFormData} />}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12 bg-card/80 backdrop-blur p-4 rounded-xl border border-border sticky bottom-4 shadow-lg">
                <button
                    onClick={prevStep}
                    disabled={step === 1 || loading}
                    className="px-6 py-3 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-50 flex items-center gap-2 font-bold transition-colors"
                >
                    <ArrowLeft size={20} /> {t(lang, 'back')}
                </button>

                {step < 3 ? (
                    <button
                        onClick={nextStep}
                        className="px-8 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-all flex items-center gap-2 font-bold shadow-sm"
                    >
                        {t(lang, 'next')} <ArrowRight size={20} />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 font-bold shadow-lg shadow-primary/20"
                    >
                        {loading ? (
                            <div className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                        ) : (
                            <Save size={20} />
                        )}
                        {t(lang, 'finish')}
                    </button>
                )}
            </div>
        </div>
    );
}
