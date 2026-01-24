"use client";

import dynamic from "next/dynamic";

const RegisterClient = dynamic(
    () => import("./RegisterClient"),
    { ssr: false }
);

export default function RegisterClientWrapper({ lang }: { lang: string }) {
    return <RegisterClient lang={lang} />;
}
