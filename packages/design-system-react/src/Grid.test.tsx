import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Grid } from './Grid';

describe('Grid Component', () => {
  it('renders with 2 columns by default', () => {
    const { container } = render(
      <Grid>
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>
    );
    const grid = container.firstChild;
    expect(grid).toHaveClass('grid gap-6 md:grid-cols-2');
  });

  it('renders with 3 columns', () => {
    const { container } = render(
      <Grid cols={3}>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </Grid>
    );
    const grid = container.firstChild;
    expect(grid).toHaveClass('grid gap-6 md:grid-cols-3');
  });

  it('renders with 4 columns', () => {
    const { container } = render(
      <Grid cols={4}>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
        <div>Item 4</div>
      </Grid>
    );
    const grid = container.firstChild;
    expect(grid).toHaveClass('grid gap-4 md:grid-cols-4');
  });

  it('renders with responsive layout', () => {
    const { container } = render(
      <Grid cols="responsive">
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>
    );
    const grid = container.firstChild;
    expect(grid).toHaveClass('grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4');
  });

  it('accepts custom className', () => {
    const { container } = render(
      <Grid className="custom-gap">
        <div>Item 1</div>
      </Grid>
    );
    const grid = container.firstChild;
    expect(grid).toHaveClass('custom-gap');
    expect(grid).toHaveClass('grid gap-6 md:grid-cols-2');
  });

  it('passes through other HTML props', () => {
    const { container } = render(
      <Grid data-testid="test-grid">
        <div>Item 1</div>
      </Grid>
    );
    const grid = container.firstChild;
    expect(grid).toHaveAttribute('data-testid', 'test-grid');
  });
});
