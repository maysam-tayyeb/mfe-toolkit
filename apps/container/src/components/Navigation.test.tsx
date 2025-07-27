import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navigation } from './Navigation';

// Mock the MFE logo
vi.mock('./ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

const renderNavigation = () => {
  return render(
    <BrowserRouter>
      <Navigation />
    </BrowserRouter>
  );
};

describe('Navigation', () => {
  it('should render navigation links', () => {
    renderNavigation();

    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /example mfe/i })).toBeInTheDocument();
  });

  it('should have correct href attributes', () => {
    renderNavigation();

    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: /example mfe/i })).toHaveAttribute(
      'href',
      '/mfe/example'
    );
  });

  it('should render MFE logo', () => {
    renderNavigation();

    expect(screen.getByText('MFE Container')).toBeInTheDocument();
  });

  it('should have proper navigation structure', () => {
    renderNavigation();

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('flex', 'items-center', 'justify-between');
  });
});
