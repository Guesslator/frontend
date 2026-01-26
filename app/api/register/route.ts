import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {


        const body = await req.json();

        // PRIORITY: Env > Fallback
        const backendUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://backend:3000';

        if (!backendUrl) {
            throw new Error("API_URL is undefined");
        }

        const res = await fetch(`${backendUrl}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });



        const text = await res.text();

        return new Response(text, { status: res.status });
    } catch (err) {
        console.error("REGISTER ROUTE ERROR:", err);
        return new Response(
            JSON.stringify({ error: "Internal API error" }),
            { status: 500 }
        );
    }
}

