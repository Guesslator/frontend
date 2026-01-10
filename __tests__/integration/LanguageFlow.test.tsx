import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '../../app/page'

// Mock dependencies
jest.mock("framer-motion", () => ({
    motion: {
        div: ({ children, whileHover, whileTap, initial, animate, transition, ...props }: any) => <div {...props}>{children}</div>,
    }
}));

jest.mock("next/link", () => {
    return ({ children, href }: any) => <a href={href} data-testid="lang-link">{children}</a>;
});

jest.mock("@/components/ThemeToggle", () => ({
    ThemeToggle: () => <button>Toggle</button>
}));

describe('Language Selection Flow', () => {
    it('renders language options with correct paths', () => {
        render(<Home />);

        const links = screen.getAllByTestId('lang-link');
        expect(links).toHaveLength(4); // 3 languages + 1 admin link

        expect(links[0]).toHaveAttribute('href', '/tr');
        expect(links[1]).toHaveAttribute('href', '/en');
        expect(links[2]).toHaveAttribute('href', '/de');
    });

    it('renders language greetings', () => {
        render(<Home />);
        expect(screen.getByText('Hoşgeldiniz')).toBeInTheDocument();
        expect(screen.getByText('Welcome')).toBeInTheDocument();
        expect(screen.getByText('Willkommen')).toBeInTheDocument();
    });
});
