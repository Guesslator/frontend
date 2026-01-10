"use client";

import { usePathname, useRouter } from "next/navigation";
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

export default function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLanguageChange = (newLang: string) => {
        if (newLang === currentLang) {
            setIsOpen(false);
            return;
        }

        // Replace the language segment in the path
        const pathSegments = pathname.split("/");
        // pathSegments[0] is empty string because path starts with /
        // pathSegments[1] is the language code
        if (pathSegments.length > 1) {
            pathSegments[1] = newLang;
        } else {
            // Fallback for root path if something Weird happens
            pathSegments.push(newLang);
        }

        const newPath = pathSegments.join("/");
        router.push(newPath);
        setIsOpen(false);
    };

    const currentLanguage = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-input bg-card/50 hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            >
                <Globe size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium hidden md:inline">{currentLanguage.label}</span>
                <span className="md:hidden">{currentLanguage.code.toUpperCase()}</span>
                <ChevronDown
                    size={14}
                    className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-popover text-popover-foreground rounded-xl shadow-xl border border-border z-50 overflow-hidden"
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
                                        <span className="text-lg">{lang.flag}</span>
                                        {lang.label}
                                    </span>
                                    {currentLang === lang.code && <Check size={14} className="text-primary" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
