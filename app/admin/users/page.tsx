import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUsers } from "@/lib/adminApi";
import { Search } from "lucide-react";
import Link from 'next/link';

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string }> }) {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken || '';
    const { page, search } = (await searchParams) || { page: '1', search: '' };

    const pageNum = parseInt(page || '1');
    const take = 20;
    const skip = (pageNum - 1) * take;

    let data;
    try {
        data = await getUsers({ skip, take, search }, token);
    } catch (e) {
        console.error(e);
        data = { data: [], total: 0 };
    }

    const totalPages = Math.ceil(data.total / take);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Users Management</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                    <form action="">
                        <input
                            name="search"
                            defaultValue={search}
                            placeholder="Search users..."
                            className="bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
                        />
                    </form>
                </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-neutral-900/80 text-neutral-400 uppercase text-xs font-medium border-b border-neutral-800">
                        <tr>
                            <th className="px-6 py-3">Email / Name</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Stats</th>
                            <th className="px-6 py-3">Created</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {data.data.map((user: any) => (
                            <tr key={user.id} className="hover:bg-neutral-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-neutral-200">{user.email}</span>
                                        <span className="text-xs text-neutral-500">{user.name || 'No Name'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs border ${user.role === 'SUPER_ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                            user.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                'bg-neutral-800 text-neutral-400 border-neutral-700'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {user.isBanned ? (
                                        <span className="text-red-400 text-xs">Banned</span>
                                    ) : (
                                        <span className="text-green-400 text-xs">Active</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-xs text-neutral-500">
                                    {user._count?.createdContent} quizzes<br />
                                    {user._count?.scores} plays
                                </td>
                                <td className="px-6 py-4 text-xs text-neutral-500">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-indigo-400 hover:text-indigo-300 text-xs mr-2">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data.data.length === 0 && (
                    <div className="p-8 text-center text-neutral-500">No users found.</div>
                )}
            </div>

            <div className="flex justify-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const p = i + 1; // Simplify logic just show 1-5 for now
                    return (
                        <Link
                            key={p}
                            href={`?page=${p}&search=${search || ''}`}
                            className={`px-3 py-1 rounded border text-sm ${pageNum === p ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-neutral-800 hover:border-neutral-600'}`}
                        >
                            {p}
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
