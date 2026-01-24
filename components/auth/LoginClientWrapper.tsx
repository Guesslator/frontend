"use client";

import dynamic from "next/dynamic";

const LoginClient = dynamic(
    () => import("./LoginClient"),
    { ssr: false }
);

export default function LoginClientWrapper({ lang }: { lang: string }) {
    return <LoginClient lang={lang} />;
}
