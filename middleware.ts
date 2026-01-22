import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { LANGUAGES } from '@/lib/i18n';

function getLocale(request: NextRequest): string {
    const negotiatorHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

    // @ts-ignore locales are readonly
    const locales: string[] = LANGUAGES;
    const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

    try {
        return match(languages, locales, 'en');
    } catch (e) {
        return 'en';
    }
}

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    console.log(`[Middleware] Processing: ${pathname}`);

    // Skip static assets and API
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/admin') || // Exclude admin panel from i18n
        pathname.includes('.') // images, etc.
    ) {
        return;
    }

    // FIX: Redirect /en/admin -> /admin (Handling browser cache or manual entry)
    const localeArg = LANGUAGES.join('|');
    const localeAdminRegex = new RegExp(`^/(${localeArg})/admin`);
    if (localeAdminRegex.test(pathname)) {
        const cleanPath = pathname.replace(localeAdminRegex, '/admin');
        console.log(`[Middleware] Redirecting localized admin path to: ${cleanPath}`);
        return NextResponse.redirect(new URL(cleanPath, request.url));
    }

    // Check if pathname starts with a locale
    const pathnameHasLocale = LANGUAGES.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) return;

    // Redirect if no locale
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;

    // Preserve query params
    return NextResponse.redirect(request.nextUrl);
}

export const config = {
    matcher: [
        // Skip all internal paths (_next)
        '/((?!_next|favicon.ico|api).*)',
    ],
};
