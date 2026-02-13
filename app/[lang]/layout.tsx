import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default async function Layout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar lang={lang} />
            <main className="flex-1 w-full">
                {children}
            </main>
            <Footer lang={lang} />
        </div>
    );
}
