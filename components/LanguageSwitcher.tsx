"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LanguageSwitcherProps {
  currentLang: string;
}

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

export default function LanguageSwitcher({
  currentLang,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchParams = useSearchParams();

  const handleLanguageChange = (newLang: string) => {
    if (newLang === currentLang) {
      setIsOpen(false);
      return;
    }

    // Replace the language segment in the path
    const pathSegments = pathname.split("/");
    if (pathSegments.length > 1) {
      pathSegments[1] = newLang;
    } else {
      pathSegments.push(newLang);
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete('contentLang'); // Clear content filter when switching UI language
    const newPath = `${pathSegments.join("/")}${params.toString() ? `?${params.toString()}` : ""}`;

    router.push(newPath, { scroll: false });
    setIsOpen(false);
  };

  const currentLanguage =
    LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        aria-label="Switch language"
        className="flex items-center justify-center gap-1.5 px-2 h-9 md:h-10 md:gap-2 md:px-3 rounded-full text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-all duration-200"
      >
        <Globe
          size={16}
          strokeWidth={1.5}
          className="md:w-[18px] md:h-[18px]"
        />
        <span className="text-sm font-medium hidden md:inline">
          {currentLanguage.label}
        </span>
        <span className="md:hidden font-bold text-xs">
          {currentLanguage.code.toUpperCase()}
        </span>
        <ChevronDown
          size={14}
          className={`opacity-50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 text-popover-foreground rounded-xl shadow-2xl border border-border z-50 overflow-hidden"
          >
            <div className="p-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${currentLang === lang.code
                    ? "bg-accent text-accent-foreground font-medium"
                    : "hover:bg-muted text-foreground"
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-md border border-current opacity-60 w-8 text-center uppercase">
                      {lang.code}
                    </span>
                    {lang.label}
                  </span>
                  {currentLang === lang.code && (
                    <Check size={14} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
