import { render, screen, waitFor } from '@testing-library/react';
import AdminDashboard from '@/app/admin/page';
import { useSession } from 'next-auth/react';
import { getAnalyticsData } from '@/lib/adminApi';

// Mock next-auth
jest.mock('next-auth/react', () => ({
    useSession: jest.fn(),
}));

// Mock adminApi
jest.mock('@/lib/adminApi', () => ({
    getAnalyticsData: jest.fn(),
}));

describe('AdminDashboard', () => {
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Default session mock (Admin user)
        (useSession as jest.Mock).mockReturnValue({
            data: {
                user: { name: 'Admin', email: 'admin@example.com', role: 'ADMIN' },
                accessToken: 'fake-token'
            },
            status: 'authenticated',
        });
    });

    it('renders loading state initially', () => {
        // Mock API to never resolve immediately (or just rely on react state update timing)
        (getAnalyticsData as jest.Mock).mockImplementation(() => new Promise(() => { }));

        render(<AdminDashboard />);
        expect(screen.getByText(/Loading Dashboard/i)).toBeInTheDocument();
    });

    it('renders stats and charts after data load', async () => {
        // Setup mock data
        const mockStats = { totalUsers: 100, totalQuizzes: 5, totalCompletions: 50, dailyActiveUsers: 10 };
        const mockTopQuizzes = [{ quizId: '1', title: 'Test Quiz', type: 'MOVIE', _count: { quizId: 20 } }];
        const mockRecent = { signups: [], plays: [] };
        const mockGrowth = [{ date: '2023-01-01', users: 5, plays: 10 }];
        const mockErrors = { errorCount24h: 0 };
        const mockOnline = { count: 3 };

        (getAnalyticsData as jest.Mock).mockImplementation((endpoint) => {
            switch (endpoint) {
                case 'stats': return Promise.resolve(mockStats);
                case 'top-quizzes': return Promise.resolve(mockTopQuizzes);
                case 'recent-activity': return Promise.resolve(mockRecent);
                case 'growth-stats': return Promise.resolve(mockGrowth);
                case 'error-stats': return Promise.resolve(mockErrors);
                case 'online-users': return Promise.resolve(mockOnline);
                default: return Promise.resolve({});
            }
        });

        render(<AdminDashboard />);

        // Wait for loading to finish
        await waitFor(() => {
            expect(screen.getByText('Command Center')).toBeInTheDocument();
        });

        // Check Headers
        expect(screen.getByText('Top Popular Quizzes')).toBeInTheDocument();

        // Check Stats
        expect(screen.getByText('Total Users')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();

        // Check Online Users (Pulse)
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText(/ONLINE USERS/i)).toBeInTheDocument();

        // Check Top Quizzes row
        // Using regex and findBy with longer timeout just in case
        expect(await screen.findByText(/Test Quiz/, {}, { timeout: 3000 })).toBeInTheDocument();
    });

    it('does not load data if no token/session', async () => {
        (useSession as jest.Mock).mockReturnValue({
            data: null,
            status: 'unauthenticated',
        });

        render(<AdminDashboard />);

        // It stays loading or renders nothing relevant (logic says 'if (!token) return' in effect)
        // Actually the component renders "Loading Dashboard..." initially and never leaves it if token is missing because useEffect returns early.
        // Let's verify it stays loading or handles it.
        // In the current code: `if (loading) return ...Loading...`
        // And useEffect `if (!token) return;` 
        // So loading will stay true forever if no token.
        expect(screen.getByText(/Loading Dashboard/i)).toBeInTheDocument();
        expect(getAnalyticsData).not.toHaveBeenCalled();
    });
});
