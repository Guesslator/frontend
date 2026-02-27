import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

import { Language } from "@/lib/i18n";
import QuizWizardWrapper from "@/components/quiz-wizard/QuizWizardWrapper";

export default async function CreateUserQuizPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (
    ["tr", "en", "ar", "de"].includes(rawLang) ? rawLang : "en"
  ) as Language;

  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session as any).accessToken) {
    redirect(`/${lang}/auth/login`);
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden transition-colors duration-1000 pb-20">
      {/* Premium Studio Background */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(var(--primary-rgb),0.1)_0%,rgba(0,0,0,0)_60%)] animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/80 to-background" />
      </div>

      <div className="relative z-10 pt-32 px-4 md:p-8 flex justify-center max-w-7xl mx-auto">
        <div className="w-full mt-10 md:mt-24">
          {/* @ts-ignore */}
          <QuizWizardWrapper
            lang={lang}
            accessToken={(session as any).accessToken}
          />
        </div>
      </div>
    </div>
  );
}
