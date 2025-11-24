import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { TermsOfService } from './TermsOfService';

describe('TermsOfService', () => {
    it('renders heading', () => {
        render(
            <MemoryRouter>
                <TermsOfService />
            </MemoryRouter>
        );
        const heading = screen.getByRole('heading', { name: /terms of service/i });
        expect(heading).toBeInTheDocument();
    });
});
