"use client";

import dynamic from "next/dynamic";
import { Language } from "@/lib/i18n";

// DYNAMIC IMPORT - STRATEGY: CLIENT ISLAND
const QuizWizard = dynamic(() => import("@/components/quiz-wizard/QuizWizard"), {
    ssr: false,
    loading: () => (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
    )
});

interface QuizWizardWrapperProps {
    lang: Language;
    accessToken: string;
}

export default function QuizWizardWrapper({ lang, accessToken }: QuizWizardWrapperProps) {
    return <QuizWizard lang={lang} accessToken={accessToken} />;
}
