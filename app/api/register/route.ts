import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        console.log("REGISTER API HIT");

        const body = await req.json();
        console.log("BODY:", body);

        // PRIORITY: Env > Fallback
        const backendUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://backend:3000';
        console.log("API_URL used:", backendUrl);

        if (!backendUrl) {
            throw new Error("API_URL is undefined");
        }

        const res = await fetch(`${backendUrl}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        console.log("BACKEND STATUS:", res.status);

        const text = await res.text();
        console.log("BACKEND RAW RESPONSE:", text);

        return new Response(text, { status: res.status });
    } catch (err) {
        console.error("REGISTER ROUTE ERROR:", err);
        return new Response(
            JSON.stringify({ error: "Internal API error" }),
            { status: 500 }
        );
    }
}

