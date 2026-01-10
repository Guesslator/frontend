import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, name } = body;

        if (!email || !password) {
            return NextResponse.json({ message: "Missing fields" }, { status: 400 });
        }

        // Proxy to Backend Service
        // Use 'http://backend:3000' for Docker internal network, or fallback to env var
        const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://backend:3000';

        const res = await fetch(`${backendUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ message: data.message || "Registration failed" }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
