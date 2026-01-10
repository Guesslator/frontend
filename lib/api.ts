import { ContentItem, Quiz } from './mockData';

// In Docker: server-side uses internal network, client-side uses localhost
const getApiUrl = () => {
    // Check if we're running on the server (Node.js) or client (browser)
    if (typeof window === 'undefined') {
        // Server-side: use internal Docker network or fallback
        return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';
    }
    // Client-side: use public URL
    return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';
};

const API_URL = getApiUrl();

function transformTranslations(items: any[]) {
    const map: any = {};
    items.forEach(item => {
        map[item.language] = {
            title: item.title,
            description: item.description,
            text: item.text
        };
    });
    return map;
}

export interface APIContentItem {
    id: string;
    type: 'MOVIE' | 'SERIES' | 'GAME' | 'SPORTS';
    posterUrl: string;
    translations: any;
    levels: { id: string; level: number }[];
    creatorType?: 'ADMIN' | 'USER';
    creator?: { id: string; name: string; email: string };
    subcategory?: 'FOOTBALL' | 'BASKETBALL' | 'MMA';
    quizType?: 'TEXT' | 'VIDEO' | 'IMAGE';
    questions?: any[]; // For backwards compat or direct access
    stats?: {
        totalAttempts: number;
        avgScore: number;
        passRate: number;
    };
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ContentFilters {
    lang?: string;
    type?: 'MOVIE' | 'SERIES' | 'GAME' | 'SPORTS';
    creatorType?: 'ADMIN' | 'USER';
    subcategory?: 'FOOTBALL' | 'BASKETBALL' | 'MMA';
    quizType?: 'TEXT' | 'VIDEO' | 'IMAGE';
    search?: string;
    sortBy?: 'recent' | 'popular';
    creatorId?: string;
    page?: number;
    limit?: number;
}

export async function fetchContent(lang: string = 'en'): Promise<APIContentItem[]> {
    try {
        const res = await fetch(`${API_URL}/content?lang=${lang}`, { cache: 'no-store' });
        if (!res.ok) return []; // Return empty if backend is down or empty
        const data = await res.json();

        // Handle both old format (array) and new format (object with items)
        const items = Array.isArray(data) ? data : data.items || [];

        return items.map((item: any) => ({
            id: item.id,
            type: item.type,
            posterUrl: item.posterUrl,
            translations: transformTranslations(item.translations),
            levels: [],
            creatorType: item.creatorType,
            creator: item.creator,
            subcategory: item.subcategory
        }));
    } catch (e) {
        console.error("Fetch content failed", e);
        return [];
    }
}

export async function fetchContentPaginated(
    filters: ContentFilters
): Promise<PaginatedResponse<APIContentItem>> {
    try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (key === 'creatorId') {
                params.append('created_by', String(value));
            } else if (value !== undefined) {
                params.append(key, String(value));
            }
        });

        const res = await fetch(`${API_URL}/content?${params}`, { cache: 'no-store' });
        if (!res.ok) {
            return {
                items: [],
                pagination: { total: 0, page: 1, limit: 15, totalPages: 0 }
            };
        }

        const data = await res.json();

        return {
            items: data.items.map((item: any) => ({
                id: item.id,
                type: item.type,
                posterUrl: item.posterUrl,
                translations: transformTranslations(item.translations),
                levels: [],
                creatorType: item.creatorType,
                creator: item.creator,
                subcategory: item.subcategory,
                quizType: item.quizType
            })),
            pagination: data.pagination
        };
    } catch (e) {
        console.error("Fetch paginated content failed", e);
        return {
            items: [],
            pagination: { total: 0, page: 1, limit: 15, totalPages: 0 }
        };
    }
}

export async function fetchContentDetail(id: string, lang: string = 'en'): Promise<APIContentItem | null> {
    try {
        const res = await fetch(`${API_URL}/content/${id}?lang=${lang}`, { cache: 'no-store' });
        if (!res.ok) return null;
        const item = await res.json();

        // Determine quiz type from first question if available
        const rawQuestions = (item as any).questions;
        if (rawQuestions) {
            console.log('API: fetchContentDetail raw questions sample:', JSON.stringify(rawQuestions.slice(0, 1), null, 2));
        }

        const firstQuestion = rawQuestions?.[0] || item.levels?.[0]?.questions?.[0];
        const quizType = firstQuestion?.type || 'TEXT';

        return {
            id: item.id,
            type: item.type,
            posterUrl: item.posterUrl,
            translations: transformTranslations(item.translations),
            questions: (item as any).questions?.map((q: any) => ({
                id: q.id,
                type: q.type,
                videoUrl: q.videoUrl,
                startTime: q.startTime,
                stopTime: q.stopTime,
                endTime: q.endTime,
                imageUrl: q.imageUrl,
                translations: transformTranslations(q.translations || []),
                options: q.options?.map((o: any) => ({
                    id: o.id,
                    isCorrect: o.isCorrect,
                    translations: transformTranslations(o.translations || [])
                })) || [],
                attempts: q.attempts || 0,
                correctCount: q.correctCount || 0
            })) || [],
            levels: [], // Legacy compat or remove if possible
            creatorType: item.creatorType,
            creator: item.creator,
            subcategory: item.subcategory,
            quizType: quizType,
            stats: (item as any).stats
        };
    } catch (e) {
        console.error("Fetch content detail failed", e);
        return null;
    }
}

export async function fetchQuizLevel(contentId: string, level: number, lang: string = 'en'): Promise<Quiz | null> {
    try {
        const res = await fetch(`${API_URL}/quiz/${contentId}/${level}?lang=${lang}`, { cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();

        return {
            id: data.id,
            contentId: contentId,
            questions: data.questions.map((q: any) => ({
                id: q.id,
                type: q.type,
                videoUrl: q.videoUrl,
                startTime: q.startTime,
                stopTime: q.stopTime,
                endTime: q.endTime,
                imageUrl: q.imageUrl,
                translations: transformTranslations(q.translations),
                options: q.options.map((o: any) => ({
                    id: o.id,
                    isCorrect: o.isCorrect,
                    translations: transformTranslations(o.translations)
                }))
            }))
        };
    } catch (e) {
        console.error("Fetch quiz failed", e);
        return null;
    }
}

export async function fetchQuizById(id: string, lang: string = 'en'): Promise<Quiz | null> {
    try {
        const url = `${API_URL}/quiz/${id}?lang=${lang}`;
        console.log(`API: fetchQuizById calling ${url}`);
        const res = await fetch(url, { cache: 'no-store' });

        console.log(`API: fetchQuizById response status: ${res.status}`);

        if (!res.ok) {
            console.error(`API: fetchQuizById failed with status ${res.status} for ID ${id}`);
            const text = await res.text();
            console.error(`API: Error body: ${text}`);
            return null;
        }
        const data = await res.json();

        return {
            id: data.id,
            contentId: data.id, // Content IS the quiz container now
            questions: (data.questions || []).map((q: any) => ({
                id: q.id,
                type: q.type,
                videoUrl: q.videoUrl,
                startTime: q.startTime,
                stopTime: q.stopTime,
                endTime: q.endTime,
                imageUrl: q.imageUrl,
                translations: transformTranslations(q.translations),
                options: q.options.map((o: any) => ({
                    id: o.id,
                    isCorrect: o.isCorrect,
                    translations: transformTranslations(o.translations)
                }))
            }))
        };
    } catch (e) {
        console.error("Fetch quiz failed", e);
        return null;
    }
}

// --- Admin API ---

export interface CreateContentDto {
    type: 'MOVIE' | 'SERIES' | 'GAME' | 'SPORTS';
    subcategory?: 'FOOTBALL' | 'BASKETBALL' | 'MMA';
    posterUrl: string;
    isPublished: boolean;
    translations: {
        language: string;
        title: string;
        description: string;
    }[];
}

export async function createContent(data: CreateContentDto) {
    const res = await fetch(`${API_URL}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create content');
    return res.json();
}

export async function updateQuestions(data: AddQuestionsDto) {
    const res = await fetch(`${API_URL}/quiz/questions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update questions');
    }
    return res.json();
}

export interface AddQuestionsDto {
    contentId: string;
    questions: {
        type: 'VIDEO' | 'TEXT' | 'IMAGE';
        videoUrl?: string;
        startTime?: number;
        stopTime?: number;
        endTime?: number;
        imageUrl?: string;
        translations: { language: string; text: string }[];
        options: {
            isCorrect: boolean;
            translations: { language: string; text: string }[];
        }[];
    }[];
}

export async function addQuestions(data: AddQuestionsDto) {
    const res = await fetch(`${API_URL}/quiz/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to add questions');
    }
    return res.json();
}

// --- Score API ---

export interface ScoreDto {
    id: string;
    guestName: string;
    score: number;
    createdAt: string;
}

export async function submitScore(data: { guestName: string; contentId: string; score: number }) {
    const res = await fetch(`${API_URL}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const text = await res.text();
        console.error('Failed to submit score:', res.status, text);
        throw new Error(`Failed to submit score: ${res.status}`);
    }
    return res.json();
}

export async function getTopScores(contentId: string): Promise<ScoreDto[]> {
    const res = await fetch(`${API_URL}/score/top/${contentId}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
}

export async function getPercentile(contentId: string, score: number): Promise<number> {
    const res = await fetch(`${API_URL}/score/percentile/${contentId}/${score}`, { cache: 'no-store' });
    if (!res.ok) return 0;
    return res.json();
}

// --- User Content API ---

export async function createUserContent(token: string, data: CreateContentDto) {
    const res = await fetch(`${API_URL}/content/user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create user content');
    return res.json();
}

export async function deleteUserContent(token: string, contentId: string) {
    const res = await fetch(`${API_URL}/content/${contentId}/user`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });
    if (!res.ok) throw new Error('Failed to delete content');
    return res.json();
}

export async function incrementContentPopularity(contentId: string) {
    const res = await fetch(`${API_URL}/content/${contentId}/view`, {
        method: 'POST',
    });
    if (!res.ok) console.error('Failed to increment popularity');
    return res.json();
}

export const fetchUsers = async (token: string) => {
    const res = await fetch(`${API_URL}/users`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
};
// --- Stats API ---
export async function registerQuestionAttempt(questionId: string, isCorrect: boolean) {
    try {
        await fetch(`${API_URL}/quiz/attempt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionId, isCorrect }),
        });
    } catch (e) {
        console.error("Failed to register attempt", e);
    }
}
