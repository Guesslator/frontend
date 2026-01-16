"use client";

import { useEffect, useState } from 'react';
import { BarChart, Users, Activity, Eye, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface Stats {
    totalUsers: number;
    totalQuizzes: number;
    totalCompletions: number;
    dailyActiveUsers: number;
}

interface TopQuiz {
    quizId: string;
    title: string;
    type: string;
    _count: {
        quizId: number;
    };
}

export default function AnalyticsDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [topQuizzes, setTopQuizzes] = useState<TopQuiz[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

                // Parallel fetch
                const [statsRes, topRes] = await Promise.all([
                    fetch(`${apiUrl}/analytics/stats`),
                    fetch(`${apiUrl}/analytics/top-quizzes`)
                ]);

                if (statsRes.ok) setStats(await statsRes.json());
                if (topRes.ok) setTopQuizzes(await topRes.json());
            } catch (error) {
                console.error('Failed to load stats', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    if (loading) return <div className="p-8 text-foreground">Loading Analytics...</div>;

    return (
        <div className="min-h-screen bg-background text-foreground p-8">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                        <Activity className="h-8 w-8" />
                        Analytics & Control
                    </h1>
                    <p className="text-muted-foreground">Product health and performance</p>
                </div>
                <Link href="/admin" className="text-primary hover:underline">
                    &larr; Back to Content Manager
                </Link>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatsCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={<Users className="text-blue-500" />}
                />
                <StatsCard
                    title="Daily Active Users"
                    value={stats?.dailyActiveUsers || 0}
                    icon={<Eye className="text-green-500" />}
                    description="Last 24 hours"
                />
                <StatsCard
                    title="Total Quizzes"
                    value={stats?.totalQuizzes || 0}
                    icon={<BarChart className="text-purple-500" />}
                />
                <StatsCard
                    title="Total Completions"
                    value={stats?.totalCompletions || 0}
                    icon={<Activity className="text-orange-500" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Quizzes */}
                <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Top 10 Popular Quizzes</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border text-muted-foreground text-sm">
                                    <th className="pb-2">Quiz Title</th>
                                    <th className="pb-2">Type</th>
                                    <th className="pb-2 text-right">Completions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {topQuizzes.map((quiz, i) => (
                                    <tr key={quiz.quizId} className="group hover:bg-muted/50 transition-colors">
                                        <td className="py-3 pr-4 font-medium">
                                            <span className="text-muted-foreground mr-2 text-xs">#{i + 1}</span>
                                            {quiz.title}
                                        </td>
                                        <td className="py-3 text-xs text-muted-foreground">{quiz.type}</td>
                                        <td className="py-3 text-right font-bold text-primary">
                                            {quiz._count?.quizId}
                                        </td>
                                    </tr>
                                ))}
                                {topQuizzes.length === 0 && (
                                    <tr><td colSpan={3} className="py-4 text-center text-muted-foreground">No data yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Operational Controls / Alerts */}
                <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        System Health & Sustainability
                    </h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-muted/30 rounded-lg border border-border">
                            <h3 className="font-bold text-sm mb-1">Cost Awareness</h3>
                            <ul className="text-sm text-muted-foreground list-disc list-inside">
                                <li>Video Hosting: <span className="text-green-500 font-bold">YouTube (Zero Cost)</span></li>
                                <li>Analytics: <span className="text-green-500 font-bold">Custom + Grafana Free</span></li>
                                <li>Errors: <span className="text-green-500 font-bold">Sentry Free Tier</span></li>
                            </ul>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-lg border border-border">
                            <h3 className="font-bold text-sm mb-1">Admin Actions</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                                To manage quiz visibility or moderation, go to the Content Manager.
                            </p>
                            <Link href="/admin" className="block w-full text-center bg-primary/10 hover:bg-primary/20 text-primary py-2 rounded-lg text-sm font-bold border border-primary/20 transition-colors">
                                Manage Content Library
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon, description }: { title: string, value: number, icon: React.ReactNode, description?: string }) {
    return (
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex items-start justify-between">
            <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold">{value.toLocaleString()}</h3>
                {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </div>
            <div className="p-2 bg-muted rounded-lg">
                {icon}
            </div>
        </div>
    );
}
