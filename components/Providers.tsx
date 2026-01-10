"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import * as React from "react";
import { initializeOtel } from "@/lib/otel";

export function Providers({ children }: { children: React.ReactNode }) {
    React.useEffect(() => {
        initializeOtel();
    }, []);

    return (
        <SessionProvider>
            <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
                {children}
                <Toaster richColors position="top-right" />
            </ThemeProvider>
        </SessionProvider>
    );
}
