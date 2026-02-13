"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { t, Language } from "@/lib/i18n";

interface SearchBarProps {
  lang: Language;
  initialSearch?: string;
  baseUrl?: string;
}

export default function SearchBar({
  lang,
  initialSearch = "",
  baseUrl,
}: SearchBarProps) {
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (value: string) => {
    setSearch(value);

    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.delete("page"); // Reset to page 1 on new search

    startTransition(() => {
      const base = baseUrl || `/${lang}`;
      router.push(`${base}?${params.toString()}`);
    });
  };

  return (
    <div className="relative group max-w-2xl mx-auto mb-8">
      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <Search
          className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
          size={20}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t(lang, "searchPlaceholder")}
          className="w-full h-14 bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full py-4 pl-14 pr-6 text-foreground placeholder:text-slate-400 dark:placeholder:text-neutral-400 focus:border-primary/50 focus:bg-white dark:focus:bg-white/10 focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md hover:border-primary/30"
        />
        {isPending && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
          </div>
        )}
      </div>
    </div>
  );
}
