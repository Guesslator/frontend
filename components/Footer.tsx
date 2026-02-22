"use client";

import Link from "next/link";
import { Github, Twitter, Instagram, Heart, Globe, Mail } from "lucide-react";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface FooterProps {
  lang?: string;
}

export default function Footer({ lang = "en" }: FooterProps) {
  const validLang = (["tr", "en", "ar", "de"].includes(lang) ? lang : "en") as
    | "tr"
    | "en"
    | "ar"
    | "de";

  return (
    <footer className="relative bg-zinc-50 dark:bg-zinc-950 text-foreground mt-32 border-t border-zinc-200 dark:border-white/5 overflow-hidden">
      {/* Cinematic Top Glow & Grid Texture */}
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-16 md:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-6">
            <Link
              href={`/${lang}`}
              className="inline-block text-3xl font-black tracking-tighter hover:opacity-80 transition-opacity"
            >
              <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-indigo-400 dark:to-indigo-300">
                GUESSALATOR
              </span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              {t(validLang, "footerDesc")}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4 pt-4">
              {[
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Github, href: "#", label: "GitHub" },
                { icon: Instagram, href: "#", label: "Instagram" },
              ].map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-secondary/50 border border-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all duration-300 group"
                >
                  <social.icon
                    size={18}
                    className="group-hover:scale-110 transition-transform"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
            <div className="space-y-6">
              <h4 className="font-bold text-foreground tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {t(validLang, "platform")}
              </h4>
              <ul className="space-y-3">
                {[
                  { href: `/${lang}`, label: "all" },
                  { href: `/${lang}/create`, label: "createQuiz" },
                  { href: `/${lang}/leaderboard`, label: "leaderboard" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group text-sm"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-primary transition-all duration-300" />
                      {t(validLang, link.label as any)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold text-foreground tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {t(validLang, "support")}
              </h4>
              <ul className="space-y-3">
                {["faq", "contact", "tos"].map((item) => (
                  <li
                    key={item}
                    className="flex items-center justify-between group cursor-not-allowed"
                  >
                    <span className="text-muted-foreground/60 text-sm group-hover:text-muted-foreground transition-colors flex items-center gap-2">
                      {t(validLang, item as any)}
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-primary/40 bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                      Soon
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter / Contact (Placeholder for now) */}
            <div className="space-y-6">
              <h4 className="font-bold text-foreground tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Get in Touch
              </h4>
              <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-3 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground">
                  Questions? Feedback? We'd love to hear from you.
                </p>
                <Link
                  href="mailto:info@bytenflow.com"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Mail size={14} />
                  info@bytenflow.com
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
          <p className="font-medium">
            &copy; {new Date().getFullYear()} Guessalator.{" "}
            <span className="opacity-60 font-normal">
              {t(validLang, "allRightsReserved")}
            </span>
          </p>

          <div className="flex items-center gap-6">
            <p className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-full border border-white/5 text-xs">
              Made with{" "}
              <Heart
                size={10}
                className="text-red-500 fill-red-500 animate-pulse"
              />{" "}
              Guessalator
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
