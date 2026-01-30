import { authOptions } from "./auth";
import { getServerSession } from "next-auth";

// Recreate API_URL logic or import if possible. Let's use env var directly.
const getApiUrl = () => {
    if (typeof window === 'undefined') {
        return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';
};

const API_URL = getApiUrl();

async function getAuthHeader() {
    if (typeof window === 'undefined') {
        // Server side: get session
        const session = await getServerSession(authOptions);
        return { Authorization: `Bearer ${session?.accessToken || ''}` };
    } else {
        // Client side: we need to pass token or use session hook in component
        // Typically simpler to pass token from component
        return {};
    }
}

export async function adminFetch(endpoint: string, options: RequestInit = {}, token?: string) {
    const headers: any = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}/admin${endpoint}`, {
        ...options,
        headers
    });

    if (!res.ok) {
        throw new Error(`Admin API Error: ${res.status} ${res.statusText}`);
    }

    return res.json();
}

// Stats
export async function getDashboardStats(range: string, token: string) {
    return adminFetch(`/stats?range=${range}`, {}, token);
}

// Helper to clean query params
function cleanQuery(query: any) {
    const params = new URLSearchParams();
    Object.keys(query).forEach(key => {
        if (query[key] !== undefined && query[key] !== null && query[key] !== '') {
            params.append(key, query[key]);
        }
    });
    return params.toString();
}

// Users
export async function getUsers(query: any, token: string) {
    const q = cleanQuery(query);
    return adminFetch(`/users?${q}`, {}, token);
}

// Quizzes
export async function getQuizzes(query: any, token: string) {
    const q = cleanQuery(query);
    return adminFetch(`/quizzes?${q}`, {}, token);
}

export async function deleteQuiz(id: string, token: string) {
    return adminFetch(`/quizzes/${id}`, {
        method: 'DELETE'
    }, token);
}

// Reports
export async function getReports(query: any, token: string) {
    const q = cleanQuery(query);
    return adminFetch(`/reports?${q}`, {}, token);
}

// Audits
export async function getAuditLogs(query: any, token: string) {
    const q = cleanQuery(query);
    return adminFetch(`/audits?${q}`, {}, token);
}

// System
export async function getSystemHealth(token: string) {
    return adminFetch(`/health`, {}, token);
}

// Flags
export async function getFlags(token: string) {
    return adminFetch(`/flags`, {}, token);
}

export async function setFlag(key: string, value: boolean, token: string) {
    return adminFetch(`/flags`, {
        method: 'POST',
        body: JSON.stringify({ key, value })
    }, token);
}

// User Actions
export async function banUser(userId: string, isBanned: boolean, token: string) {
    return adminFetch(`/users/${userId}/ban`, {
        method: 'PATCH',
        body: JSON.stringify({ isBanned })
    }, token);
}

// Quiz Actions
export async function togglePublishQuiz(quizId: string, isPublished: boolean, token: string) {
    return adminFetch(`/quizzes/${quizId}/publish`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublished })
    }, token);
}

// Analytics (Raw)
export async function getAnalyticsData(path: string, token: string) {
    // Note: Analytics controller is separate from Admin module usually, but accessible.
    // Assuming backend exposes analytics at /analytics not /admin/analytics
    // We'll skip adminFetch helper to point properly.
    const headers: any = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // Use public analytics URL or authenticated one
    const res = await fetch(`${API_URL}/analytics/${path}`, { headers });
    if (!res.ok) throw new Error('Analytics fetch failed');
    return res.json();
}
