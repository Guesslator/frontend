import { fetchQuizById } from '../../../../lib/api';
import { notFound } from 'next/navigation';
import QuizClient from '@/components/QuizClient';

export default async function QuizPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
    const { lang, id } = await params;

    // fetchQuizById expects (id, lang)
    const quiz = await fetchQuizById(id, lang);

    if (!quiz) {
        return notFound();
    }

    return <QuizClient quiz={quiz} lang={lang} />;
}
