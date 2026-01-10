import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { t, Language } from '@/lib/i18n';

interface PaginationProps {
  lang: Language;
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  preserveParams?: Record<string, string | undefined>;
}

export default function Pagination({
  lang,
  currentPage,
  totalPages,
  baseUrl,
  preserveParams = {}
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(preserveParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (page > 1) params.set('page', String(page));
    const query = params.toString();
    return query ? `${baseUrl}?${query}` : baseUrl;
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-16">
      <Link
        href={buildUrl(currentPage - 1)}
        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${currentPage === 1
            ? 'bg-muted text-muted-foreground cursor-not-allowed pointer-events-none'
            : 'bg-card text-foreground hover:bg-accent hover:text-accent-foreground border border-border shadow-sm'
          }`}
      >
        <ChevronLeft size={20} />
        {t(lang, 'previous')}
      </Link>

      <div className="flex items-center gap-2 px-6 py-3 bg-card rounded-full border border-border shadow-sm">
        <span className="text-muted-foreground">{t(lang, 'page')}</span>
        <span className="text-foreground font-bold">{currentPage}</span>
        <span className="text-muted-foreground">{t(lang, 'of')}</span>
        <span className="text-muted-foreground">{totalPages}</span>
      </div>

      <Link
        href={buildUrl(currentPage + 1)}
        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${currentPage === totalPages
            ? 'bg-muted text-muted-foreground cursor-not-allowed pointer-events-none'
            : 'bg-card text-foreground hover:bg-accent hover:text-accent-foreground border border-border shadow-sm'
          }`}
      >
        {t(lang, 'next')}
        <ChevronRight size={20} />
      </Link>
    </div>
  );
}
