import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import App from './App';

describe('application shell', () => {
  it('renders the foundation dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText(/Phase 0 foundation/i)).toBeInTheDocument();
    expect(screen.getByText('0 of 10')).toBeInTheDocument();
  });

  it('renders the login layout without enabling sign-in', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled();
  });
});
