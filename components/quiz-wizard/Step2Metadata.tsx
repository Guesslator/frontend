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
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Poster Upload Removed - Banner is auto-generated from video */}

            {/* Translations */}
            {formData.languages.map((l: Language) => (
                <div key={l} className="bg-card p-6 rounded-xl border border-border">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                        <span className="bg-primary w-1 h-6 rounded-full" />
                        {l.toUpperCase()} ({t(lang, 'metadata')})
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                {t(lang, 'title')}
                            </label>
                            <input
                                type="text"
                                placeholder={t(lang, 'title')}
                                className="w-full bg-background border border-input rounded-lg p-3 text-foreground focus:border-primary focus:outline-none transition-colors"
                                value={formData.translations[l]?.title || ''}
                                onChange={e => handleChange(l, 'title', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                {t(lang, 'description')}
                            </label>
                            <textarea
                                placeholder={t(lang, 'description')}
                                rows={3}
                                className="w-full bg-background border border-input rounded-lg p-3 text-foreground focus:border-primary focus:outline-none resize-none transition-colors"
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
