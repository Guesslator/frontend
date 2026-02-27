"use client";

import { t, Language } from '@/lib/i18n';
import FileUploader from '@/components/FileUploader';
import { useState } from 'react';

interface Step2MetadataProps {
    lang: Language;
    formData: any;
    setFormData: (data: any) => void;
}

export default function Step2Metadata({ lang, formData, setFormData }: Step2MetadataProps) {
    const [posterModerationStatus, setPosterModerationStatus] = useState<string | null>(null);

    const handleChange = (targetLang: string, field: 'title' | 'description', value: string) => {
        setFormData({
            ...formData,
            translations: {
                ...formData.translations,
                [targetLang]: {
                    ...formData.translations[targetLang],
                    [field]: value
                }
            }
        });
    };

    const handlePosterUpload = (url: string, moderationStatus?: string) => {
        setFormData({ ...formData, posterUrl: url });
        setPosterModerationStatus(moderationStatus || 'APPROVED');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Poster Upload Removed - Banner is auto-generated from video */}

            {/* Translations */}
            {formData.languages.map((l: Language) => (
                <div key={l} className="bg-background/40 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-foreground tracking-tight">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-sm">
                            {l.toUpperCase()}
                        </div>
                        {t(lang, 'metadata')}
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 ml-1">
                                {t(lang, 'title')}
                            </label>
                            <input
                                type="text"
                                placeholder={t(lang, 'title')}
                                className="w-full h-14 bg-background/50 backdrop-blur-md border border-white/5 rounded-2xl px-5 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground/50 hover:bg-white/5 font-medium"
                                value={formData.translations[l]?.title || ''}
                                onChange={e => handleChange(l, 'title', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 ml-1">
                                {t(lang, 'description')}
                            </label>
                            <textarea
                                placeholder={t(lang, 'description')}
                                rows={4}
                                className="w-full bg-background/50 backdrop-blur-md border border-white/5 rounded-2xl p-5 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none transition-all duration-300 placeholder:text-muted-foreground/50 hover:bg-white/5 font-medium leading-relaxed"
                                value={formData.translations[l]?.description || ''}
                                onChange={e => handleChange(l, 'description', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
