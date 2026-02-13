import { Suspense } from "react";
import Link from "next/link";
import { fetchContent, fetchContentPaginated } from "../../lib/api";
import HeroSection from "@/components/HeroSection";
import ContentCard from "@/components/ContentCard";
import UserMenu from "@/components/UserMenu";
import ClientSearchPanel from "@/components/ClientSearchPanel";
import Pagination from "@/components/Pagination";
import { ThemeToggle } from "@/components/ThemeToggle";
import { t } from "@/lib/i18n";

// This is a Server Component
export default async function ContentGridPage({
  params,
  searchParams,
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
    .filter((item) => !!item.translations[validLang]?.title)
    .map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.translations[validLang].title,
      description: item.translations[validLang].description || "",
      imageUrl: item.posterUrl,
    }));

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 transition-colors duration-300">
      {/* Hero Section - Full Width & Immersive */}
      {showHero && heroItems.length > 0 && (
        <HeroSection items={heroItems} lang={lang} />
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
              contentLang: contentLang || validLang,
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}

// Separate component for the streamed content list
async function PaginatedContentList({
  lang,
  filters,
}: {
  lang: "tr" | "en" | "ar" | "de";
  filters: any;
}) {
  const { items, pagination } = await fetchContentPaginated(filters);

  return (
    <>
      {/* Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8 lg:gap-10 pb-12">
        {items
          .filter((item) => !!item.translations[lang]?.title)
          .map((item, index) => {
            const itemT = item.translations[lang];
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
          })}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-xl font-light">{t(lang, "noResults")}</p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
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
          className="aspect-[2/3] bg-card/50 rounded-2xl animate-pulse"
        />
      ))}
    </div>
  );
}
