import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ContentCard from '../../components/ContentCard'

// Mock next-auth
jest.mock("next-auth/react", () => ({
    useSession: jest.fn(() => ({ data: null })),
}));

// Mock i18n
jest.mock("../../lib/i18n", () => ({
    t: (lang: string, key: string) => key,
}));

// Mock Link
jest.mock("next/link", () => {
    return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock framer-motion
jest.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    }
}));

// Mock icons
jest.mock("lucide-react", () => ({
    PlayCircle: () => <svg data-testid="icon-play" />,
    Trash2: () => <svg data-testid="icon-trash" />,
    Film: () => <svg data-testid="icon-film" />,
    Image: () => <svg data-testid="icon-image" />,
}));

// Mock api
jest.mock("../../lib/api", () => ({
    deleteUserContent: jest.fn(),
}));

describe('ContentCard', () => {
    const defaultProps = {
        id: '1',
        title: 'Test Movie',
        description: 'Test Desc',
        posterUrl: '/poster.jpg',
        lang: 'en',
        index: 0,
    };

    it('renders title and description', () => {
        render(<ContentCard {...defaultProps} />);
        const titles = screen.getAllByText('Test Movie');
        expect(titles.length).toBeGreaterThan(0);
        expect(titles[0]).toBeInTheDocument();
        expect(screen.getByText('Test Desc')).toBeInTheDocument();
    });

    it('renders link with correct href', () => {
        render(<ContentCard {...defaultProps} />);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/en/content/1');
    });

    it('does not show delete button for non-owners', () => {
        render(<ContentCard {...defaultProps} creatorType="USER" creator={{ id: 'owner', name: 'Owner', email: '' }} />);
        expect(screen.queryByTestId('icon-trash')).not.toBeInTheDocument();
    });
});
