import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DebugSessionPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="p-8 bg-black text-white font-mono whitespace-pre-wrap">
            <h1 className="text-2xl font-bold mb-4">Debug Session</h1>
            <div className="border border-neutral-700 p-4 rounded bg-neutral-900">
                {JSON.stringify(session, null, 2)}
            </div>
            {!session && <p className="text-red-500 mt-4">No session found. Please log in.</p>}
        </div>
    );
}
