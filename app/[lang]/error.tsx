"use client";

import { useEffect } from "react";
import { t, Language } from "@/lib/i18n";

export default function Error({
  error,
  reset,
  params: { lang },
}: {
  error: Error & { digest?: string };
  reset: () => void;
  params: { lang: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const validLang = (
    ["tr", "en", "ar", "de"].includes(lang) ? lang : "en"
  ) as Language;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <h2 className="text-2xl font-bold">
        {t(validLang, "somethingWentWrong")}
      </h2>
      <p className="text-muted-foreground max-w-md">
        {error.message ||
          "An unexpected error occurred while loading the content."}
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
      >
        {t(validLang, "tryAgain")}
      </button>
    </div>
  );
}
