"use client";

import { t, Language, LANGUAGES, languageNames, languageFlags } from '@/lib/i18n';

interface Step1ConfigProps {
    lang: Language;
    formData: any;
    setFormData: (data: any) => void;
}

export default function Step1Config({ lang, formData, setFormData }: Step1ConfigProps) {
    const toggleLanguage = (l: Language) => {
        const current = formData.languages || [];
        if (current.includes(l)) {
            if (current.length > 1) {
                setFormData({ ...formData, languages: current.filter((x: string) => x !== l) });
            }
        } else {
            setFormData({ ...formData, languages: [...current, l] });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Type Selection */}
            <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                    <span className="bg-primary w-1 h-6 rounded-full" />
                    {t(lang, 'type')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t(lang, 'type')}
                        </label>
                        <select
                            className="w-full bg-background border border-input rounded-lg p-3 text-foreground focus:border-primary focus:outline-none transition-colors cursor-pointer"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value, subcategory: '' })}
                        >
                            <option value="MOVIE">{t(lang, 'movie')}</option>
                            <option value="SERIES">{t(lang, 'tvSeries')}</option>
                            <option value="GAME">{t(lang, 'game')}</option>
                            <option value="SPORTS">{t(lang, 'sport')}</option>
                            <option value="MIXED">{t(lang, 'mixed')}</option>
                        </select>
                    </div>

                    {formData.type === 'SPORTS' && (
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                {t(lang, 'subcategory')}
                            </label>
                            <select
                                className="w-full bg-background border border-input rounded-lg p-3 text-foreground focus:border-primary focus:outline-none transition-colors cursor-pointer"
                                value={formData.subcategory}
                                onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                            >
                                <option value="">{t(lang, 'selectSubcategory')}</option>
                                <option value="FOOTBALL">{t(lang, 'football')}</option>
                                <option value="BASKETBALL">{t(lang, 'basketball')}</option>
                                <option value="MMA">{t(lang, 'mma')}</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Language Selection */}
            <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                    <span className="bg-primary w-1 h-6 rounded-full" />
                    {t(lang, 'selectLanguages')}
                </h3>
                {/* Scrollable container for Languages - max 5 visual rows approx ~300px */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {LANGUAGES.map((l) => (
                        <div
                            key={l}
                            onClick={() => toggleLanguage(l)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between ${formData.languages.includes(l)
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50 bg-muted/30'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{languageFlags[l]}</span>
                                <span className="font-medium text-foreground">{languageNames[l]}</span>
                            </div>
                            {formData.languages.includes(l) && (
                                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
