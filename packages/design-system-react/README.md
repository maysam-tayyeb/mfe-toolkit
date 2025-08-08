# @mfe/design-system-react

React component library for the MFE platform design system. Provides pre-built React 19 components that wrap the CSS-first design system with additional functionality and type safety.

## ✨ Features

- 🎨 **React 19 Components** - Modern React components with hooks
- 🔒 **TypeScript Support** - Full type definitions for all components
- 📦 **Tree-Shakeable** - Import only what you need
- 🎯 **Design System Integration** - Uses `@mfe/design-system` CSS classes
- 🚀 **Zero Configuration** - Works out of the box with container app
- 🚫 **No Bundled CSS** - Uses container-provided design system styles

## Important Note

This package does **NOT** bundle any CSS. It expects the design system CSS to be loaded by the container application. The components simply apply the appropriate `ds-*` classes.

## Installation

```bash
# Internal package - not published to npm
# Used within the monorepo via pnpm workspace
```

## Prerequisites

Your container application must load the design system CSS from `@mfe/design-system/styles.css`.

## Components

### Hero

A prominent header section with gradient background and metrics display.

```tsx
import { Hero, MetricCard } from '@mfe/design-system-react';

<Hero
  title="Dashboard"
  description="Monitor your application performance"
  gradient={true}
>
  <div className="grid grid-cols-4 gap-4">
    <MetricCard label="Users" value={42} />
    <MetricCard label="Uptime" value="99.9%" />
  </div>
</Hero>
```

**Props:**
- `title` (string, required) - Main heading text
- `description` (string) - Subtitle text
- `gradient` (boolean) - Enable gradient background
- `children` (ReactNode) - Additional content (typically metrics)

### MetricCard

Display key metrics with optional trends and icons.

```tsx
import { MetricCard } from '@mfe/design-system-react';
import { TrendingUp } from 'lucide-react';

<MetricCard
  label="Revenue"
  value="$42,000"
  trend={{ value: '+12%', direction: 'up' }}
  icon={<TrendingUp className="h-4 w-4" />}
/>
```

**Props:**
- `label` (string, required) - Metric description
- `value` (string | number, required) - Metric value
- `trend` (object) - Trend indicator with value and direction
- `icon` (ReactNode) - Optional icon
- `className` (string) - Additional CSS classes

### TabGroup

Tabbed interface for organizing content.

```tsx
import { TabGroup } from '@mfe/design-system-react';

const tabs = [
  {
    id: 'overview',
    label: 'Overview',
    content: <OverviewPanel />
  },
  {
    id: 'settings',
    label: 'Settings',
    content: <SettingsPanel />
  }
];

<TabGroup 
  tabs={tabs} 
  defaultTab="overview"
  onChange={(tabId) => console.log('Tab changed:', tabId)}
/>
```

**Props:**
- `tabs` (Array, required) - Tab configuration objects
- `defaultTab` (string) - Initially active tab ID
- `onChange` (function) - Callback when tab changes
- `className` (string) - Additional CSS classes

### EmptyState

Placeholder for empty content areas.

```tsx
import { EmptyState } from '@mfe/design-system-react';
import { Inbox } from 'lucide-react';

<EmptyState
  title="No messages"
  description="When you receive messages, they'll appear here"
  icon={<Inbox className="h-16 w-16" />}
  action={
    <button className="ds-button-primary">
      Send First Message
    </button>
  }
/>
```

**Props:**
- `title` (string, required) - Empty state heading
- `description` (string) - Additional context
- `icon` (ReactNode) - Visual element
- `action` (ReactNode) - Call-to-action element

### LoadingState

Loading indicator with optional text.

```tsx
import { LoadingState } from '@mfe/design-system-react';

<LoadingState 
  text="Loading dashboard..."
  subtext="This may take a few seconds"
  size="large"
/>
```

**Props:**
- `text` (string) - Primary loading message
- `subtext` (string) - Additional context
- `size` ('default' | 'large') - Spinner size
- `className` (string) - Additional CSS classes

### EventLog

Display a list of events or activities.

```tsx
import { EventLog } from '@mfe/design-system-react';

const events = [
  {
    id: '1',
    timestamp: new Date(),
    type: 'user:login',
    message: 'User logged in',
    severity: 'info'
  },
  {
    id: '2',
    timestamp: new Date(),
    type: 'system:error',
    message: 'Connection failed',
    severity: 'error'
  }
];

<EventLog 
  events={events}
  maxHeight="400px"
  emptyMessage="No events yet"
/>
```

**Props:**
- `events` (Array, required) - Event objects to display
- `maxHeight` (string) - Maximum height before scrolling
- `emptyMessage` (string) - Message when no events
- `className` (string) - Additional CSS classes

### Legacy Components

These components are maintained for backward compatibility:

- **Card** - Container component with variants (use `ds-card` classes directly for new code)
- **Button** - Button component (use `ds-button-*` classes directly for new code)
- **Grid** - Grid layout (use CSS Grid or Flexbox directly)
- **InfoBlock** - Information display (use custom layout)
- **Section** - Page section (use semantic HTML)

## Usage with Design System

All components use the CSS classes from `@mfe/design-system`. The container application provides these styles globally, so components work without additional setup.

```tsx
import { Hero, MetricCard, TabGroup } from '@mfe/design-system-react';

function Dashboard() {
  return (
    <div className="ds-page">
      <Hero title="Analytics" gradient>
        <div className="grid grid-cols-3 gap-4">
          <MetricCard label="Views" value="1.2M" />
          <MetricCard label="Users" value="42K" />
          <MetricCard label="Revenue" value="$98K" />
        </div>
      </Hero>
      
      <div className="ds-card-padded ds-mt-lg">
        <TabGroup 
          tabs={[
            { id: 'chart', label: 'Chart', content: <Chart /> },
            { id: 'table', label: 'Table', content: <Table /> }
          ]}
        />
      </div>
    </div>
  );
}
```

## TypeScript

All components are fully typed with TypeScript:

```typescript
import type { HeroProps, MetricCardProps } from '@mfe/design-system-react';

const heroConfig: HeroProps = {
  title: 'Dashboard',
  description: 'Welcome back',
  gradient: true
};

const metricConfig: MetricCardProps = {
  label: 'Total Sales',
  value: 42000,
  trend: { value: '+12%', direction: 'up' }
};
```

## Architecture

These components are thin wrappers that apply the design system CSS classes. They:
- Do NOT include any CSS files
- Assume the container provides the design system styles globally
- Use the `ds-*` prefixed classes exclusively
- Are fully typed for React 19 with TypeScript
- Follow React best practices and hooks patterns

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Type checking
pnpm type-check

# Watch for changes
pnpm dev
```

## Component Guidelines

When creating new components:

1. **Use Design System Classes** - Leverage `ds-*` classes from `@mfe/design-system`
2. **No Inline Styles** - All styling through CSS classes
3. **TypeScript First** - All props must be fully typed
4. **Accessibility** - Include ARIA attributes and keyboard support
5. **Documentation** - Include JSDoc comments and examples
6. **No CSS Imports** - Never import CSS files in components

## Related Packages

- `@mfe/design-system` - CSS-first design system (provides styles)
- `@mfe-toolkit/react` - Core React MFE components
- `@mfe-toolkit/core` - Framework-agnostic MFE toolkit

## License

MIT (Internal Package)