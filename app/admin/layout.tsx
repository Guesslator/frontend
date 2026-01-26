import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    // console.log(`[AdminLayout] Visiting: /admin`);
    // console.log(`[AdminLayout] Session:`, JSON.stringify(session, null, 2));

    if (!session || !session.user) {
        // console.log("[AdminLayout] No session found, redirecting to /");
        redirect("/");
    }

    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
    // console.log("[AdminLayout] User role is", session.user.role);

    if (!isAdmin) {
        // console.log("[AdminLayout] Insufficient permissions, redirecting to /admin/unauthorized");
        redirect("/admin/unauthorized");
    }

    return (
        <div className="flex min-h-screen bg-neutral-950 text-neutral-100">
            <AdminSidebar role={session.user.role} />
            <main className="flex-1 p-8 overflow-auto">
                {children}
            </main>
        </div>
    );
}
