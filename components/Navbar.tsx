"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { t } from "@/lib/i18n";
import UserMenu from "@/components/UserMenu";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

const LanguageSwitcher = dynamic(
  () => import("@/components/LanguageSwitcher"),
  { ssr: false },
);

interface NavbarProps {
  lang: string;
}

export default function Navbar({ lang }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const validLang = (["tr", "en", "ar", "de"].includes(lang) ? lang : "en") as
    | "tr"
    | "en"
    | "ar"
    | "de";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 pointer-events-none",
        isScrolled ? "pt-1 px-1 md:pt-2 md:px-4" : "pt-0 px-0",
      )}
    >
      <nav
        className={cn(
          "relative pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isScrolled
            ? "w-full md:max-w-7xl mx-auto py-2 px-3 md:px-6 shadow-sm"
            : "w-[96%] md:max-w-7xl mx-auto mt-2 md:mt-4 py-2 px-3 md:py-4 md:px-8",
        )}
      >
        {/* Background & Effects Layer (Floating Pill) */}
        <div
          className={cn(
            "absolute inset-0 overflow-hidden transition-all duration-700 backdrop-blur-2xl ring-1 ring-white/10",
            isScrolled
              ? "rounded-2xl md:rounded-3xl bg-white/5 dark:bg-[#18181b]/60 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-none"
              : "rounded-4xl bg-white/2 dark:bg-[#18181b]/30 shadow-2xl border-none",
          )}
        >
          {/* Top highlight for premium feel */}
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-[1.5px] bg-linear-to-r from-transparent via-primary/50 to-transparent transition-opacity duration-700",
              isScrolled ? "opacity-100" : "opacity-30",
            )}
          />
        </div>

        <div className="relative z-10 flex justify-between items-center gap-2 md:gap-4">
          <Link
            href={`/${lang}`}
            className="group relative flex items-center gap-1.5 md:gap-2 shrink-0 pl-1 md:pl-0"
            aria-label="Guessalator - Home"
          >
            <span
              className={cn(
                "text-[1.1rem] sm:text-xl md:text-3xl font-black tracking-tighter md:tracking-tighter transition-all duration-700",
                !isScrolled &&
                  "drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]",
              )}
            >
              <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-indigo-400 dark:to-indigo-300">
                GUESSALATOR
              </span>
            </span>
          </Link>

          <div className="flex gap-1 md:gap-4 items-center shrink-0">
            <Link
              href={`/${lang}/create`}
              className={cn(
                "group relative overflow-hidden rounded-full font-bold text-[10px] md:text-sm tracking-widest uppercase transition-all duration-700",
                "bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)] ring-1 ring-primary/20",
                "hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)] hover:ring-primary/50 active:scale-95",
                "w-9 h-9 md:w-auto md:px-6 md:h-12 flex items-center justify-center gap-2",
              )}
              aria-label={t(validLang, "createQuiz")}
            >
              <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-0 -inset-full h-full w-[150%] z-5 block transform -skew-x-12 bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer" />
              </div>

              <div className="relative flex items-center gap-2">
                <Plus
                  size={16}
                  strokeWidth={3}
                  className="transition-transform duration-500 group-hover:rotate-90 md:w-[18px] md:h-[18px]"
                />
                <span className="hidden md:inline">
                  {t(validLang, "createQuiz")}
                </span>
              </div>
            </Link>

            {/* Divider */}
            <div className="hidden md:block h-6 w-px bg-white/5 mx-1 rounded-full" />

            <div className="flex items-center gap-1 md:gap-2 pr-0 md:pr-1">
              <div className="flex justify-end">
                <UserMenu lang={lang} />
              </div>

              <div className="flex justify-end pl-0.5 md:pl-2">
                <Suspense
                  fallback={
                    <div className="w-8 h-8 bg-muted/50 animate-pulse rounded-full" />
                  }
                >
                  <LanguageSwitcher currentLang={lang} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
