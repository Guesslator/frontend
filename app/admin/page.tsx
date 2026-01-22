import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardStats } from "@/lib/adminApi";
import { Users, FileQuestion, Activity, AlertTriangle } from "lucide-react";

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken || '';
    // searchParams is a promise in Next 15+, wait... Next.js version in package.json is 16.1.1.
    // In Next.js 15+, searchParams is a Promise.
    const { range } = (await searchParams) || { range: '7d' };

    let stats;
    try {
        stats = await getDashboardStats(range || '7d', token);
    } catch (e) {
        console.error(e);
        stats = null;
    }

    if (!stats) return <div className="text-red-400">Loading stats... (Ensure Backend is running and migrated)</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
                <div className="flex gap-2">
                    {['today', '7d', '30d'].map((r) => (
                        <a
                            key={r}
                            href={`?range=${r}`}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${range === r ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
                        >
                            {r}
                        </a>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Users" value={stats.totalUsers} subValue={`+${stats.newUsers} new`} icon={Users} delay={0} />
                <StatCard title="Total Quizzes" value={stats.totalQuizzes} subValue={`+${stats.newQuizzes} new`} icon={FileQuestion} delay={0.1} />
                <StatCard title="Completions" value={stats.completions} subValue="in range" icon={Activity} delay={0.2} />
                <StatCard title="Pending Reports" value={stats.reportsPending} subValue="Actions needed" icon={AlertTriangle} urgent={stats.reportsPending > 0} delay={0.3} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 h-64 flex flex-col justify-center items-center">
                    <Activity className="h-8 w-8 text-neutral-600 mb-2" />
                    <span className="text-neutral-500">Activity Funnel (Not implemented in MVP)</span>
                </div>
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 h-64 flex flex-col justify-center items-center">
                    <FileQuestion className="h-8 w-8 text-neutral-600 mb-2" />
                    <span className="text-neutral-500">Top Content (Not implemented in MVP)</span>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, subValue, icon: Icon, urgent, delay }: any) {
    return (
        <div
            className={`p-6 rounded-xl border bg-neutral-900/50 backdrop-blur-sm transition-all hover:bg-neutral-900 hover:border-neutral-700 ${urgent ? 'border-red-500/50 hover:border-red-500/70' : 'border-neutral-800'}`}
            style={{ animationDelay: `${delay}s` }}
        >
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-400">{title}</p>
                <Icon className={`h-4 w-4 ${urgent ? 'text-red-400' : 'text-neutral-500'}`} />
            </div>
            <div className="mt-2">
                <span className="text-2xl font-bold text-neutral-100">{String(value).toLocaleString()}</span>
                {subValue && <span className="ml-2 text-xs text-neutral-500">{subValue}</span>}
            </div>
        </div>
    );
}
