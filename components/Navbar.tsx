"use client";

import Link from 'next/link';
import { t } from '@/lib/i18n';
import { ThemeToggle } from '@/components/ThemeToggle';
import UserMenu from '@/components/UserMenu';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface NavbarProps {
    lang: string;
}

export default function Navbar({ lang }: NavbarProps) {
    const validLang = (['tr', 'en', 'ar', 'de'].includes(lang) ? lang : 'en') as 'tr' | 'en' | 'ar' | 'de';

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 md:py-6 bg-background/90 backdrop-blur-md border-b border-border flex justify-between items-center transition-colors duration-300">
            <Link href={`/${lang}`} className="text-xl md:text-2xl font-black text-primary tracking-tighter hover:scale-105 transition-transform">
                GUESSALATOR
            </Link>
            <div className="flex gap-2 md:gap-4 items-center">
                <Link
                    href={`/${lang}/create`}
                    className="text-xs md:text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors px-3 md:px-4 py-2 rounded-full shadow-lg flex items-center gap-1"
                >
                    + <span className="hidden md:inline">{t(validLang, 'createQuiz')}</span>
                </Link>
                <ThemeToggle />
                <UserMenu lang={lang} />
                <LanguageSwitcher currentLang={lang} />
            </div>
        </nav>
    );
}
