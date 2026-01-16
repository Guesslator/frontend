"use client";

import { useEffect, useState } from 'react';
import { fetchContent, APIContentItem, updateContentStatus } from '@/lib/api';
import Link from 'next/link';
import { Plus, Film, Tv, Gamepad2, Layers, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
    const [content, setContent] = useState<APIContentItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContent('').then(data => {
            setContent(data);
            setLoading(false);
        });
    }, []);

    const togglePublish = async (id: string, newState: boolean) => {
        try {
            // Optimistic update
            setContent(prev => prev.map(item => item.id === id ? { ...item, isPublished: newState } : item));

            await updateContentStatus(id, newState);
            toast.success(newState ? 'Quiz Published' : 'Quiz Unpublished');
        } catch (error) {
            // Revert
            setContent(prev => prev.map(item => item.id === id ? { ...item, isPublished: !newState } : item));
            toast.error('Failed to update status');
        }
    };

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
                <Link href="/admin/dashboard" className="ml-4 px-6 py-3 rounded-lg font-bold flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition shadow-sm border border-border">
                    <Activity size={20} />
                    Analytics
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.map(item => {
                    // Find first available translation
                    const t = item.translations.en || item.translations.tr || item.translations.de || { title: 'Untitled', description: '' };
                    const langBadge = item.translations.en ? 'EN' : item.translations.tr ? 'TR' : 'DE';

                    return (
                        <div key={item.id} className="bg-card border border-border rounded-xl p-6 flex gap-4 shadow-sm hover:shadow-md transition-shadow relative group">
                            <img src={item.posterUrl} alt="Poster" className="w-24 h-36 object-cover rounded-md bg-muted" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    {item.type === 'MOVIE' && <Film size={16} className="text-blue-500" />}
                                    {item.type === 'SERIES' && <Tv size={16} className="text-green-500" />}
                                    {item.type === 'GAME' && <Gamepad2 size={16} className="text-purple-500" />}
                                    <span className="text-xs font-mono text-muted-foreground">{item.type}</span>
                                    <span className="text-xs font-bold bg-muted px-1 rounded text-muted-foreground">{langBadge}</span>

                                    {/* Status Badge */}
                                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${item.isPublished ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                        {item.isPublished ? 'Live' : 'Hidden'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg mb-1 text-card-foreground">{t.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                    {t.description || 'No description'}
                                </p>

                                <div className="flex flex-wrap gap-2 items-center">
                                    {item.levels.map(l => (
                                        <span key={l.id} className="px-2 py-1 bg-secondary rounded text-xs text-secondary-foreground border border-border">
                                            Lvl {l.level}
                                        </span>
                                    ))}
                                    <div className="flex gap-2 ml-auto">
                                        <Link
                                            href={`/admin/quiz?contentId=${item.id}&title=${encodeURIComponent(item.translations.en?.title)}`}
                                            className="px-2 py-1 bg-primary/10 text-primary rounded text-xs border border-primary/20 hover:bg-primary/20 flex items-center gap-1 transition-colors"
                                        >
                                            <Plus size={12} /> Level
                                        </Link>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                                    <button
                                        onClick={() => togglePublish(item.id, !item.isPublished)}
                                        className={`text-xs font-bold ${item.isPublished ? 'text-red-500 hover:text-red-600' : 'text-green-500 hover:text-green-600'}`}
                                    >
                                        {item.isPublished ? 'Unpublish' : 'Publish Now'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
