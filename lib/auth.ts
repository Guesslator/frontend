import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const backendUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://backend:3000';


                    const res = await fetch(`${backendUrl}/auth/login`, {
                        method: 'POST',
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password
                        }),
                        headers: { "Content-Type": "application/json" }
                    });
                    if (res.status === 401) return null;


                    const user = await res.json();

                    // If backend returns accessToken, we are good.
                    // The backend now returns { accessToken: '...', user: { id: '...', ... } }
                    // NextAuth expects us to return an object that will be persisted in the token.
                    if (res.ok && user && user.accessToken) {
                        return {
                            id: user.user.id,
                            email: user.user.email,
                            name: user.user.name,
                            role: user.user.role,
                            accessToken: user.accessToken // Pass this to the JWT callback
                        };
                    }
                    return null;
                } catch (e) {
                    console.error("Auth error:", e);
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: '/auth',
    },
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.accessToken = user.accessToken; // Persist the JWT from backend
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.accessToken = token.accessToken as string; // Expose JWT to frontend
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "keep-this-secret-in-prod"
};
