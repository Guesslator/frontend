import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUsers } from "@/lib/adminApi";
import { Search } from "lucide-react";
import Link from 'next/link';
import UserRow from "./UserRow";

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
                            <UserRow key={user.id} user={user} token={token} />
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
