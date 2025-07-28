# @mfe/design-system

A lean design system built on top of Tailwind CSS for the MFE platform. This package provides reusable React components and style patterns to ensure consistency across all microfrontends.

## Installation

```bash
pnpm add @mfe/design-system
```

## Philosophy

This design system is intentionally lean and leverages Tailwind CSS instead of recreating a token system. It focuses on:

1. **Reusable Components** - Not just CSS classes, but actual React components with behavior
2. **Pattern Constants** - Common Tailwind class combinations as constants to ensure consistency
3. **Semantic Props** - Components that accept props like `variant="primary"` instead of raw Tailwind classes

## Components

### Card

A flexible container component with multiple variants:

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@mfe/design-system';

// Default variant
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>

// Variants
<Card variant="compact">...</Card>    // Less padding
<Card variant="elevated">...</Card>   // With shadow
<Card variant="interactive">...</Card> // Hover effects
```

### InfoBlock

Display key-value information in a consistent format:

```tsx
import { InfoBlock } from '@mfe/design-system';

<InfoBlock
  title="User Details"
  sections={[
    { label: 'Name', value: 'John Doe' },
    { label: 'Email', value: 'john@example.com' },
    { label: 'Status', value: 'Active', highlight: true },
  ]}
  columns={3}
/>
```

### Section

Page sections with optional title and subtitle:

```tsx
import { Section } from '@mfe/design-system';

<Section title="Dashboard" subtitle="Welcome back">
  <p>Your content here</p>
</Section>

// Muted variant with background
<Section variant="muted" title="Settings">
  <p>Configuration options</p>
</Section>
```

### Grid

Responsive grid layouts:

```tsx
import { Grid } from '@mfe/design-system';

<Grid cols={2}>
  <div>Column 1</div>
  <div>Column 2</div>
</Grid>

// Responsive grid
<Grid cols="responsive">
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</Grid>
```

## Style Patterns

Pre-defined Tailwind class combinations for consistency:

```tsx
import { buttonStyles, cardStyles, textStyles } from '@mfe/design-system';

// Button styles
<button className={buttonStyles.primary}>Primary</button>
<button className={buttonStyles.secondary}>Secondary</button>
<button className={buttonStyles.outline}>Outline</button>

// Text styles
<h1 className={textStyles.h1}>Heading 1</h1>
<p className={textStyles.subtitle}>Subtitle text</p>
<span className={textStyles.small}>Small text</span>

// Badge styles
<span className={badgeStyles.success}>Success</span>
<span className={badgeStyles.error}>Error</span>
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## License

MIT