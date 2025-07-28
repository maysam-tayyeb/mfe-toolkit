import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Section } from './Section';

describe('Section Component', () => {
  it('renders children without title or subtitle', () => {
    render(
      <Section>
        <p>Section content</p>
      </Section>
    );
    expect(screen.getByText('Section content')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(
      <Section title="Test Title">
        <p>Content</p>
      </Section>
    );
    const title = screen.getByText('Test Title');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H2');
    expect(title).toHaveClass('text-2xl font-bold');
  });

  it('renders with subtitle', () => {
    render(
      <Section subtitle="Test subtitle">
        <p>Content</p>
      </Section>
    );
    const subtitle = screen.getByText('Test subtitle');
    expect(subtitle).toBeInTheDocument();
    expect(subtitle).toHaveClass('text-muted-foreground mt-2');
  });

  it('renders with both title and subtitle', () => {
    render(
      <Section title="Title" subtitle="Subtitle">
        <p>Content</p>
      </Section>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    const { container } = render(
      <Section>
        <p>Content</p>
      </Section>
    );
    const section = container.firstChild;
    expect(section).toHaveClass('space-y-6');
    expect(section).not.toHaveClass('bg-muted/50');
  });

  it('renders with muted variant', () => {
    const { container } = render(
      <Section variant="muted">
        <p>Content</p>
      </Section>
    );
    const section = container.firstChild;
    expect(section).toHaveClass('bg-muted/50 rounded-lg p-6 space-y-6');
  });

  it('accepts custom className', () => {
    const { container } = render(
      <Section className="custom-class">
        <p>Content</p>
      </Section>
    );
    const section = container.firstChild;
    expect(section).toHaveClass('custom-class');
    expect(section).toHaveClass('space-y-6');
  });

  it('renders as section element', () => {
    const { container } = render(
      <Section>
        <p>Content</p>
      </Section>
    );
    const section = container.firstChild;
    expect(section?.nodeName).toBe('SECTION');
  });

  it('passes through other HTML props', () => {
    const { container } = render(
      <Section data-testid="test-section">
        <p>Content</p>
      </Section>
    );
    const section = container.firstChild;
    expect(section).toHaveAttribute('data-testid', 'test-section');
  });
});
