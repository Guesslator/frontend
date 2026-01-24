import RegisterClientWrapper from "../../../../components/auth/RegisterClientWrapper";

export default async function RegisterPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    return <RegisterClientWrapper lang={lang} />;
}
