import { z } from 'zod';

// Helper to normalize translation
const normalizeTranslation = (val: string | { title?: string; description?: string; text?: string } | null | undefined) => {
    if (!val) return {};
    if (typeof val === 'string') return { text: val };
    return val;
};

export const TranslationSchema = z.record(
    z.string(),
    z.union([
        z.string().transform(val => ({ text: val })),
        z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            text: z.string().optional()
        }),
        z.null().transform(() => ({}))
    ])
);

export const CreatorSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().optional()
});

export const QuestionSchema = z.object({
    id: z.string(),
    type: z.enum(['VIDEO', 'TEXT', 'IMAGE', 'AUDIO']),
    videoUrl: z.string().optional(),
    startTime: z.number().optional(),
    stopTime: z.number().optional(),
    endTime: z.number().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    audioUrl: z.string().optional().nullable(),
    translations: TranslationSchema,
    options: z.array(z.object({
        id: z.string(),
        isCorrect: z.boolean(),
        translations: TranslationSchema
    })),
    attempts: z.number().optional(),
    correctCount: z.number().optional()
});

export const ContentItemSchema = z.object({
    id: z.string(),
    slug: z.string().optional(),
    type: z.enum(['MOVIE', 'SERIES', 'GAME', 'SPORTS']),
    posterUrl: z.string(),
    translations: TranslationSchema,
    levels: z.array(z.object({ id: z.string(), level: z.number() })).optional().default([]),
    creatorType: z.enum(['ADMIN', 'USER']).optional(),
    creator: CreatorSchema.optional(),
    subcategory: z.enum(['FOOTBALL', 'BASKETBALL', 'MMA']).optional(),
    quizType: z.enum(['TEXT', 'VIDEO', 'IMAGE', 'AUDIO']).optional(),
    isPublished: z.boolean().optional(),
    questions: z.array(QuestionSchema).optional(),
    stats: z.object({
        totalAttempts: z.number(),
        avgScore: z.number(),
        passRate: z.number()
    }).optional()
});

export const QuizSchema = z.object({
    id: z.string(),
    slug: z.string().optional(),
    title: z.string(),
    description: z.string().nullable().optional(),
    created_by: z.string(),
    contentId: z.string(),
    videos: z.array(z.any()).default([]),
    questions: z.array(QuestionSchema)
});

export type ContentItem = z.infer<typeof ContentItemSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
export type Question = z.infer<typeof QuestionSchema>;
