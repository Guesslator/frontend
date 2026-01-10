"use client";

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { t, Language } from '@/lib/i18n';

interface SearchBarProps {
  lang: Language;
  initialSearch?: string;
  baseUrl?: string;
}

export default function SearchBar({ lang, initialSearch = '', baseUrl }: SearchBarProps) {
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (value: string) => {
    setSearch(value);

    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    params.delete('page'); // Reset to page 1 on new search

    startTransition(() => {
      const base = baseUrl || `/${lang}`;
      router.push(`${base}?${params.toString()}`);
    });
  };

  return (
    <div className="relative mb-8">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
      <input
        type="text"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={t(lang, 'searchPlaceholder')}
        className="w-full bg-card border border-border rounded-full py-4 pl-12 pr-6 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors shadow-sm"
      />
      {isPending && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}
