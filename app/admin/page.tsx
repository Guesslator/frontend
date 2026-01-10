"use client";

import { useEffect, useState } from 'react';
import { fetchContent, APIContentItem } from '@/lib/api';
import Link from 'next/link';
import { Plus, Film, Tv, Gamepad2, Layers } from 'lucide-react';

export default function AdminDashboard() {
    const [content, setContent] = useState<APIContentItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContent('').then(data => {
            setContent(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="p-8 text-foreground">Loading...</div>;

    return (
        <div className="min-h-screen bg-background text-foreground p-8 transition-colors duration-300">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage your content library</p>
                </div>
                <Link href="/admin/create" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition shadow-lg">
                    <Plus size={20} />
                    Add Content
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.map(item => {
                    // Find first available translation
                    const t = item.translations.en || item.translations.tr || item.translations.de || { title: 'Untitled', description: '' };
                    const langBadge = item.translations.en ? 'EN' : item.translations.tr ? 'TR' : 'DE';

                    return (
                        <div key={item.id} className="bg-card border border-border rounded-xl p-6 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
                            <img src={item.posterUrl} alt="Poster" className="w-24 h-36 object-cover rounded-md bg-muted" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    {item.type === 'MOVIE' && <Film size={16} className="text-blue-500" />}
                                    {item.type === 'SERIES' && <Tv size={16} className="text-green-500" />}
                                    {item.type === 'GAME' && <Gamepad2 size={16} className="text-purple-500" />}
                                    <span className="text-xs font-mono text-muted-foreground">{item.type}</span>
                                    <span className="text-xs font-bold bg-muted px-1 rounded text-muted-foreground">{langBadge}</span>
                                </div>
                                <h3 className="font-bold text-lg mb-1 text-card-foreground">{t.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                    {t.description || 'No description'}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {item.levels.map(l => (
                                        <span key={l.id} className="px-2 py-1 bg-secondary rounded text-xs text-secondary-foreground border border-border">
                                            Lvl {l.level}
                                        </span>
                                    ))}
                                    <Link
                                        href={`/admin/quiz?contentId=${item.id}&title=${encodeURIComponent(item.translations.en?.title)}`}
                                        className="px-2 py-1 bg-primary/10 text-primary rounded text-xs border border-primary/20 hover:bg-primary/20 flex items-center gap-1 transition-colors"
                                    >
                                        <Plus size={12} /> Level
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
