import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

const TestComp = () => <div>Hello</div>

describe('Sanity React', () => {
    it('renders div', () => {
        render(<TestComp />)
        expect(screen.getByText('Hello')).toBeInTheDocument()
    })
})
