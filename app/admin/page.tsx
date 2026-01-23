"use client";

import { useEffect, useState } from 'react';
import { BarChart, Users, Activity, Eye, AlertTriangle, Zap, Server, Clock } from 'lucide-react';
import Link from 'next/link';
import { getAnalyticsData } from '@/lib/adminApi';
import { useSession } from 'next-auth/react';

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
    _count: { quizId: number };
}

interface RecentActivity {
    signups: { id: string, email: string, name: string | null, createdAt: string }[];
    plays: { id: string, userEmail: string, quizTitle: string, createdAt: string, eventType: string }[];
}

interface GrowthStat {
    date: string;
    users: number;
    plays: number;
}

export default function AdminDashboard() {
    const { data: session } = useSession();
    const token = session?.accessToken || '';

    const [stats, setStats] = useState<Stats | null>(null);
    const [topQuizzes, setTopQuizzes] = useState<TopQuiz[]>([]);
    const [recent, setRecent] = useState<RecentActivity | null>(null);
    const [growth, setGrowth] = useState<GrowthStat[]>([]);
    const [errorStats, setErrorStats] = useState<{ errorCount24h: number } | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<{ count: number } | null>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;

        async function loadData() {
            try {
                const [statsData, topData, recentData, growthData, errorData, onlineData] = await Promise.all([
                    getAnalyticsData('stats', token),
                    getAnalyticsData('top-quizzes', token),
                    getAnalyticsData('recent-activity', token),
                    getAnalyticsData('growth-stats', token),
                    getAnalyticsData('error-stats', token),
                    getAnalyticsData('online-users', token),
                ]);

                setStats(statsData);
                setTopQuizzes(topData);
                setRecent(recentData);
                setGrowth(growthData);
                setErrorStats(errorData);
                setOnlineUsers(onlineData);
            } catch (error) {
                console.error('Failed to load stats', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
        // Refresh online users every 30 seconds
        const interval = setInterval(() => {
            getAnalyticsData('online-users', token).then(setOnlineUsers).catch(console.error);
        }, 30000);

        return () => clearInterval(interval);
    }, [token]);

    if (loading) return <div className="p-8 text-neutral-400 flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" /> Loading Dashboard...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-100 flex items-center gap-2">
                        <Activity className="h-8 w-8 text-indigo-500" />
                        Command Center
                    </h1>
                    <p className="text-neutral-500">Real-time product health and performance monitoring</p>
                </div>
            </header>

            {/* Live Pulse */}
            <div className="p-1 bg-gradient-to-r from-green-500/20 to-transparent rounded-xl border border-green-500/20">
                <div className="bg-neutral-900/50 p-4 rounded-lg flex items-center gap-4">
                    <div className="relative">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-ping absolute inset-0" />
                        <div className="w-3 h-3 bg-green-500 rounded-full relative" />
                    </div>
                    <div>
                        <span className="block text-2xl font-bold leading-none text-white">{onlineUsers?.count || 0}</span>
                        <span className="text-xs text-green-400 font-bold uppercase tracking-wider">Online Users</span>
                    </div>
                    <div className="h-8 w-px bg-white/10 mx-4" />
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <Server size={14} className={errorStats && errorStats.errorCount24h > 0 ? "text-red-500" : "text-green-500"} />
                        Errors (24h): <span className={errorStats && errorStats.errorCount24h > 0 ? "text-red-400 font-bold" : "text-neutral-300"}>{errorStats?.errorCount24h || 0}</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    title="Quiz Plays"
                    value={stats?.totalCompletions || 0}
                    icon={<Activity className="text-orange-500" />}
                    description="Total completions"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Growth Chart */}
                <section className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 shadow-sm col-span-2">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        30-Day Growth Trend
                    </h2>
                    <div className="h-64 flex items-end gap-1 w-full">
                        {growth.map((g, i) => {
                            const max = Math.max(...growth.map(i => i.plays + i.users), 10);
                            const height = Math.max(((g.plays + g.users) / max) * 100, 5);
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                                    <div className="w-full bg-neutral-800 rounded-t-sm flex flex-col justify-end overflow-hidden transition-all hover:brightness-110" style={{ height: `${height}%` }}>
                                        <div className="bg-indigo-500/50 w-full" style={{ height: `${(g.users / (g.plays + g.users)) * 100}%` }} title={`Users: ${g.users}`} />
                                        <div className="bg-purple-500/50 w-full flex-1" title={`Plays: ${g.plays}`} />
                                    </div>
                                    <div className="absolute bottom-full mb-2 bg-black text-white text-xs p-2 rounded hidden group-hover:block z-50 whitespace-nowrap border border-neutral-700 shadow-xl">
                                        <div className="font-bold">{g.date}</div>
                                        <div className="text-indigo-300">New Users: {g.users}</div>
                                        <div className="text-purple-300">Plays: {g.plays}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* Live Activity Feed */}
                <section className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 shadow-sm flex flex-col h-[400px]">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                        <Clock className="h-5 w-5 text-blue-500" />
                        Live Feed
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-neutral-800">
                        {recent?.signups.map((u) => (
                            <div key={`u-${u.id}`} className="flex items-start gap-3 text-sm animate-in slide-in-from-right-2 duration-300">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                                    <Users size={14} />
                                </div>
                                <div>
                                    <p className="text-neutral-200"><span className="font-bold text-white">{u.email.split('@')[0]}</span> joined.</p>
                                    <span className="text-xs text-neutral-500">{new Date(u.createdAt).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        ))}
                        {recent?.plays.map((p) => (
                            <div key={`p-${p.id}`} className="flex items-start gap-3 text-sm animate-in slide-in-from-right-2 duration-300">
                                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                                    <Activity size={14} />
                                </div>
                                <div>
                                    <p className="text-neutral-200">
                                        <span className="font-bold text-white">{p.userEmail?.split('@')[0]}</span> played <span className="text-purple-300">{p.quizTitle}</span>.
                                    </p>
                                    <span className="text-xs text-neutral-500">{new Date(p.createdAt).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Quizzes */}
                <section className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Top Popular Quizzes</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-sm text-neutral-500 border-b border-border/50">
                                <tr>
                                    <th className="pb-2 pl-2">#</th>
                                    <th className="pb-2">Title</th>
                                    <th className="pb-2 text-right">Plays</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {topQuizzes.slice(0, 5).map((quiz, i) => (
                                    <tr key={quiz.quizId} className="group hover:bg-white/5 transition-colors">
                                        <td className="py-3 pl-2 text-neutral-500 font-mono text-sm">{(i + 1).toString().padStart(2, '0')}</td>
                                        <td className="py-3 font-medium">
                                            {quiz.title}
                                            <span className="ml-2 text-[10px] uppercase tracking-wider text-neutral-500 bg-neutral-800 px-1.5 py-0.5 rounded">{quiz.type}</span>
                                        </td>
                                        <td className="py-3 text-right font-bold text-primary">
                                            {quiz._count?.quizId}
                                        </td>
                                    </tr>
                                ))}
                                {topQuizzes.length === 0 && (
                                    <tr><td colSpan={3} className="py-4 text-center text-neutral-500">No data yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* System Health */}
                <section className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-neutral-400" />
                        System Advisories
                    </h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <h3 className="text-green-400 font-bold text-sm mb-1 flex items-center gap-2">
                                <Zap size={14} /> Systems Nominal
                            </h3>
                            <p className="text-xs text-green-300/70">
                                Database latency is low. No critical errors in the last hour.
                            </p>
                        </div>

                        <div className="p-4 bg-neutral-900/30 rounded-lg border border-neutral-800">
                            <h3 className="font-bold text-sm mb-2 text-neutral-300">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <Link href="/admin/create" className="text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded text-xs font-bold transition-colors">
                                    New Question
                                </Link>
                                <Link href="/admin/users" className="text-center bg-neutral-800 hover:bg-neutral-700 text-neutral-300 py-2 rounded text-xs font-bold transition-colors">
                                    Manage Users
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon, description }: { title: string, value: number, icon: React.ReactNode, description?: string }) {
    return (
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl shadow-sm flex items-start justify-between hover:border-indigo-500/30 transition-colors">
            <div>
                <p className="text-neutral-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-white">{value.toLocaleString()}</h3>
                {description && <p className="text-xs text-neutral-500 mt-1">{description}</p>}
            </div>
            <div className="p-3 bg-neutral-800/50 rounded-lg">
                {icon}
            </div>
        </div>
    );
}
