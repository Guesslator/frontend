import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAuditLogs } from "@/lib/adminApi";

export default async function AuditLogsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken || '';
    const { page } = (await searchParams) || { page: '1' };

    const pageNum = parseInt(page || '1');
    const take = 50;
    const skip = (pageNum - 1) * take;

    let data;
    try {
        data = await getAuditLogs({ skip, take }, token);
    } catch (e) {
        console.error(e);
        data = { data: [], total: 0 };
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Audit Logs</h1>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden text-sm">
                <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-neutral-900/80 text-neutral-500 uppercase border-b border-neutral-800">
                        <tr>
                            <th className="px-4 py-2">Time</th>
                            <th className="px-4 py-2">Actor</th>
                            <th className="px-4 py-2">Action</th>
                            <th className="px-4 py-2">Target</th>
                            <th className="px-4 py-2">Details</th>
                            <th className="px-4 py-2">IP/UA</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {data.data.map((log: any) => (
                            <tr key={log.id} className="hover:bg-neutral-800/20">
                                <td className="px-4 py-2 whitespace-nowrap text-neutral-500">
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-indigo-400">
                                    {log.actorId ? log.actorId.slice(0, 8) : 'System'}..
                                    <span className="text-neutral-600 block text-xxs">{log.role}</span>
                                </td>
                                <td className="px-4 py-2 font-bold text-neutral-300">
                                    {log.action}
                                </td>
                                <td className="px-4 py-2 text-neutral-400">
                                    {log.targetType}<br />{log.targetId ? log.targetId.slice(0, 8) : '-'}
                                </td>
                                <td className="px-4 py-2 text-neutral-500 break-all max-w-xs truncate">
                                    {JSON.stringify(log.metadata)}
                                </td>
                                <td className="px-4 py-2 text-neutral-600">
                                    {log.ipAddress}<br />{log.userAgent ? 'Browser' : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
