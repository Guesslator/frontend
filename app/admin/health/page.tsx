import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSystemHealth } from "@/lib/adminApi";

export default async function HealthPage() {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken || '';

    const health = await getSystemHealth(token).catch(() => null);

    if (!health) return <div>System Health Check Failed</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">System Health</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-neutral-200 mb-4">Status</h3>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-green-500 font-bold uppercase">{health.status}</span>
                    </div>
                    <p className="text-neutral-500 text-sm">Version: {health.version}</p>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-neutral-200 mb-4">Recent Error Volume</h3>
                    <div className="text-3xl font-bold text-neutral-100">{health.recentErrors}</div>
                    <p className="text-neutral-500 text-sm mt-2">Last 24 hours</p>
                </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                <h3 className="text-lg font-medium text-neutral-200 mb-4">Quick Links</h3>
                <div className="flex gap-4">
                    <a href="#" className="text-indigo-400 hover:text-indigo-300 underline">Sentry Dashboard</a>
                    <a href="#" className="text-indigo-400 hover:text-indigo-300 underline">Grafana</a>
                    <a href="#" className="text-indigo-400 hover:text-indigo-300 underline">Railway Logs</a>
                </div>
            </div>
        </div>
    );
}
