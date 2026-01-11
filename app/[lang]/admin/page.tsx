"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { fetchUsers, fetchContentPaginated, deleteUserContent } from "@/lib/api";
import { t, Language } from "@/lib/i18n";
import { Trash, Edit, User as UserIcon, Calendar, Film, Gamepad2, Tv, Trophy } from "lucide-react";
import { toast } from "sonner";

export default function AdminPage({ params: { lang } }: { params: { lang: string } }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'users' | 'quizzes'>('users');
    const [users, setUsers] = useState<any[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const validLang = (['tr', 'en', 'ar'].includes(lang) ? lang : 'en') as Language;

    useEffect(() => {
        if (session && session.user.role !== 'ADMIN') {
            router.push('/');
        }
    }, [session, router]);

    useEffect(() => {
        if (!session?.accessToken) return;

        const loadData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'users') {
                    const data = await fetchUsers(session.accessToken as string);
                    setUsers(data);
                } else {
                    const data = await fetchContentPaginated({}); // Fetches all public content
                    // Note: fetchContentPaginated might need adjustments to fetch ALL content including unpublished if needed, 
                    // or we rely on public list. For admin, usually we want to see everything.
                    // But currently api methods might be limited. Let's use what we have.
                    // The 'all' filter usually returns all.
                    setQuizzes(data.items);
                }
            } catch (error) {
                console.error("Failed to load admin data", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [activeTab, session?.accessToken]);

    const handleDeleteQuiz = (id: string) => {
        toast(t(validLang, 'confirmDelete'), {
            action: {
                label: t(validLang, 'deleteQuiz'),
                onClick: () => performDeleteQuiz(id)
            },
            cancel: {
                label: t(validLang, 'cancel'),
                onClick: () => { },
            },
        });
    };

    const performDeleteQuiz = async (id: string) => {
        try {
            await deleteUserContent(session?.accessToken as string, id);
            setQuizzes(quizzes.filter(q => q.id !== id));
            toast.success('Quiz deleted');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    if (!session || session.user.role !== 'ADMIN') return null;

    return (
        <div className="min-h-screen bg-neutral-950 pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                    <Trophy className="text-yellow-500" />
                    Admin Dashboard
                </h1>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-white/10 pb-1">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === 'users' ? 'bg-red-600/20 text-red-500 border-b-2 border-red-500' : 'text-neutral-400 hover:text-white'}`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab('quizzes')}
                        className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === 'quizzes' ? 'bg-red-600/20 text-red-500 border-b-2 border-red-500' : 'text-neutral-400 hover:text-white'}`}
                    >
                        Quizzes
                    </button>
                </div>

                {loading ? (
                    <div className="text-white">Loading...</div>
                ) : (
                    <div className="bg-neutral-900/50 rounded-xl border border-white/5 overflow-hidden">
                        {activeTab === 'users' ? (
                            <table className="w-full text-left text-sm text-neutral-400">
                                <thead className="bg-neutral-900 uppercase text-neutral-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Joined</th>
                                        <th className="px-6 py-4">Quizzes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs">
                                                    {user.name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                {user.name || 'Anonymous'}
                                            </td>
                                            <td className="px-6 py-4">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user._count?.createdContent || 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-neutral-400">
                                    <thead className="bg-neutral-900 uppercase text-neutral-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Poster</th>
                                            <th className="px-6 py-4">Title</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4">Creator</th>
                                            <th className="px-6 py-4">Stats</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {quizzes.map((quiz) => (
                                            <tr key={quiz.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="w-10 h-14 bg-neutral-800 rounded overflow-hidden">
                                                        {quiz.posterUrl && <img src={quiz.posterUrl} alt="" className="w-full h-full object-cover" />}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-white">
                                                    {quiz.translations?.find((t: any) => t.language === validLang)?.title || quiz.translations?.[0]?.title}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {quiz.type === 'MOVIE' && <Film size={14} />}
                                                        {quiz.type === 'SERIES' && <Tv size={14} />}
                                                        {quiz.type === 'GAME' && <Gamepad2 size={14} />}
                                                        {quiz.type}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {quiz.creator?.name || 'Admin'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1 text-xs">
                                                        <span>Views: {quiz.popularityScore}</span>
                                                        <span>Created: {new Date(quiz.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => router.push(`/${lang}/create?edit=${quiz.id}`)} // Assuming edit flow support or similar
                                                            className="p-2 hover:bg-white/10 rounded transition-colors text-blue-400"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteQuiz(quiz.id)}
                                                            className="p-2 hover:bg-red-500/20 rounded transition-colors text-red-500"
                                                        >
                                                            <Trash size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
