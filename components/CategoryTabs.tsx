"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Filter,
  Film,
  Image,
  PlayCircle,
  X,
  ChevronDown,
  Check,
  Music,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  t,
  Language,
  LANGUAGES,
  languageNames,
  translations,
} from "@/lib/i18n";

interface CategoryTabsProps {
  lang: Language;
  activeType?: string;
  activeCreatorType?: string;
  activeSubcategory?: string;
  activeQuizType?: string;
  activeSortBy?: string;
  activeContentLang?: string;
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
  activeContentLang,
  baseUrl,
  showCreatorFilter = true,
}: CategoryTabsProps) {
  const searchParams = useSearchParams();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const router = useRouter();

  const handleNavigation = (url: string) => {
    router.push(url, { scroll: false });
  };

  const buildUrl = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.delete("page"); // Reset pagination

    const base = baseUrl || `/${lang}`;
    return `${base}?${params.toString()}`;
  };

  // Count active filters to show a badge
  const activeFilterCount = [
    activeCreatorType,
    activeQuizType,
    activeSubcategory,
    activeContentLang,
  ].filter(Boolean).length;

  const isAnyFilterActive = Boolean(
    activeSortBy ||
    activeQuizType ||
    activeCreatorType ||
    activeSubcategory ||
    activeContentLang ||
    activeType,
  );

  const getFilterLabel = (key: string, value: string) => {
    if (key === "sortBy") {
      return value === "popular"
        ? t(lang, "sortByPopular")
        : t(lang, "sortByRecent");
    }
    if (key === "creatorType") {
      return value === "USER" ? t(lang, "userQuizzes") : t(lang, "all");
    }
    if (key === "quizType") {
      if (value === "VIDEO") return t(lang, "video");
      if (value === "IMAGE") return t(lang, "image");
      if (value === "AUDIO") return t(lang, "music");
      return t(lang, "standardQuiz");
    }
    if (key === "subcategory") {
      if (value === "FOOTBALL") return t(lang, "football");
      if (value === "BASKETBALL") return t(lang, "basketball");
      if (value === "MMA") return t(lang, "mma");
      return t(lang, "all");
    }
    if (key === "contentLang") {
      return languageNames[value] || value;
    }
    return value;
  };

  const activeChips: Array<{ key: string; value: string; label: string }> = [];

  if (activeSortBy) {
    activeChips.push({
      key: "sortBy",
      value: activeSortBy,
      label: getFilterLabel("sortBy", activeSortBy),
    });
  }

  if (activeQuizType) {
    activeChips.push({
      key: "quizType",
      value: activeQuizType,
      label: getFilterLabel("quizType", activeQuizType),
    });
  }

  if (activeCreatorType) {
    activeChips.push({
      key: "creatorType",
      value: activeCreatorType,
      label: getFilterLabel("creatorType", activeCreatorType),
    });
  }

  if (activeSubcategory) {
    activeChips.push({
      key: "subcategory",
      value: activeSubcategory,
      label: getFilterLabel("subcategory", activeSubcategory),
    });
  }

  if (activeContentLang) {
    activeChips.push({
      key: "contentLang",
      value: activeContentLang,
      label: getFilterLabel("contentLang", activeContentLang),
    });
  }

  return (
    <div className="sticky top-[68px] md:top-[80px] z-40 bg-background/85 backdrop-blur-xl border-b border-border/40 py-4 mb-10 -mx-4 md:-mx-12 px-4 md:px-12 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.02)] min-h-[72px]">
      <div className="flex items-center gap-4 max-w-[1600px] mx-auto">
        {/* Main Categories (Always Visible) */}
        <div className="flex-1 overflow-x-auto scrollbar-hide py-1">
          <div className="flex items-center gap-2">
            {[
              { key: undefined, label: "all" },
              { key: "MOVIE", label: "movies" },
              { key: "SERIES", label: "series" },
              { key: "GAME", label: "games" },
              { key: "SPORTS", label: "sports" },
              { key: "MIXED", label: "other" },
            ].map(({ key, label }) => {
              const isActive = activeType === key || (!activeType && !key);
              return (
                <button
                  key={label}
                  onClick={() =>
                    handleNavigation(
                      buildUrl({ type: key, subcategory: undefined }),
                    )
                  }
                  aria-label={`${t(lang, "filterBy")}: ${t(lang, label)}`}
                  className={`relative px-5 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all whitespace-nowrap overflow-hidden group shrink-0 ${isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-md"
                    } cursor-pointer`
                  }
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                  )}
                  {t(lang, label)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          aria-label={isFiltersOpen ? t(lang, "closeFilters") : t(lang, "openFilters")}
          className={`group shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${isFiltersOpen || activeFilterCount > 0
            ? "bg-secondary text-secondary-foreground border-secondary shadow-lg shadow-secondary/20"
            : "bg-background border-border hover:border-foreground/20 hover:bg-muted/50"
            } cursor-pointer`}
        >
          <Filter size={16} className={isFiltersOpen ? "animate-pulse" : ""} />
          <span className="hidden md:inline">{t(lang, "filter")}</span>
          {activeFilterCount > 0 && (
            <span className="bg-foreground/10 px-1.5 py-0.5 rounded-full text-[10px] min-w-[20px] text-center font-bold">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${isFiltersOpen ? "rotate-180" : "group-hover:translate-y-0.5"}`}
          />
        </button>
      </div>

      {isAnyFilterActive && (
        <div className="max-w-[1600px] mx-auto mt-4 flex flex-wrap items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="h-6 w-px bg-border/50 mr-2 hidden md:block" />
          <button
            onClick={() =>
              handleNavigation(
                buildUrl({
                  type: undefined,
                  sortBy: undefined,
                  quizType: undefined,
                  creatorType: undefined,
                  subcategory: undefined,
                  contentLang: undefined,
                }),
              )
            }
            className="px-3 py-1 rounded-full text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <X size={12} strokeWidth={3} />
            {t(lang, "clearAll")}
          </button>

          {activeChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() =>
                handleNavigation(
                  buildUrl({
                    [chip.key]: undefined,
                  }),
                )
              }
              className="group flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-transparent hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive transition-all cursor-pointer"
              aria-label={`Clear ${chip.label}`}
            >
              {chip.label}
              <div className="bg-black/5 dark:bg-white/10 rounded-full p-0.5 group-hover:bg-destructive/10">
                <X size={10} />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Collapsible Filters Area */}
      <AnimatePresence>
        {isFiltersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} // Spring-like feel
            className="overflow-hidden bg-muted/30 -mx-4 md:-mx-12 px-4 md:px-12 mt-4 border-b border-border/50"
          >
            <div className="max-w-[1600px] mx-auto py-6 md:py-8">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* 1. Sort */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {t(lang, "sortBy")}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "recent", label: "sortByRecent" },
                      { key: "popular", label: "sortByPopular" },
                    ].map((s) => (
                      <button
                        key={s.key}
                        onClick={() =>
                          handleNavigation(buildUrl({ sortBy: s.key }))
                        }
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeSortBy === s.key ||
                          (!activeSortBy && s.key === "recent")
                          ? "bg-background border-primary text-primary shadow-sm"
                          : "bg-background border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                          }`}
                      >
                        {t(lang, s.label)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Quiz Type */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {t(lang, "quizType")}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: undefined, label: "all", icon: Check },
                      { key: "VIDEO", label: "video", icon: Film },
                      { key: "IMAGE", label: "image", icon: Image },
                      { key: "AUDIO", label: "music", icon: Music },
                      { key: "TEXT", label: "standardQuiz", icon: PlayCircle },
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={label}
                        onClick={() =>
                          handleNavigation(buildUrl({ quizType: key }))
                        }
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeQuizType === key || (!activeQuizType && !key)
                          ? "bg-background border-primary text-primary shadow-sm"
                          : "bg-background border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                          }`}
                      >
                        <Icon size={14} strokeWidth={2.5} />
                        {t(lang, label)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Creator & Subcategories mixed column */}
                <div className="space-y-6">
                  {showCreatorFilter && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {t(lang, "createdBy")}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            handleNavigation(
                              buildUrl({ creatorType: undefined }),
                            )
                          }
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${!activeCreatorType ? "bg-background border-secondary text-secondary shadow-sm" : "bg-background border-transparent text-muted-foreground hover:border-border"} cursor-pointer`}
                        >
                          {t(lang, "all")}
                        </button>
                        <button
                          onClick={() =>
                            handleNavigation(buildUrl({ creatorType: "USER" }))
                          }
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeCreatorType === "USER" ? "bg-background border-secondary text-secondary shadow-sm" : "bg-background border-transparent text-muted-foreground hover:border-border"} cursor-pointer`}
                        >
                          {t(lang, "userQuizzes")}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Subcategories (Contextual) */}
                  {activeType === "SPORTS" && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {t(lang, "subcategory")}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: undefined, label: "all" },
                          { key: "FOOTBALL", label: "football" },
                          { key: "BASKETBALL", label: "basketball" },
                          { key: "MMA", label: "mma" },
                        ].map(({ key, label }) => (
                          <button
                            key={label}
                            onClick={() =>
                              handleNavigation(buildUrl({ subcategory: key }))
                            }
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeSubcategory === key ||
                              (!activeSubcategory && !key)
                              ? "bg-background border-primary text-primary shadow-sm"
                              : "bg-background border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                              } cursor-pointer`}
                          >
                            {t(lang, label)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Content Language */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Globe size={14} />
                    Language
                  </h4>
                  <div className="relative inline-block w-full md:w-auto">
                    <select
                      value={activeContentLang || ""}
                      onChange={(e) =>
                        handleNavigation(
                          buildUrl({
                            contentLang: e.target.value || undefined,
                          }),
                        )
                      }
                      className="w-full md:w-48 appearance-none bg-background border border-border text-foreground text-sm font-medium rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition-colors hover:border-primary/50"
                    >
                      <option value="">{t(lang, "all")}</option>
                      {Object.keys(translations).map((l) => (
                        <option key={l} value={l}>
                          {languageNames[l] || l}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                      <ChevronDown size={14} strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
