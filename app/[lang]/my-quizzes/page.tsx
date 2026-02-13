import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { fetchContentPaginated } from '@/lib/api';
import ContentCard from '@/components/ContentCard';
import UserMenu from '@/components/UserMenu';
import ClientSearchPanel from '@/components/ClientSearchPanel';
import Pagination from '@/components/Pagination';

import { t } from '@/lib/i18n';

// This is a Server Component
export default async function MyQuizzesPage({
    params,
    searchParams
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{
        type?: string;
        subcategory?: string;
        quizType?: string;
        search?: string;
        page?: string;
        sortBy?: string;
    }>;
}) {
    const { lang } = await params;
    const { type, subcategory, quizType, search, page, sortBy } = await searchParams;
    const validLang = (['tr', 'en', 'ar', 'de'].includes(lang) ? lang : 'en') as 'tr' | 'en' | 'ar' | 'de';

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect(`/${lang}/auth`);
    }

    // Fetch paginated content with filters
    const { items, pagination } = await fetchContentPaginated({
        lang: validLang,
        type: type as any,
        subcategory: subcategory as any,
        quizType: quizType as any,
        search,
        sortBy: sortBy as any,
        page: page ? parseInt(page, 10) : 1,
        limit: 15,
        creatorId: session.user.id
    });

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 transition-colors duration-300">
            {/* Navbar */}
            {/* Navbar */}


            <div className="pt-24 px-4 md:px-12 max-w-[1600px] mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">
                        {t(validLang, 'myQuizzes')}
                    </h1>
                </div>

                {/* Search & Filter Panel (Client-side SearchParams handling) */}
                <ClientSearchPanel
                    lang={validLang}
                    search={search}
                    type={type}
                    subcategory={subcategory}
                    quizType={quizType}
                    sortBy={sortBy}
                    baseUrl={`/${lang}/my-quizzes`}
                    showCreatorFilter={false}
                />

                {/* Content Grid */}
                <div className="grid grid-cols-3 md:grid-cols-5 gap-6 md:gap-8">
                    {items
                        .filter(item => !!item.translations[validLang]?.title)
                        .map((item, index) => {
                            const itemT = item.translations[validLang];
                            return (
                                <ContentCard
                                    key={item.id}
                                    id={item.id}
                                    title={itemT.title}
                                    description={itemT.description || ''}
                                    posterUrl={item.posterUrl}
                                    lang={lang}
                                    index={index}
                                    creatorType={item.creatorType}
                                    creator={item.creator}
                                    quizType={item.quizType}
                                />
                            );
                        })}
                </div>

                {/* Empty State */}
                {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
                        <div className="text-6xl mb-4">📝</div>
                        <p className="text-xl font-light">{t(validLang, 'noResults')}</p>
                        <Link
                            href={`/${lang}/create`}
                            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary/90 transition-colors shadow-lg"
                        >
                            {t(validLang, 'createQuiz')}
                        </Link>
                    </div>
                )}

                {/* Pagination */}
                <Pagination
                    lang={validLang}
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    baseUrl={`/${lang}/my-quizzes`}
                    preserveParams={{ type, subcategory, quizType, search, sortBy }}
                />
            </div>
        </div>
    );
}
