import { fetchQuizById } from '../../../../lib/api';
import { notFound } from 'next/navigation';
import QuizClient from '@/components/QuizClient';

export default async function QuizPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
    const { lang, id } = await params;

    // fetchQuizById expects (id, lang)
    const quiz = await fetchQuizById(id, lang);

    if (!quiz) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold mb-2">Quiz Unavailable</h1>
                <p className="text-muted-foreground mb-4">
                    This quiz is currently unavailable or has been removed.
                </p>
                <a
                    href={`/${lang}`}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Return Home
                </a>
            </div>
        );
    }

    return <QuizClient quiz={quiz} lang={lang} />;
}
