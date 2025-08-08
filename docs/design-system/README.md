# MFE Design System Documentation

## Overview

The MFE Design System is a **zero-pollution, CSS-first** design system that provides consistent UI patterns across all microfrontends and the container application. It's built with framework-agnostic principles while offering optional React component wrappers.

## 🎯 Core Principles

### 1. Zero Global Pollution

- No window or global object modifications
- No side effects on import
- Pure CSS classes with `ds-` prefix
- Services injected at runtime, not globally

### 2. CSS-First Approach

- All styling through CSS classes
- Framework components are thin wrappers
- Works with any framework or vanilla JS
- No CSS-in-JS or runtime styling

### 3. Modern Blue & Slate Palette

- Professional color scheme
- Consistent use of HSL values
- Full dark mode support
- Semantic color naming

## 📦 Package Structure

### @mfe/design-system

Framework-agnostic CSS and design tokens:

- CSS utility classes (`ds-*` prefix)
- Design tokens (colors, typography, spacing)
- No framework dependencies
- Pure CSS output

### @mfe/design-system-react

Optional React 19 component wrappers:

- Thin wrappers around CSS classes
- TypeScript support
- No bundled CSS (uses container styles)
- Tree-shakeable components

## 🚀 Quick Start

### Using CSS Classes (Recommended)

```html
<!-- Any framework or vanilla HTML -->
<div class="ds-page">
  <h1 class="ds-page-title">Page Title</h1>

  <div class="ds-card">
    <h2 class="ds-section-title">Section</h2>
    <p class="ds-text-muted">Description text</p>

    <button class="ds-button-primary">Primary Action</button>
  </div>
</div>
```

### Using React Components (Optional)

```tsx
import { Card, Button } from '@mfe/design-system-react';

function MyComponent() {
  return (
    <div className="ds-page">
      <h1 className="ds-page-title">Page Title</h1>

      <Card>
        <h2 className="ds-section-title">Section</h2>
        <p className="ds-text-muted">Description text</p>

        <Button variant="primary">Primary Action</Button>
      </Card>
    </div>
  );
}
```

## 📚 Documentation Structure

### [Foundations](./foundations/)

Core design principles and tokens:

- [Colors](./foundations/colors.md) - Color system and themes
- [Typography](./foundations/typography.md) - Type scale and text styles
- [Spacing](./foundations/spacing.md) - Spacing system and layout
- [Responsive](./foundations/responsive.md) - Breakpoints and responsive design

### [Components](./components/)

Individual component documentation:

- [Card](./components/card.md) - Container component with variants
- [Button](./components/button.md) - Interactive button styles
- [EventLog](./components/event-log.md) - Event display component
- [InfoBlock](./components/info-block.md) - Information display blocks
- [Section](./components/section.md) - Page section containers
- [Grid](./components/grid.md) - Responsive grid layouts

### [Guidelines](./guidelines/)

Best practices and guides:

- [Accessibility](./guidelines/accessibility.md) - A11y best practices
- [Patterns](./guidelines/patterns.md) - Common UI patterns
- [Migration](./guidelines/migration.md) - Migrating from legacy components

## 🎨 Key CSS Classes

### Layout

- `ds-page` - Page container with max-width
- `ds-container` - Content container
- `ds-section` - Section wrapper

### Typography

- `ds-page-title` - Main page heading (text-xl)
- `ds-section-title` - Section heading (text-lg)
- `ds-card-title` - Card heading (text-base)
- `ds-text-muted` - Muted text color
- `ds-text-small` - Small text size

### Components

- `ds-card` - Card container
- `ds-button-primary` - Primary button
- `ds-button-outline` - Outlined button
- `ds-badge` - Badge component

### Grid

- `ds-grid-2` - 2-column grid
- `ds-grid-3` - 3-column grid
- `ds-grid-4` - 4-column grid

## 🔄 Migration from Legacy Components

If you're migrating from ShadCN or custom components:

1. **Replace component imports** with design system imports
2. **Update class names** to use `ds-*` prefix
3. **Remove inline styles** in favor of utility classes
4. **Test cross-browser** compatibility

See the [Migration Guide](./guidelines/migration.md) for detailed instructions.

## 🛠️ Development

### Adding New Components

1. Define CSS classes in `@mfe/design-system`
2. Create optional React wrapper in `@mfe/design-system-react`
3. Document in this guide
4. Add examples and tests

### Design Tokens

Design tokens are defined in `packages/design-system/src/tokens/`:

- Colors: HSL-based color system
- Typography: Font sizes and weights
- Spacing: Consistent spacing scale
- Breakpoints: Responsive design points

## 📖 Examples

### Complete Page Layout

```html
<div class="ds-page">
  <header>
    <h1 class="ds-page-title">Dashboard</h1>
    <p class="ds-text-muted">Welcome to your dashboard</p>
  </header>

  <div class="ds-grid-3">
    <div class="ds-card">
      <h2 class="ds-card-title">Analytics</h2>
      <p>Your analytics data here</p>
    </div>

    <div class="ds-card">
      <h2 class="ds-card-title">Reports</h2>
      <p>Latest reports</p>
    </div>

    <div class="ds-card">
      <h2 class="ds-card-title">Settings</h2>
      <p>Configure your preferences</p>
    </div>
  </div>
</div>
```

## 🤝 Contributing

When contributing to the design system:

1. Follow the zero-pollution principle
2. Maintain CSS-first approach
3. Document all changes
4. Include examples
5. Test across frameworks

## 📝 License

Part of the MFE Toolkit project. See repository LICENSE for details.
