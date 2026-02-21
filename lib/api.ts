import { ContentItem, Quiz } from './mockData';
import { z } from 'zod';
import { ContentItemSchema, QuizSchema } from './schemas';

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

function transformTranslations(items: any) {
    const map: any = {};
    if (!items) return map;

    const langMapper: Record<string, string> = {
        'turkish': 'tr', 'turkce': 'tr', 'türkçe': 'tr',
        'english': 'en', 'ingilizce': 'en',
        'arabic': 'ar', 'arapça': 'ar',
        'german': 'de', 'almanca': 'de'
    };

    // Helper to extract data from an item
    const extract = (obj: any) => ({
        title: obj.title || obj.name || obj.label || obj.displayName || obj.text || '',
        description: obj.description || obj.desc || obj.summary || '',
        text: obj.text || obj.message || ''
    });

    // Handle Object format (e.g., { 'en': { title: '...' } })
    if (typeof items === 'object' && !Array.isArray(items)) {
        Object.entries(items).forEach(([key, value]) => {
            const lowerKey = key.toLowerCase();
            const finalKey = langMapper[lowerKey] || lowerKey;
            map[finalKey] = extract(value);
        });
        return map;
    }

    // Handle Array format (e.g., [{ language: 'tr', title: '...' }])
    if (Array.isArray(items)) {
        items.forEach(item => {
            if (!item) return;
            const langKey = item.language || item.lang || item.code || item.locale;
            if (langKey) {
                const lowerKey = langKey.toLowerCase();
                const finalKey = langMapper[lowerKey] || lowerKey;
                map[finalKey] = extract(item);
            }
        });
    }
    return map;
}

export interface APIContentItem {
    id: string;
    slug?: string;
    type: 'MOVIE' | 'SERIES' | 'GAME' | 'SPORTS';
    posterUrl: string;
    translations: any;
    levels: { id: string; level: number }[];
    creatorType?: 'ADMIN' | 'USER';
    creator?: { id: string; name: string; email: string };
    subcategory?: 'FOOTBALL' | 'BASKETBALL' | 'MMA';
    quizType?: 'TEXT' | 'VIDEO' | 'IMAGE' | 'AUDIO';
    isPublished?: boolean;
    questions?: any[]; // For backwards compat or direct access
    questionCount?: number;
    language?: string;
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
    contentLang?: string;
}

export interface FetchOptions {
    cache?: RequestCache;
    revalidate?: number;
}

export async function fetchContent(lang: string = 'en'): Promise<APIContentItem[]> {
    try {
        const res = await fetch(`${API_URL}/content?lang=${lang}`, { cache: 'no-store' });
        if (!res.ok) return []; // Return empty if backend is down or empty
        const data = await res.json();

        // Handle both old format (array) and new format (object with items)
        const items = Array.isArray(data) ? data : data.items || [];

        const mappedItems = items.map((item: any) => ({
            id: item.id,
            slug: item.slug,
            type: item.type,
            posterUrl: item.posterUrl,
            translations: transformTranslations(item.translations),
            levels: [],
            creatorType: item.creatorType,
            creator: item.creator,
            subcategory: item.subcategory,
            isPublished: item.isPublished,
            questionCount: item.questions?.length || 0
        }));

        // Zod Validation
        const validatedItems = mappedItems.map((item: any) => {
            const result = ContentItemSchema.safeParse(item);
            if (!result.success) {
                console.error("ContentItem Validation Failed", result.error, item);
                return null;
            }
            return result.data;
        }).filter((item: any) => item !== null);

        return validatedItems as APIContentItem[];
    } catch (e) {
        console.error("Fetch content failed", e);
        return [];
    }
}

export async function fetchContentPaginated(
    filters: ContentFilters,
    options?: FetchOptions
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

        const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
            cache: options?.cache ?? 'no-store'
        };

        if (options?.revalidate !== undefined) {
            fetchOptions.next = { revalidate: options.revalidate };
        }

        const res = await fetch(`${API_URL}/content?${params}`, fetchOptions);
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
                slug: item.slug,
                type: item.type,
                posterUrl: item.posterUrl,
                translations: transformTranslations(item.translations),
                levels: [],
                creatorType: item.creatorType,
                creator: item.creator,
                subcategory: item.subcategory,
                quizType: item.quizType,
                language: item.language || item.lang || item.original_language,
                stats: item.stats,
                questionCount: item.questions?.length || 0
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
        // [SENIOR FIX] Do NOT pass ?lang= to ensure we get ALL translations. 
        // The remote backend filters out other translations if ?lang= is present.
        const res = await fetch(`${API_URL}/content/${id}`, {
            cache: 'no-store' // Temporary no-store to ensure the user sees the fix
        });
        if (!res.ok) return null;
        const item = await res.json();

        // Determine quiz type from first question if available
        const rawQuestions = (item as any).questions;
        /*
        if (rawQuestions) {

        }
        */

        const firstQuestion = rawQuestions?.[0] || item.levels?.[0]?.questions?.[0];
        const quizType = firstQuestion?.type || 'TEXT';

        return {
            id: item.id,
            slug: item.slug,
            type: item.type,
            posterUrl: item.posterUrl,
            translations: transformTranslations(item.translations),
            questions: (Array.isArray((item as any).questions) ? (item as any).questions : []).filter((q: any) => !!q).map((q: any) => ({
                id: q?.id,
                type: q?.type || 'TEXT',
                videoUrl: q?.videoUrl || '',
                startTime: q?.startTime || 0,
                stopTime: q?.stopTime || 0,
                endTime: q?.endTime || 0,
                imageUrl: q?.imageUrl || '',
                translations: transformTranslations(q?.translations || []),
                options: (Array.isArray(q?.options) ? q.options : []).map((o: any) => ({
                    id: o?.id,
                    isCorrect: !!o?.isCorrect,
                    translations: transformTranslations(o?.translations || [])
                })),
                attempts: q?.attempts || 0,
                correctCount: q?.correctCount || 0
            })),
            levels: [], // Legacy compat or remove if possible
            creatorType: item.creatorType,
            creator: item.creator,
            subcategory: item.subcategory,
            quizType: quizType,
            language: item.language || item.lang || item.original_language,
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
            slug: data.slug,
            title: 'Level Quiz', // Placeholder as Levels might not have own titles? Or fetch them.
            description: null,
            created_by: '', // Legacy levels might not track this, or need new query. Punting with empty string to satisfy contract.
            videos: [],
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
        // Fetching quiz URL
        const res = await fetch(url, { cache: 'no-store' });

        if (!res.ok) {
            console.warn(`API: fetchQuizById failed with status ${res.status} for ID ${id}`);
            const text = await res.text();
            console.warn(`API: Error body: ${text}`);
            return null;
        }
        const data = await res.json();

        // [CONTRACT] Backend now returns translations as Record<lang, ...>
        // No transformation needed here if backend contract is met.
        const validTranslations = data.translations || {};
        const localeData = validTranslations[lang] || validTranslations['en'] || {};
        const title = localeData.title || localeData.name || '';

        // [CONTRACT ASSERTION]
        if (!title) {
            console.error(`[PublicQuiz Contract Violation] Quiz ${data.id} returned without a title/name!`, { contentId: data.id, slug: data.slug });
        }

        const quizObj = {
            id: data.id,
            slug: data.slug,
            posterUrl: data.posterUrl,
            title: title || 'Untitled Quiz', // [CONTRACT] Guaranteed Title
            description: localeData.description || null, // [CONTRACT] Guaranteed Description or null
            created_by: data.contentId, // [CONTRACT] ID is sufficient
            videos: [],
            contentId: data.contentId,
            // [CONTRACT] Backend guarantees 'questions' is a valid array of PublicQuestion objects
            questions: data.questions || []
        };

        const result = QuizSchema.safeParse(quizObj);
        if (!result.success) {
            console.error("Quiz Validation Failed", result.error, quizObj);
            return null;
        }

        return result.data as Quiz;
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

export async function updateQuestions(token: string, data: AddQuestionsDto) {
    const res = await fetch(`${API_URL}/quiz/questions`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
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
// --- Analytics API ---
export async function trackEvent(eventType: string, data: { userId?: string, quizId?: string, metadata?: any }) {
    try {
        await fetch(`${API_URL}/analytics/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventType, ...data }),
        });
    } catch (e) {
        console.error("Failed to track event", e);
    }
}

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

export async function updateContentStatus(id: string, isPublished: boolean) {
    const res = await fetch(`${API_URL}/admin/quiz/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
}
