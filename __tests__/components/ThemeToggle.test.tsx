import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ThemeToggle } from '../../components/ThemeToggle'

const mockSetTheme = jest.fn();

jest.mock("next-themes", () => ({
    useTheme: () => ({
        theme: 'light',
        setTheme: mockSetTheme,
    }),
}));

jest.mock("lucide-react", () => ({
    Moon: () => <svg data-testid="icon-moon" />,
    Sun: () => <svg data-testid="icon-sun" />,
}));

describe('ThemeToggle', () => {
    it('renders toggle button', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
    });

    it('toggles theme on click', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });
});
