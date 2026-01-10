"use client";

import { useState } from 'react';
import { createContent, CreateContentDto } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CreateContentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        type: 'MOVIE',
        posterUrl: '',
        enTitle: '', enDesc: '',
        trTitle: '', trDesc: '',
        deTitle: '', deDesc: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const translations = [];
        if (formData.enTitle) translations.push({ language: 'en', title: formData.enTitle, description: formData.enDesc });
        if (formData.trTitle) translations.push({ language: 'tr', title: formData.trTitle, description: formData.trDesc });
        if (formData.deTitle) translations.push({ language: 'de', title: formData.deTitle, description: formData.deDesc });

        if (translations.length === 0) {
            toast.error("Please add at least one language.");
            setLoading(false);
            return;
        }

        const payload: CreateContentDto = {
            type: formData.type as any,
            posterUrl: formData.posterUrl,
            isPublished: true,
            translations
        };

        try {
            await createContent(payload);
            router.push('/admin');
        } catch (err) {
            toast.error('Failed to create content');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-8 flex justify-center transition-colors duration-300">
            <div className="w-full max-w-2xl">
                <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft size={20} /> Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold mb-8 text-foreground">Add New Content</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Type</label>
                            <select
                                className="w-full bg-background border border-input rounded-lg p-3 text-foreground focus:border-primary focus:outline-none transition-colors"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="MOVIE">Movie</option>
                                <option value="SERIES">Series</option>
                                <option value="GAME">Game</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Poster URL (Admin Override - No AI Check)</label>
                            <input
                                type="url"
                                required
                                className="w-full bg-background border border-input rounded-lg p-3 text-foreground focus:border-primary focus:outline-none transition-colors"
                                placeholder="https://..."
                                value={formData.posterUrl}
                                onChange={e => setFormData({ ...formData, posterUrl: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* English */}
                    <div className="bg-card p-6 rounded-xl border border-border">
                        <h3 className="text-lg font-bold mb-4 text-blue-500">English (Optional)</h3>
                        <div className="space-y-4">
                            <input
                                type="text" placeholder="Title"
                                className="w-full bg-background border border-input rounded-lg p-3 text-foreground focus:border-primary focus:outline-none transition-colors"
                                value={formData.enTitle} onChange={e => setFormData({ ...formData, enTitle: e.target.value })}
                            />
                            <textarea
                                placeholder="Description" rows={3}
                                className="w-full bg-background border border-input rounded-lg p-3 text-foreground focus:border-primary focus:outline-none transition-colors"
                                value={formData.enDesc} onChange={e => setFormData({ ...formData, enDesc: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Turkish */}
                    <div className="bg-card p-6 rounded-xl border border-border">
                        <h3 className="text-lg font-bold mb-4 text-red-500">Turkish (Optional)</h3>
                        <div className="space-y-4">
                            <input
                                type="text" placeholder="Başlık"
                                className="w-full bg-background border border-input rounded-lg p-3 text-foreground focus:border-primary focus:outline-none transition-colors"
                                value={formData.trTitle} onChange={e => setFormData({ ...formData, trTitle: e.target.value })}
                            />
                            <textarea
                                placeholder="Açıklama" rows={3}
                                className="w-full bg-background border border-input rounded-lg p-3 text-foreground focus:border-primary focus:outline-none transition-colors"
                                value={formData.trDesc} onChange={e => setFormData({ ...formData, trDesc: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* German */}
                    <div className="bg-card p-6 rounded-xl border border-border">
                        <h3 className="text-lg font-bold mb-4 text-yellow-500">German (Optional)</h3>
                        <div className="space-y-4">
                            <input
                                type="text" placeholder="Titel"
                                className="w-full bg-background border border-input rounded-lg p-3 text-foreground focus:border-primary focus:outline-none transition-colors"
                                value={formData.deTitle} onChange={e => setFormData({ ...formData, deTitle: e.target.value })}
                            />
                            <textarea
                                placeholder="Beschreibung" rows={3}
                                className="w-full bg-background border border-input rounded-lg p-3 text-foreground focus:border-primary focus:outline-none transition-colors"
                                value={formData.deDesc} onChange={e => setFormData({ ...formData, deDesc: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
                    >
                        {loading ? 'Saving...' : <><Save size={20} /> Save Content</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
