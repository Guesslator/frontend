import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchContentDetail } from "@/lib/api";
import QuizEditor from "@/components/QuizEditor";
import { redirect } from "next/navigation";

export default async function EditQuizPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
    const { lang, id } = await params;

    // Auth Check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect(`/${lang}/auth`);
    }

    const validLang = (['tr', 'en', 'ar', 'de'].includes(lang) ? lang : 'en');

    // Fetch Data
    const item = await fetchContentDetail(id, validLang);

    if (!item) {
        return <div className="flex min-h-screen items-center justify-center text-xl font-bold">Quiz not found</div>;
    }

    // Authorization Check: Creator only
    // Note: session.user.id is string, item.creator?.id is string.
    const isCreator = session.user.id === item.creator?.id;
    const isAdmin = (session.user as any).role === 'ADMIN';

    if (!isCreator && !isAdmin) {
        return (
            <div className="flex min-h-screen items-center justify-center flex-col gap-4">
                <h1 className="text-2xl font-black text-red-500">Unauthorized Access</h1>
                <p>You do not have permission to edit this quiz.</p>
            </div>
        );
    }

    return <QuizEditor item={item} lang={lang} />;
}
