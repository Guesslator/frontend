export interface Translation {
    [key: string]: {
        title?: string;
        description?: string;
        text?: string;
    };
}

export interface ContentItem {
    id: string;
    slug?: string;
    type: 'MOVIE' | 'SERIES' | 'GAME';
    posterUrl: string;
    translations: Translation;
    levels: number[];
}

export interface QuestionOption {
    id: string;
    isCorrect: boolean;
    translations: Translation;
}

export interface Question {
    id: string;
    type: 'TEXT' | 'VIDEO' | 'IMAGE';
    videoUrl?: string; // Made optional as TEXT/IMAGE type questions might not have it
    startTime?: number; // Made optional
    stopTime?: number; // Made optional
    endTime?: number; // Made optional
    imageUrl?: string; // For IMAGE type questions
    translations: Translation;
    options: QuestionOption[];
}

export interface Quiz {
    id: string;
    slug?: string;
    contentId: string; // [NEW] Needed for score submission
    questions: Question[];
}

export const MOCK_CONTENT: ContentItem[] = [
    {
        id: '1',
        type: 'MOVIE',
        posterUrl: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', // Shawshank
        translations: {
            en: { title: 'The Shawshank Redemption', description: 'Two imprisoned men bond over a number of years.' },
            tr: { title: 'Esaretin Bedeli', description: 'İki mahkumun yıllar süren dostluğu.' },
            de: { title: 'Die Verurteilten', description: 'Zwei inhaftierte Männer freunden sich an.' }
        },
        levels: [1, 2, 3]
    },
    {
        id: '2',
        type: 'SERIES',
        posterUrl: 'https://image.tmdb.org/t/p/w500/reKs8cu4ow9xptqvrXe3BVP3T71.jpg', // Breaking Bad
        translations: {
            en: { title: 'Breaking Bad', description: 'A high school chemistry teacher turned methamphetamine producer.' },
            tr: { title: 'Breaking Bad', description: 'Kimya öğretmeninin uyuşturucu baronuna dönüşümü.' },
            de: { title: 'Breaking Bad', description: 'Ein Chemielehrer wird zum Meth-Produzenten.' }
        },
        levels: [1, 2]
    },
    {
        id: '3',
        type: 'GAME',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a7/God_of_War_4_cover.jpg', // God of War
        translations: {
            en: { title: 'God of War', description: 'Kratos and Atreus journey to the highest peak.' },
            tr: { title: 'God of War', description: 'Kratos ve Atreus en yüksek zirveye yolculuk eder.' },
            de: { title: 'God of War', description: 'Kratos und Atreus reisen zum höchsten Gipfel.' }
        },
        levels: [1]
    }
];

export const MOCK_QUIZ: Quiz = {
    id: 'level-1',
    contentId: '1', // Mock content ID
    questions: [
        {
            id: 'q1',
            type: 'VIDEO',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Placeholder
            startTime: 60,
            stopTime: 70,
            endTime: 80,
            translations: {
                en: { text: 'What happens next?' },
                tr: { text: 'Bundan sonra ne olur?' },
                de: { text: 'Was passiert als nächstes?' }
            },
            options: [
                { id: 'o1', isCorrect: true, translations: { en: { text: 'The bunny attacks' }, tr: { text: 'Tavşan saldırır' }, de: { text: 'Der Hase greift an' } } },
                { id: 'o2', isCorrect: false, translations: { en: { text: 'The bunny runs away' }, tr: { text: 'Tavşan kaçar' }, de: { text: 'Der Hase rennt weg' } } },
            ]
        }
    ]
};
