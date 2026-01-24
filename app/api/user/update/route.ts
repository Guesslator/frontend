import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const backendUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://backend:3000';

        const res = await fetch(`${backendUrl}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.accessToken}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const error = await res.json();
            return NextResponse.json({ message: error.message || "Failed to update profile" }, { status: res.status });
        }

        const updatedUser = await res.json();
        return NextResponse.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }
}
