import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getReports } from "@/lib/adminApi";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string }> }) {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken || '';
    const { page, status } = (await searchParams) || { page: '1', status: 'PENDING' };

    const pageNum = parseInt(page || '1');
    const take = 20;
    const skip = (pageNum - 1) * take;

    let data;
    try {
        data = await getReports({ skip, take, status }, token);
    } catch (e) {
        console.error(e);
        data = { data: [], total: 0 };
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Reports & Moderation</h1>

            <div className="flex gap-4 border-b border-neutral-800 pb-4">
                {['PENDING', 'RESOLVED', 'DISMISSED'].map(s => (
                    <a
                        key={s}
                        href={`?status=${s}`}
                        className={`text-sm font-medium ${status === s ? 'text-indigo-400 border-b-2 border-indigo-400 pb-4 -mb-4.5' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                        {s}
                    </a>
                ))}
            </div>

            <div className="space-y-4">
                {data.data.length === 0 && <div className="text-neutral-500 py-8">No reports found.</div>}

                {data.data.map((report: any) => (
                    <div key={report.id} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 flex gap-6">
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="font-bold text-red-400 text-sm uppercase tracking-wide border border-red-500/20 bg-red-500/10 px-2 py-1 rounded mr-2">
                                        {report.reason}
                                    </span>
                                    <span className="text-xs text-neutral-500">{new Date(report.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="text-xs text-neutral-600">ID: {report.id}</div>
                            </div>

                            <p className="text-neutral-300 mb-4">{report.details || 'No details provided.'}</p>

                            <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800 mb-4">
                                <h4 className="text-xs font-bold text-neutral-500 uppercase mb-2">Reported Content</h4>
                                <div className="flex gap-4">
                                    {report.content?.posterUrl && <img src={report.content.posterUrl} className="w-12 h-16 rounded object-cover" />}
                                    <div>
                                        <div className="font-medium text-neutral-200">
                                            {report.content?.translations[0]?.title || report.content?.id}
                                        </div>
                                        <div className="text-xs text-neutral-500">
                                            by {report.reporter?.email || 'Unknown'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                    Review & Resolve
                                </button>
                                <button className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-2 rounded-lg text-sm font-medium">
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
