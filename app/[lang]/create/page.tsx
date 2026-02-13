import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

import { Language } from "@/lib/i18n";
import QuizWizardWrapper from "@/components/quiz-wizard/QuizWizardWrapper";

export default async function CreateUserQuizPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (['tr', 'en', 'ar', 'de'].includes(rawLang) ? rawLang : 'en') as Language;

  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session as any).accessToken) {
    redirect(`/${lang}/auth/login`);
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 transition-colors duration-300">

      <div className="pt-24 px-4 md:p-8 flex justify-center">
        <div className="w-full">
          {/* @ts-ignore */}
          <QuizWizardWrapper lang={lang} accessToken={(session as any).accessToken} />
        </div>
      </div>
    </div>
  );
}
