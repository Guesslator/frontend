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
      <div className="absolute -inset-1 bg-linear-to-r from-primary/0 via-primary/20 to-primary/0 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />
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
          className="w-full h-[60px] bg-background/40 backdrop-blur-2xl border border-white/5 rounded-full py-4 pl-14 pr-6 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:bg-background/80 focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all duration-500 shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:border-white/10 hover:bg-background/60"
        />
        {isPending && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border border-primary/30 border-t-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
          </div>
        )}
      </div>
    </div>
  );
}
