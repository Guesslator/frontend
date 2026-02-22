import { Suspense } from "react";
import Link from "next/link";
import { PageSearchParams } from "@/types/types";
import { fetchContent, fetchContentPaginated } from "../../lib/api";
import HeroSection from "@/components/HeroSection";
import ContentCard from "@/components/ContentCard";
import UserMenu from "@/components/UserMenu";
import ClientSearchPanel from "@/components/ClientSearchPanel";
import PerformanceDeferred from "@/components/PerformanceDeferred";
import { t, Language } from "@/lib/i18n";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const validLang = (["tr", "en", "ar", "de"].includes(lang) ? lang : "en") as Language;

  return {
    title: t(validLang, "heroValueProp") || "The Ultimate Cinematic Quiz",
    description: t(validLang, "footerDesc"),
    alternates: {
      canonical: `/${validLang}`,
    },
  };
}
// This is a Server Component
export default async function ContentGridPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<PageSearchParams>;
}) {
  const { lang } = await params;
  const {
    type,
    creatorType,
    subcategory,
    quizType,
    search,
    page,
    sortBy,
    contentLang,
  } = await searchParams;

  const validLang = (["tr", "en", "ar", "de"].includes(lang) ? lang : "en") as
    | "tr"
    | "en"
    | "ar"
    | "de";

  // Fetch ONLY Hero items immediately for LCP
  // We fetch a small batch to ensure Hero renders fast
  const heroResponse = await fetchContentPaginated(
    {
      lang: validLang,
      limit: 5,
      sortBy: "popular",
    },
    {
      cache: "force-cache",
      revalidate: 60,
    },
  ).catch(() => ({ items: [] }));

  const showHero = !search && !creatorType && (!page || page === "1");
  const heroItems = heroResponse.items
    .map((item) => {
      const t = item.translations[validLang] || item.translations['en'] || Object.values(item.translations)[0];
      if (!t) return null;
      return {
        id: item.id,
        slug: item.slug,
        title: t.title,
        description: t.description || "",
        imageUrl: item.posterUrl,
        questionCount: item.questionCount,
        quizType: item.quizType,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 transition-colors duration-300">

      {/* Hero Section - Full Width & Immersive - Rendered Server-side for LCP */}
      {showHero && heroItems.length > 0 ? (
        <HeroSection items={heroItems} lang={lang} />
      ) : (
        <h1 className="sr-only">Guessalator - {t(validLang, "heroValueProp")}</h1>
      )}

      <div
        className={`px-4 md:px-12 max-w-[1600px] mx-auto ${showHero ? "pt-12" : "pt-24"}`}
      >
        {/* Search & Filter Panel (Client-side SearchParams handling) */}
        <ClientSearchPanel
          lang={validLang}
          search={search}
          type={type}
          creatorType={creatorType}
          subcategory={subcategory}
          quizType={quizType}
          sortBy={sortBy}
          activeContentLang={contentLang}
        />

        {/* Main Content Area - Streamed */}
        <Suspense fallback={<GridSkeleton />}>
          <PaginatedContentList
            lang={validLang}
            filters={{
              type: type as any,
              creatorType: creatorType as any,
              subcategory: subcategory as any,
              quizType: quizType as any,
              search,
              sortBy: sortBy as any,
              page: page ? parseInt(page, 10) : 1,
              limit: 15,
              contentLang: contentLang, // Allow undefined to show all
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}//selam

// Separate component for the streamed content list
async function PaginatedContentList({
  lang,
  filters,
}: {
  lang: "tr" | "en" | "ar" | "de";
  filters: any;
}) {
  const { items, pagination } = await fetchContentPaginated(filters, {
    revalidate: 60, // Cache for 60 seconds to improve performance
  });

  return (
    <>
      {/* Content Grid */}
      <h2 className="sr-only">{t(lang, "quizzes" as any) || "Explore Quizzes"}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8 lg:gap-10 pb-12">
        {items
          .map((item, index) => {
            // FALLBACK LOGIC: Current Lang -> English -> First Available
            const itemT = item.translations[lang] || item.translations['en'] || Object.values(item.translations)[0];

            if (!itemT) return null;

            return (
              <ContentCard
                key={item.id}
                id={item.id}
                slug={item.slug}
                title={itemT.title}
                description={itemT.description || ""}
                posterUrl={item.posterUrl}
                lang={lang}
                index={index}
                creatorType={item.creatorType}
                creator={item.creator}
                quizType={item.quizType}
                stats={item.stats}
              />
            );
          }).filter(Boolean)}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
          <div className="text-6xl mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-search-x"
            >
              <path d="m13.5 8.5-5 5" />
              <path d="m8.5 8.5 5 5" />
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <p className="text-xl font-light">{t(lang, "noResults")}</p>
        </div>
      )}

      {/* Pagination & Deferred Elements */}
      <PerformanceDeferred
        lang={lang}
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        baseUrl={`/${lang}`}
        preserveParams={{
          type: filters.type,
          creatorType: filters.creatorType,
          subcategory: filters.subcategory,
          quizType: filters.quizType,
          search: filters.search,
          sortBy: filters.sortBy,
          contentLang: filters.contentLang,
        }}
      />
    </>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="aspect-2/3 bg-card/50 rounded-2xl animate-pulse"
        />
      ))}
    </div>
  );
}
