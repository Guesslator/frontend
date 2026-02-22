"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import * as React from "react";
import { initializeOtel } from "@/lib/otel";
import { LazyMotion, domMax } from "framer-motion";

export function Providers({ children }: { children: React.ReactNode }) {
    React.useEffect(() => {
        // Defer telemetry initialization to avoid blocking hydration/main thread
        if (typeof window !== 'undefined') {
            const runner = () => initializeOtel();
            if ('requestIdleCallback' in window) {
                (window as any).requestIdleCallback(runner);
            } else {
                setTimeout(runner, 2000);
            }
        }
    }, []);

    return (
        <SessionProvider>
            <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
                <LazyMotion features={domMax}>
                    {children}
                </LazyMotion>
                <Toaster richColors position="top-right" />
            </ThemeProvider>
        </SessionProvider>
    );
}
