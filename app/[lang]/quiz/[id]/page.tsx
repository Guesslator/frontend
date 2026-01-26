import { fetchQuizById } from '../../../../lib/api';
import QuizClient from '@/components/QuizClient';

export default async function QuizPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
    const { lang, id } = await params;

    // fetchQuizById expects (id, lang)
    const quiz = await fetchQuizById(id, lang);


    // TODO: Improve Error UI
    if (!quiz) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">Quiz Not Found</h1>
                    <p className="text-muted-foreground">The quiz you are looking for does not exist or has been removed.</p>
                </div>
            </div>
        );
    }

    return <QuizClient quiz={quiz} lang={lang} />;
}
