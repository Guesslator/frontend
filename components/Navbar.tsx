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
        isScrolled ? "pt-2 px-2 md:px-4" : "pt-0 px-0",
      )}
    >
      <nav
        className={cn(
          "relative pointer-events-auto w-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isScrolled
            ? "max-w-[98%] md:max-w-7xl mx-auto rounded-full py-2 md:py-2.5 px-3 md:px-6 shadow-lg shadow-black/[0.03]"
            : "max-w-full rounded-none py-3 md:py-4 px-3 md:px-12 shadow-sm border-b border-white/5",
        )}
      >
        {/* Background & Effects Layer (Clipped) */}
        <div
          className={cn(
            "absolute inset-0 overflow-hidden transition-all duration-500 bg-background/95 backdrop-blur-xl dark:bg-card/90",
            isScrolled
              ? "rounded-full border border-border/40 dark:border-white/5"
              : "rounded-none border-b border-border/20 dark:border-white/5",
          )}
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-70" />
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />
        </div>

        <div className="relative z-10 flex justify-between items-center gap-2 md:gap-4">
          <Link
            href={`/${lang}`}
            className="group relative flex items-center gap-1.5 md:gap-2 shrink-0"
          >
            <span
              className={cn(
                "text-lg sm:text-xl md:text-3xl font-black tracking-tighter transition-all duration-300",
                !isScrolled && "drop-shadow-sm", // Ensure readability on hero
              )}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                GUESSALATOR
              </span>
            </span>
          </Link>

          <div className="flex gap-1 md:gap-4 items-center shrink-0">
            <Link
              href={`/${lang}/create`}
              className={cn(
                "group relative overflow-hidden rounded-full font-bold text-xs md:text-sm transition-all duration-300",
                "bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25",
                "px-2 md:px-4 h-8 md:h-10 flex items-center gap-1.5 md:gap-2",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Plus
                size={16}
                strokeWidth={3}
                className="transition-transform group-hover:rotate-90"
              />
              <span className="hidden md:inline">
                {t(validLang, "createQuiz")}
              </span>
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
