import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getQuizzes } from "@/lib/adminApi";
import { Search } from "lucide-react";
import Link from 'next/link';
import QuizActions from "./QuizActions";

export default async function QuizzesPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; status?: string; creator?: string; hasReports?: string; startDate?: string; endDate?: string }> }) {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken || '';
    const { page, search, status, creator, hasReports, startDate, endDate } = (await searchParams) || { page: '1', search: '', status: '', creator: '', hasReports: '', startDate: '', endDate: '' };

    const pageNum = parseInt(page || '1');
    const take = 20;
    const skip = (pageNum - 1) * take;

    let data;
    try {
        data = await getQuizzes({ skip, take, search, status, creator, hasReports: hasReports === 'true', startDate, endDate }, token);
    } catch (e) {
        console.error(e);
        data = { data: [], total: 0 };
    }

    const totalPages = Math.ceil(data.total / take);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Quizzes Management</h1>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-wrap gap-2 items-center bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                        <form className="flex flex-wrap gap-2 items-end">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-neutral-500 ml-1">Search</label>
                                <input
                                    name="search"
                                    defaultValue={search}
                                    placeholder="Search ID or Title..."
                                    className="bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 w-48"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-neutral-500 ml-1">Status</label>
                                <select
                                    name="status"
                                    defaultValue={status}
                                    className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 w-32"
                                >
                                    <option value="">All Status</option>
                                    <option value="published">Published</option>
                                    <option value="hidden">Hidden</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-neutral-500 ml-1">Creator</label>
                                <input
                                    name="creator"
                                    defaultValue={creator}
                                    placeholder="Email..."
                                    className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 w-40"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-neutral-500 ml-1">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    defaultValue={startDate}
                                    className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 w-36 text-neutral-300 [&::-webkit-calendar-picker-indicator]:invert"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-neutral-500 ml-1">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    defaultValue={endDate}
                                    className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 w-36 text-neutral-300 [&::-webkit-calendar-picker-indicator]:invert"
                                />
                            </div>

                            <div className="flex items-center gap-2 px-3 border border-neutral-800 rounded-lg bg-neutral-900 cursor-pointer hover:bg-neutral-800 h-[38px] mt-auto">
                                <input
                                    type="checkbox"
                                    name="hasReports"
                                    value="true"
                                    defaultChecked={hasReports === 'true'}
                                    className="accent-indigo-500"
                                />
                                <span className="text-sm text-neutral-400">Reports</span>
                            </div>

                            <button type="submit" className="h-[38px] px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium mt-auto transition-colors">
                                Filter
                            </button>

                            {(search || status || creator || hasReports || startDate || endDate) && (
                                <Link href="/admin/quizzes" className="h-[38px] flex items-center px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm font-medium mt-auto transition-colors">
                                    Clear
                                </Link>
                            )}
                        </form>
                    </div>
                </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-neutral-900/80 text-neutral-400 uppercase text-xs font-medium border-b border-neutral-800">
                        <tr>
                            <th className="px-6 py-3">Title</th>
                            <th className="px-6 py-3">Creator</th>
                            <th className="px-6 py-3">Created At</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Stats</th>
                            <th className="px-6 py-3">Reports</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {data.data.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                                    No quizzes found matching your filters.
                                </td>
                            </tr>
                        ) : (
                            data.data.map((quiz: any) => {
                                const title = quiz.translations?.find((t: any) => t.language === 'en')?.title ||
                                    quiz.translations?.[0]?.title ||
                                    quiz.id;
                                return (
                                    <tr key={quiz.id} className="hover:bg-neutral-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {quiz.posterUrl ? (
                                                    <img src={quiz.posterUrl} className="w-8 h-12 rounded bg-neutral-800 object-cover" />
                                                ) : (
                                                    <div className="w-8 h-12 rounded bg-neutral-800 flex items-center justify-center text-xs text-neutral-600">?</div>
                                                )}
                                                <div>
                                                    <span className="font-medium text-neutral-200 block truncate max-w-[200px]" title={title}>{title}</span>
                                                    <span className="text-xs text-neutral-600 font-mono">{quiz.id.slice(0, 8)}...</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-400">
                                            {quiz.creator?.email || <span className="text-neutral-600">Unknown/Deleted</span>}
                                        </td>
                                        <td className="px-6 py-4 text-neutral-500 whitespace-nowrap">
                                            {new Date(quiz.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs border ${quiz.isPublished ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                }`}>
                                                {quiz.isPublished ? 'Published' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-neutral-500">
                                            {quiz._count?.scores || 0} plays
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            {quiz._count?.reports > 0 ? (
                                                <span className="text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                                                    {quiz._count.reports} reports
                                                </span>
                                            ) : (
                                                <span className="text-neutral-600">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <QuizActions quizId={quiz.id} token={token} />
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center bg-neutral-900/30 p-4 rounded-xl border border-neutral-800">
                <div className="text-sm text-neutral-500">
                    Showing {data.data.length} of {data.total} quizzes
                </div>
                <div className="flex gap-2">
                    {pageNum > 1 && (
                        <Link
                            href={`?page=${pageNum - 1}&search=${search}&status=${status}&creator=${creator}&hasReports=${hasReports}`}
                            className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-sm transition-colors"
                        >
                            Previous
                        </Link>
                    )}
                    {pageNum < totalPages && (
                        <Link
                            href={`?page=${pageNum + 1}&search=${search}&status=${status}&creator=${creator}&hasReports=${hasReports}`}
                            className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-sm transition-colors"
                        >
                            Next
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
