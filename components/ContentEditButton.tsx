"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Edit } from "lucide-react";
import { t } from "@/lib/i18n";

export default function ContentEditButton({
  creatorId,
  contentId,
  lang,
}: {
  creatorId?: string;
  contentId: string;
  lang: "tr" | "en" | "ar" | "de";
}) {
  const { data: session } = useSession();

  const isCreator =
    session?.user?.id === creatorId ||
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "SUPER_ADMIN";

  if (!isCreator) return null;

  return (
    <>
      <span className="w-1 h-1 rounded-full bg-foreground/10 dark:bg-white/10" />
      <Link
        href={`/${lang}/quiz/${contentId}/edit`}
        className="text-primary/80 hover:text-primary flex items-center gap-1.5 font-bold transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
        aria-label={t(lang, "editLabel")}
      >
        <Edit size={16} /> {t(lang, "editLabel")}
      </Link>
    </>
  );
}
