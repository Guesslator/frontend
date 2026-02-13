import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { t, Language } from "@/lib/i18n";

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
  preserveParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(preserveParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `${baseUrl}?${query}` : baseUrl;
  };

  return (
    <div className="flex items-center justify-center gap-6 mt-20">
      <Link
        href={buildUrl(currentPage - 1)}
        scroll={false}
        className={`flex items-center group gap-2 px-6 py-3 rounded-full transition-all duration-300 backdrop-blur-md ${
          currentPage === 1
            ? "bg-secondary/30 text-muted-foreground/50 border border-white/5 cursor-not-allowed pointer-events-none"
            : "bg-secondary/50 text-foreground hover:bg-primary hover:text-primary-foreground border border-white/10 hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:-translate-y-0.5"
        }`}
      >
        <ChevronLeft
          size={18}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span className="font-medium">{t(lang, "previous")}</span>
      </Link>

      <div className="flex items-center gap-3 px-8 py-3 bg-secondary/30 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
        <span className="text-muted-foreground/80 text-sm font-medium">
          {t(lang, "page")}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.6)]">
            {currentPage}
          </span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm font-bold text-muted-foreground">
            {totalPages}
          </span>
        </div>
      </div>

      <Link
        href={buildUrl(currentPage + 1)}
        scroll={false}
        className={`flex items-center group gap-2 px-6 py-3 rounded-full transition-all duration-300 backdrop-blur-md ${
          currentPage === totalPages
            ? "bg-secondary/30 text-muted-foreground/50 border border-white/5 cursor-not-allowed pointer-events-none"
            : "bg-secondary/50 text-foreground hover:bg-primary hover:text-primary-foreground border border-white/10 hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:-translate-y-0.5"
        }`}
      >
        <span className="font-medium">{t(lang, "next")}</span>
        <ChevronRight
          size={18}
          className="group-hover:translate-x-1 transition-transform"
        />
      </Link>
    </div>
  );
}
