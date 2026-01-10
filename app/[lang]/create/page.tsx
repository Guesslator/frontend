"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { createUserContent } from '@/lib/api';
import { t, Language } from '@/lib/i18n';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import FileUploader from '@/components/FileUploader';
import QuizWizard from '@/components/quiz-wizard/QuizWizard';
import Navbar from '@/components/Navbar';

export default function CreateUserQuizPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const lang = (params.lang as Language) || 'en';

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">{t(lang, 'loginRequired')}</p>
          <Link
            href={`/${lang}/auth/login`}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition shadow-lg"
          >
            {t(lang, 'login')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 transition-colors duration-300">
      <Navbar lang={lang} />
      <div className="pt-24 px-4 md:p-8 flex justify-center">
        <div className="w-full">

          {/* @ts-ignore */}
          <QuizWizard lang={lang} accessToken={session.user?.id || ''} />
        </div>
      </div>
    </div>
  );
}
