import Link from 'next/link';
import { fetchContent, fetchContentPaginated } from '../../lib/api';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import ContentCard from '@/components/ContentCard';
import UserMenu from '@/components/UserMenu';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import CategoryTabs from '@/components/CategoryTabs';
import Pagination from '@/components/Pagination';
import { ThemeToggle } from '@/components/ThemeToggle';
import { t } from '@/lib/i18n';

// This is a Server Component
export default async function ContentGridPage({
    params,
    searchParams
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{
        type?: string;
        creatorType?: string;
        subcategory?: string;
        quizType?: string;
        search?: string;
        page?: string;
        sortBy?: string;
        contentLang?: string;
    }>;
}) {
    const { lang } = await params;
    const { type, creatorType, subcategory, quizType, search, page, sortBy, contentLang } = await searchParams;
    const validLang = (['tr', 'en', 'ar', 'de'].includes(lang) ? lang : 'en') as 'tr' | 'en' | 'ar' | 'de';

    // Fetch paginated content with filters
    const { items, pagination } = await fetchContentPaginated({
        lang: validLang,
        type: type as any,
        creatorType: creatorType as any,
        subcategory: subcategory as any,
        quizType: quizType as any,
        search,
        sortBy: sortBy as any,
        page: page ? parseInt(page, 10) : 1,
        limit: 15,
        contentLang
    });

    // For featured carousel on first page without filters
    const showFeatured = !search && !type && !creatorType && (!page || page === '1');
    let featuredItems: any[] = [];
    if (showFeatured && items.length > 0) {
        // Use first 5 items for carousel
        featuredItems = items.slice(0, 5).map(item => ({
            id: item.id,
            title: (item.translations[validLang] || item.translations['en'])?.title || 'Untitled',
            description: (item.translations[validLang] || item.translations['en'])?.description || '',
            imageUrl: item.posterUrl
        }));
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 transition-colors duration-300">
            {/* Navbar */}
            <Navbar lang={lang} />

            <div className="pt-20 md:pt-24 px-4 md:px-12 max-w-[1600px] mx-auto">
                {/* Featured Carousel - Only on page 1 without filters */}
                {showFeatured && featuredItems.length > 0 && (
                    <FeaturedCarousel items={featuredItems} lang={lang} />
                )}

                {/* Search Bar */}
                <SearchBar lang={validLang} initialSearch={search} />

                {/* Category Tabs */}
                <CategoryTabs
                    lang={validLang}
                    activeType={type}
                    activeCreatorType={creatorType}
                    activeSubcategory={subcategory}
                    activeQuizType={quizType}
                    activeSortBy={sortBy}
                />

                {/* Content Grid (Responsive: 1 col mobile -> 5 cols xl) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
                    {items.map((item, index) => {
                        const itemT = item.translations[validLang] || item.translations['en'];
                        return (
                            <ContentCard
                                key={item.id}
                                id={item.id}
                                title={itemT?.title || 'Untitled'}
                                description={itemT?.description || ''}
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
                        <div className="text-6xl mb-4">😕</div>
                        <p className="text-xl font-light">{t(validLang, 'noResults')}</p>
                    </div>
                )}

                {/* Pagination */}
                <Pagination
                    lang={validLang}
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    baseUrl={`/${lang}`}
                    preserveParams={{ type, creatorType, subcategory, quizType, search, sortBy }}
                />
            </div>
        </div>
    );
}
