import LoginClientWrapper from "../../../../components/auth/LoginClientWrapper";

export default async function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    return <LoginClientWrapper lang={lang} />;
}
