import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFlags } from "@/lib/adminApi";
import FlagsTable from "./FlagsTable";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken || '';

    let flags;
    try {
        flags = await getFlags(token);
    } catch (e) {
        flags = [];
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Parameters & Settings</h1>
                <p className="text-neutral-500">Manage global system configurations and feature flags.</p>
            </div>

            <FlagsTable initialFlags={flags} token={token} />
        </div>
    );
}
