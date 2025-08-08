# @mfe/design-system

A framework-agnostic, CSS-first design system for the MFE platform. This package provides 200+ utility classes and design tokens to ensure consistency across all microfrontends without global pollution.

## ✨ Features

- 🎨 **Zero Global Pollution** - All classes use `ds-*` prefix, no window/global variables
- 📦 **Framework Agnostic** - Pure CSS that works with React, Vue, Vanilla JS, and more
- 🎯 **200+ Utility Classes** - Comprehensive set for layouts, typography, colors, and effects
- 🌈 **Semantic Color System** - Primary, success, warning, danger, info with soft variants
- 📱 **Responsive Design** - Mobile-first approach with adaptive layouts
- ⚡ **Lightweight** - CSS-only with optional ES module tokens

## Installation

```bash
# Internal package - not published to npm
# Used within the monorepo via pnpm workspace
```

## Philosophy

This design system follows a **CSS-first approach** with zero global pollution:

1. **No Framework Lock-in** - Works equally well with any framework or vanilla JS
2. **CSS Classes Only** - No JavaScript required for basic usage
3. **Optional ES Modules** - Design tokens available via explicit imports when needed
4. **Semantic Naming** - Clear, purposeful class names with `ds-` prefix
5. **Progressive Enhancement** - Start with CSS, add framework wrappers as needed

## 🎨 CSS Classes (200+ Available)

### Layout & Containers

```html
<!-- Page container -->
<div class="ds-page">
  <!-- Hero section with gradient -->
  <div class="ds-hero">
    <h1 class="ds-hero-title">Welcome</h1>
    <p class="ds-hero-description">Build amazing MFEs</p>
  </div>

  <!-- Card variants -->
  <div class="ds-card">Standard card</div>
  <div class="ds-card-padded">More padding</div>
  <div class="ds-card-compact">Less padding</div>

  <!-- Metric cards -->
  <div class="ds-metric-card">
    <div class="ds-metric-value">42</div>
    <div class="ds-metric-label">Active Users</div>
  </div>
</div>
```

### Typography

```html
<!-- Heading hierarchy -->
<h1 class="ds-page-title">Page Title</h1>
<h2 class="ds-section-title">Section Title</h2>
<h3 class="ds-card-title">Card Title</h3>

<!-- Text variants -->
<p class="ds-text-default">Normal text</p>
<p class="ds-text-muted">Muted text</p>
<p class="ds-text-small">Small text</p>
<label class="ds-label">Form label</label>
```

### Components

```html
<!-- Buttons -->
<button class="ds-button-primary">Primary</button>
<button class="ds-button-outline">Outline</button>
<button class="ds-button-ghost">Ghost</button>

<!-- Badges -->
<span class="ds-badge">Default</span>
<span class="ds-badge-info">Info</span>
<span class="ds-badge-success">Success</span>
<span class="ds-badge-warning">Warning</span>
<span class="ds-badge-danger">Danger</span>

<!-- Tabs -->
<div class="ds-tabs">
  <button class="ds-tab ds-tab-active">Active Tab</button>
  <button class="ds-tab">Inactive Tab</button>
</div>

<!-- Form controls -->
<input class="ds-input" placeholder="Enter text" />
<select class="ds-select">
  <option>Option 1</option>
</select>
<textarea class="ds-textarea" rows="3"></textarea>
```

### Semantic Colors

```html
<!-- Text colors -->
<p class="ds-accent-primary">Primary text</p>
<p class="ds-accent-success">Success text</p>
<p class="ds-accent-warning">Warning text</p>
<p class="ds-accent-danger">Danger text</p>
<p class="ds-accent-info">Info text</p>

<!-- Background colors (soft variants) -->
<div class="ds-bg-accent-primary-soft">Primary background</div>
<div class="ds-bg-accent-success-soft">Success background</div>
<div class="ds-bg-accent-warning-soft">Warning background</div>
<div class="ds-bg-accent-danger-soft">Danger background</div>
<div class="ds-bg-accent-info-soft">Info background</div>

<!-- Icon colors -->
<svg class="ds-icon-primary">...</svg>
<svg class="ds-icon-success">...</svg>
<svg class="ds-icon-muted">...</svg>
```

### States & Effects

```html
<!-- Loading states -->
<div class="ds-loading-state">
  <div class="ds-spinner"></div>
  <p class="ds-loading-text">Loading...</p>
</div>

<!-- Empty states -->
<div class="ds-empty-state">
  <p class="ds-empty-text">No data available</p>
</div>

<!-- Hover effects -->
<div class="ds-hover-scale">Scales on hover</div>
<div class="ds-hover-bg">Background on hover</div>

<!-- Focus states -->
<button class="ds-focus-ring">Focus ring</button>
```

### Spacing Utilities

```html
<!-- Margin -->
<div class="ds-mt-sm">Small top margin</div>
<div class="ds-mb-md">Medium bottom margin</div>
<div class="ds-mt-lg">Large top margin</div>

<!-- Padding -->
<div class="ds-p-sm">Small padding</div>
<div class="ds-p-md">Medium padding</div>
<div class="ds-p-lg">Large padding</div>

<!-- Stack spacing -->
<div class="ds-stack">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

## 🎯 Usage Examples

### Basic HTML/CSS

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Design system CSS is provided by container -->
    <link rel="stylesheet" href="/design-system.css" />
  </head>
  <body>
    <div class="ds-page">
      <div class="ds-hero">
        <h1 class="ds-hero-title">My App</h1>
      </div>

      <div class="ds-card-padded">
        <h2 class="ds-section-title">Features</h2>
        <div class="ds-grid-3">
          <div class="ds-metric-card">
            <div class="ds-metric-value">99%</div>
            <div class="ds-metric-label">Uptime</div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
```

### React

```tsx
function Dashboard() {
  return (
    <div className="ds-page">
      <div className="ds-hero">
        <h1 className="ds-hero-title">Dashboard</h1>
        <p className="ds-hero-description">Monitor your application</p>
      </div>

      <div className="ds-grid-3 ds-mt-lg">
        <MetricCard value="42" label="Users" />
        <MetricCard value="99%" label="Uptime" />
        <MetricCard value="1.2s" label="Load Time" />
      </div>
    </div>
  );
}
```

### Vue

```vue
<template>
  <div class="ds-page">
    <div class="ds-hero">
      <h1 class="ds-hero-title">{{ title }}</h1>
    </div>

    <div class="ds-card-padded">
      <button class="ds-button-primary" @click="handleClick">Click Me</button>
    </div>
  </div>
</template>
```

### Vanilla JavaScript

```javascript
const container = document.getElementById('app');
container.innerHTML = `
  <div class="ds-page">
    <div class="ds-hero">
      <h1 class="ds-hero-title">Vanilla JS App</h1>
    </div>
    
    <div class="ds-card ds-mt-lg">
      <h2 class="ds-card-title">Features</h2>
      <ul class="ds-list">
        <li>No framework required</li>
        <li>Pure CSS classes</li>
        <li>Lightweight and fast</li>
      </ul>
    </div>
  </div>
`;
```

## 📦 Design Tokens (Optional)

While the design system is CSS-first, tokens are available via ES modules:

```typescript
import { colors, spacing, typography } from '@mfe/design-system/tokens';

// Use tokens programmatically
const primaryColor = colors.primary;
const largePadding = spacing.lg;
const headingFont = typography.heading;
```

## 🔧 Development

```bash
# Install dependencies
pnpm install

# Build CSS
pnpm build

# Watch for changes
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm type-check
```

## 📚 Related Packages

- `@mfe/design-system-react` - React component wrappers
- `@mfe-toolkit/core` - Core MFE functionality
- `@mfe-toolkit/react` - React MFE components

## License

MIT (Internal Package)
