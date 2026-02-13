"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const SearchBar = dynamic(() => import("./SearchBar"), { ssr: false });
const CategoryTabs = dynamic(() => import("./CategoryTabs"), { ssr: false });

interface ClientSearchPanelProps {
  lang: "tr" | "en" | "ar" | "de";
  search?: string;
  type?: string;
  creatorType?: string;
  subcategory?: string;
  quizType?: string;
  sortBy?: string;
  activeContentLang?: string;
  baseUrl?: string;
  showCreatorFilter?: boolean;
}

export default function ClientSearchPanel({
  lang,
  search,
  type,
  creatorType,
  subcategory,
  quizType,
  sortBy,
  activeContentLang,
  baseUrl,
  showCreatorFilter = true,
}: ClientSearchPanelProps) {
  return (
    <div className="space-y-4">
      <Suspense
        fallback={
          <div className="h-14 max-w-2xl mx-auto bg-white/5 rounded-full animate-pulse mb-8 border border-white/5" />
        }
      >
        <SearchBar lang={lang} initialSearch={search} baseUrl={baseUrl} />
      </Suspense>

      <Suspense
        fallback={
          <div className="sticky top-[68px] md:top-[80px] z-40 bg-background/80 backdrop-blur-xl border-b border-white/10 py-4 mb-8 -mx-4 md:-mx-12 px-4 md:px-12 h-[80px] animate-pulse" />
        }
      >
        <CategoryTabs
          lang={lang}
          activeType={type}
          activeCreatorType={creatorType}
          activeSubcategory={subcategory}
          activeQuizType={quizType}
          activeSortBy={sortBy}
          activeContentLang={activeContentLang}
          baseUrl={baseUrl}
          showCreatorFilter={showCreatorFilter}
        />
      </Suspense>
    </div>
  );
}
