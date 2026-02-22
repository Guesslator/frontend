"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { t } from "@/lib/i18n";
import { ThemeToggle } from "@/components/ThemeToggle";
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
          "relative pointer-events-auto w-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isScrolled
            ? "max-w-full md:max-w-7xl mx-auto py-2 px-3 md:px-6 shadow-sm"
            : "max-w-full py-3 px-4 md:py-4 md:px-12",
        )}
      >
        {/* Background & Effects Layer (Clipped) */}
        <div
          className={cn(
            "absolute inset-0 overflow-hidden transition-all duration-500 backdrop-blur-xl",
            isScrolled
              ? "rounded-xl md:rounded-2xl bg-white/80 dark:bg-zinc-900/80 shadow-2xl shadow-primary/10 border border-primary/20 dark:border-primary/20"
              : "rounded-none bg-transparent border-b border-transparent",
          )}
        >
          {/* Top highlight for premium feel */}
          <div className={cn(
            "absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent transition-opacity duration-500",
            isScrolled ? "opacity-100" : "opacity-0"
          )} />
        </div>

        <div className="relative z-10 flex justify-between items-center gap-2 md:gap-4">
          <Link
            href={`/${lang}`}
            className="group relative flex items-center gap-1.5 md:gap-2 shrink-0"
          >
            <span
              className={cn(
                "text-xl sm:text-2xl md:text-3xl font-black tracking-tighter transition-all duration-300",
                !isScrolled && "drop-shadow-sm", // Ensure readability on hero
              )}
            >
              <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-purple-400">
                GUESSALATOR
              </span>
            </span>
          </Link>

          <div className="flex gap-1 md:gap-4 items-center shrink-0">
            <Link
              href={`/${lang}/create`}
              className={cn(
                "group relative overflow-hidden rounded-xl md:rounded-2xl font-black text-xs md:text-sm transition-all duration-300",
                "bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95",
                "px-3 md:px-6 h-9 md:h-12 flex items-center gap-2",
              )}
            >
              <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-linear-to-r from-transparent via-white/40 to-transparent opacity-40 animate-shimmer" />
              </div>

              <div className="relative flex items-center gap-2">
                <Plus
                  size={16}
                  strokeWidth={4}
                  className="transition-transform group-hover:rotate-90 md:w-[18px] md:h-[18px]"
                />
                <span className="hidden md:inline">
                  {t(validLang, "createQuiz")}
                </span>
              </div>
            </Link>

            {/* Divider */}
            <div className="hidden md:block h-6 w-px bg-border/60 mx-1" />

            <div className="flex items-center gap-1 md:gap-2 pr-0 md:pr-1">
              <ThemeToggle />

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
