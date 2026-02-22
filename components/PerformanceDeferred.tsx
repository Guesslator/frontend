"use client";

import dynamic from "next/dynamic";
import { Language } from "@/lib/i18n";

const Pagination = dynamic(() => import("./Pagination"), { ssr: false });
const ScrollToTop = dynamic(() => import("./ScrollToTop"), { ssr: false });

interface PerformanceDeferredProps {
    lang: Language;
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    preserveParams?: Record<string, string | undefined>;
}

export default function PerformanceDeferred({
    lang,
    currentPage,
    totalPages,
    baseUrl,
    preserveParams,
}: PerformanceDeferredProps) {
    return (
        <>
            <Pagination
                lang={lang}
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl={baseUrl}
                preserveParams={preserveParams}
            />
            <ScrollToTop />
        </>
    );
}
