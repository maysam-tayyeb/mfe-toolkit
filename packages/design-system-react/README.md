# @mfe/design-system-react

React 19 components for the MFE Design System. These components use the CSS classes provided by the container application.

## Important Note

This package does **NOT** bundle any CSS. It expects the design system CSS to be loaded by the container application. The components simply apply the appropriate `ds-*` classes.

## Installation

```bash
pnpm add @mfe/design-system-react
```

## Prerequisites

Your container application must load the design system CSS from `@mfe/design-system/styles.css`.

## Usage

```tsx
import { Card, Button, EventLog } from '@mfe/design-system-react';

// The container has already loaded the CSS with ds-* classes
function MyComponent() {
  return (
    <Card variant="elevated">
      <h2>My Card</h2>
      <Button variant="primary">Click me</Button>
    </Card>
  );
}
```

## Components

- **Card** - Container component with variants (default, elevated, compact, interactive)
- **Button** - Button component with variants (primary, secondary, outline, ghost)
- **EventLog** - Event logging display component
- **Grid** - Responsive grid layout component
- **InfoBlock** - Information display block
- **Section** - Page section wrapper

## Architecture

These components are thin wrappers that apply the design system CSS classes. They:
- Do NOT include any CSS
- Assume the container provides the design system styles
- Use the `ds-*` prefixed classes
- Are fully typed for React 19