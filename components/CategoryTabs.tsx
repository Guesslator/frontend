"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Filter, Film, Image, PlayCircle } from 'lucide-react';
import { t, Language } from '@/lib/i18n';

interface CategoryTabsProps {
  lang: Language;
  activeType?: string;
  activeCreatorType?: string;
  activeSubcategory?: string;
  activeQuizType?: string;
  activeSortBy?: string;
  baseUrl?: string;
  showCreatorFilter?: boolean;
}

export default function CategoryTabs({
  lang,
  activeType,
  activeCreatorType,
  activeSubcategory,
  activeQuizType,
  activeSortBy,
  baseUrl,
  showCreatorFilter = true
}: CategoryTabsProps) {
  const searchParams = useSearchParams();

  const buildUrl = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.delete('page'); // Reset pagination

    const base = baseUrl || `/${lang}`;
    return `${base}?${params.toString()}`;
  };

  return (
    <div className="mb-12 space-y-6">
      {/* Language Filter */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider whitespace-nowrap">
          {t(lang, 'language')}:
        </span>
        {[
          { key: undefined, label: 'All' },
          { key: 'tr', label: 'TR' },
          { key: 'en', label: 'EN' },
          { key: 'de', label: 'DE' }
        ].map(({ key, label }) => {
          // Check URL param 'contentLang' directly or pass as prop. Using prop is cleaner.
          // We need to add 'activeContentLang' to props.
          const isActive = (searchParams.get('contentLang') || undefined) === key;

          return (
            <Link
              key={label}
              href={buildUrl({ contentLang: key })}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all border border-border ${isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card text-muted-foreground hover:text-foreground'
                }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Sorting Filter */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2 bg-card p-1 rounded-lg border border-border">
          <span className="text-xs text-muted-foreground uppercase tracking-wider px-2">
            {t(lang, 'sortBy')}
          </span>
          {[
            { key: 'recent', label: 'sortByRecent' },
            { key: 'popular', label: 'sortByPopular' }
          ].map(({ key, label }) => {
            const isActive = activeSortBy === key || (!activeSortBy && key === 'recent');
            return (
              <Link
                key={key}
                href={buildUrl({ sortBy: key })}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
              >
                {t(lang, label)}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Creator Type Filter */}
      {showCreatorFilter && (
        <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
          <span className="text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Filter size={16} />
            {t(lang, 'filter')}
          </span>
          <div className="h-6 w-px bg-border" />

          <Link
            href={buildUrl({ creatorType: undefined })}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${!activeCreatorType
              ? 'bg-foreground text-background shadow-lg scale-105'
              : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
          >
            {t(lang, 'all')}
          </Link>

          <Link
            href={buildUrl({ creatorType: 'USER' })}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeCreatorType === 'USER'
              ? 'bg-secondary text-secondary-foreground shadow-lg scale-105'
              : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
          >
            {t(lang, 'userQuizzes')}
          </Link>
        </div>
      )}

      {/* Content Type Filter */}
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
        {[
          { key: undefined, label: 'all' },
          { key: 'MOVIE', label: 'movies' },
          { key: 'SERIES', label: 'series' },
          { key: 'GAME', label: 'games' },
          { key: 'SPORTS', label: 'sports' },
          { key: 'MIXED', label: 'other' }
        ].map(({ key, label }) => {
          const isActive = activeType === key || (!activeType && !key);
          return (
            <Link
              key={label}
              href={buildUrl({ type: key, subcategory: undefined })}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${isActive
                ? 'bg-foreground text-background shadow-lg scale-105'
                : 'bg-card text-muted-foreground hover:text-foreground'
                }`}
            >
              {t(lang, label)}
            </Link>
          );
        })}
      </div>

      {/* Sports Subcategory Filter - Show only when SPORTS is selected */}
      {(activeType === 'SPORTS') && (
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pl-8 pt-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {t(lang, 'subcategory')}:
          </span>
          {[
            { key: undefined, label: 'all' },
            { key: 'FOOTBALL', label: 'football' },
            { key: 'BASKETBALL', label: 'basketball' },
            { key: 'MMA', label: 'mma' }
          ].map(({ key, label }) => {
            const isActive = activeSubcategory === key || (!activeSubcategory && !key);
            return (
              <Link
                key={label}
                href={buildUrl({ subcategory: key })}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${isActive
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                  : 'bg-card text-muted-foreground hover:text-foreground'
                  }`}
              >
                {t(lang, label)}
              </Link>
            );
          })}
        </div>
      )}

      {/* Quiz Type Filter */}
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {t(lang, 'quizType')}:
        </span>
        {[
          { key: undefined, label: 'allTypes', icon: Filter },
          { key: 'VIDEO', label: 'videoQuizzes', icon: Film },
          { key: 'IMAGE', label: 'imageQuizzes', icon: Image },
          { key: 'TEXT', label: 'standardQuizzes', icon: PlayCircle }
        ].map(({ key, label, icon: Icon }) => {
          const isActive = activeQuizType === key || (!activeQuizType && !key);
          return (
            <Link
              key={label}
              href={buildUrl({ quizType: key })}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${isActive
                ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                : 'bg-card text-muted-foreground hover:text-foreground'
                }`}
            >
              <Icon size={14} />
              {t(lang, label)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
