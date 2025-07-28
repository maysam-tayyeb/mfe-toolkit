import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardHeader, CardTitle, CardContent } from './Card';

describe('Card Component', () => {
  it('renders with default variant', () => {
    const { container } = render(<Card>Test Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('border rounded-lg p-6 space-y-4');
  });

  it('renders with compact variant', () => {
    const { container } = render(<Card variant="compact">Compact Card</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('border rounded-lg p-4 space-y-3');
  });

  it('renders with elevated variant', () => {
    const { container } = render(<Card variant="elevated">Elevated Card</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('border rounded-lg p-6 space-y-4 shadow-sm');
  });

  it('renders with interactive variant', () => {
    const { container } = render(<Card variant="interactive">Interactive Card</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('border rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow');
  });

  it('accepts custom className', () => {
    const { container } = render(<Card className="custom-class">Custom Class Card</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
    expect(card).toHaveClass('border rounded-lg p-6 space-y-4');
  });

  it('passes through other HTML props', () => {
    render(<Card data-testid="test-card">Test</Card>);
    expect(screen.getByTestId('test-card')).toBeInTheDocument();
  });
});

describe('CardHeader Component', () => {
  it('renders children correctly', () => {
    render(<CardHeader>Header Content</CardHeader>);
    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });

  it('applies flex layout classes', () => {
    const { container } = render(<CardHeader>Header</CardHeader>);
    const header = container.firstChild;
    expect(header).toHaveClass('flex justify-between items-center');
  });
});

describe('CardTitle Component', () => {
  it('renders as h2 element', () => {
    render(<CardTitle>Title Text</CardTitle>);
    const title = screen.getByText('Title Text');
    expect(title.tagName).toBe('H2');
  });

  it('applies title styling', () => {
    render(<CardTitle>Title</CardTitle>);
    const title = screen.getByText('Title');
    expect(title).toHaveClass('text-xl font-semibold');
  });
});

describe('CardContent Component', () => {
  it('renders children with spacing', () => {
    const { container } = render(<CardContent>Content</CardContent>);
    const content = container.firstChild;
    expect(content).toHaveClass('space-y-3');
  });

  it('accepts custom className', () => {
    const { container } = render(<CardContent className="custom-spacing">Content</CardContent>);
    const content = container.firstChild;
    expect(content).toHaveClass('custom-spacing');
    expect(content).toHaveClass('space-y-3');
  });
});