# Design System Usage Guide

## Overview

The MFE Design System provides a framework-agnostic set of **500+ CSS utilities** for building consistent UIs across all microfrontends. It follows a **zero global pollution** principle with a pure CSS-first approach. The comprehensive utility set ensures complete cross-framework compatibility for React, Vue, Solid.js, and Vanilla JavaScript implementations.

## Architecture

### How It Works

1. **CSS Classes**: Provided via container's stylesheet (loaded once)
2. **Pure CSS**: No JavaScript required for styling
3. **No Global Pollution**: CSS-only approach, no window/global variables
4. **Framework Agnostic**: Same classes work everywhere

### Package Structure

```
packages/design-system/
├── src/
│   ├── styles/
│   │   └── index.css        # All CSS utilities (Tailwind-based)
│   └── tokens/
│       └── index.ts         # Optional design tokens (rarely used)
└── dist/
    └── design-system.css    # Built CSS file
```

## Usage Patterns

### Pattern 1: CSS Classes Only (Recommended)

The simplest approach - just use the CSS classes provided by the container:

```tsx
// No imports needed - classes are in the stylesheet
function MyComponent() {
  return (
    <div className="ds-card-padded ds-card-elevated">
      <h2 className="ds-h2">Hello World</h2>
      <p className="ds-text-muted">This uses design system classes</p>
      <button className="ds-button-primary">Click Me</button>
    </div>
  );
}
```

### Pattern 2: Build-Time Import (Within Monorepo)

If building within the monorepo, you can import the CSS directly:

```css
/* In your MFE's main entry file */
@import '@mfe/design-system/dist/design-system.css';
```

```tsx
// Then use classes normally in components
function MyComponent() {
  return (
    <div className="ds-card-elevated">
      <button className="ds-btn-primary">Click</button>
    </div>
  );
}
```

**Note**: This is rarely needed as the container provides the CSS globally.

## Available CSS Classes (500+ Utilities)

### Cards

- `ds-card` - Base card style
- `ds-card-padded` - Card with padding
- `ds-card-compact` - Card with less padding
- `ds-card-elevated` - Card with shadow
- `ds-card-interactive` - Card with hover effects

### Complete Button System

#### Base Button Classes
- `ds-btn` - Base button with transitions (use with variants)
- `ds-btn-primary` - Primary action button (blue)
- `ds-btn-secondary` - Secondary button (slate)
- `ds-btn-outline` - Outlined button with border
- `ds-btn-ghost` - Minimal hover-only button
- `ds-btn-danger` - Destructive action (red)
- `ds-btn-success` - Success action (emerald)
- `ds-btn-warning` - Warning action (amber)

#### Button Sizes
- `ds-btn-sm` - Small button (h-7 px-2 text-xs)
- `ds-btn-lg` - Large button (h-10 px-6)
- `ds-btn-icon` - Square icon button (h-8 w-8)
- `ds-btn-icon-sm` - Small icon button (h-7 w-7)
- `ds-btn-icon-lg` - Large icon button (h-10 w-10)

#### Button Groups
- `ds-btn-group` - Container for grouped buttons

#### Note on Button Classes
Both `ds-button-*` and `ds-btn-*` variants exist for compatibility. The `ds-btn-*` variants are preferred for consistency.

### Typography

#### Headings
- `ds-h1` through `ds-h4` - Heading levels
- `ds-page-title` - Large page titles
- `ds-section-title` - Section headers
- `ds-card-title` - Card headers

#### Text Styles
- `ds-text-muted` - Muted text color
- `ds-text-small` - Small text size
- `ds-text-xs` - Extra small text
- `ds-label` - Form labels

#### Font Utilities
- `ds-font-thin` through `ds-font-extrabold` - Font weights
- `ds-leading-none` through `ds-leading-loose` - Line heights
- `ds-tracking-tighter` through `ds-tracking-widest` - Letter spacing
- `ds-uppercase`, `ds-lowercase`, `ds-capitalize` - Text transform
- `ds-underline`, `ds-no-underline`, `ds-line-through` - Text decoration

#### Text Alignment
- `ds-text-left`, `ds-text-center`, `ds-text-right`, `ds-text-justify`

### Layout

#### Containers
- `ds-container` - Max-width container
- `ds-container-narrow` - Narrower container
- `ds-section` - Section with vertical spacing
- `ds-page` - Full page container
- `ds-page-content` - Page content wrapper

#### Grid System
- `ds-grid` - Base grid container
- `ds-grid-cols-1` through `ds-grid-cols-6` - Column counts
- `ds-sm:grid-cols-*` - Small screen columns
- `ds-md:grid-cols-*` - Medium screen columns
- `ds-lg:grid-cols-*` - Large screen columns
- `ds-grid-2`, `ds-grid-3`, `ds-grid-4` - Quick grid layouts

#### Flexbox
- `ds-flex`, `ds-inline-flex` - Flex containers
- `ds-flex-col`, `ds-flex-row` - Direction
- `ds-items-center`, `ds-items-start`, `ds-items-end` - Alignment
- `ds-justify-center`, `ds-justify-between`, `ds-justify-start`, `ds-justify-end`
- `ds-flex-1`, `ds-flex-grow`, `ds-flex-shrink-0` - Flex properties

#### Spacing
- `ds-stack` - Vertical spacing between children
- `ds-stack-sm` - Small vertical spacing
- `ds-stack-lg` - Large vertical spacing
- `ds-gap-xs` through `ds-gap-xl` - Grid gaps
- `ds-p-*`, `ds-m-*` - Padding and margin utilities

#### Position
- `ds-relative`, `ds-absolute`, `ds-fixed`, `ds-sticky`
- `ds-top-0`, `ds-right-0`, `ds-bottom-0`, `ds-left-0`
- `ds-inset-0` - All sides positioned at 0
- `ds-z-10` through `ds-z-50` - Z-index layers

### Forms

#### Text Inputs
- `ds-input` - Standard text input field
- `ds-textarea` - Multi-line text field
- `ds-label` - Form label
- `ds-form-group` - Form field wrapper

#### Select & Dropdowns
- `ds-select` - Dropdown select
- `ds-select-sm` - Small select
- `ds-select-lg` - Large select

#### Checkboxes & Radios
- `ds-checkbox` - Checkbox input
- `ds-radio` - Radio button input

#### Switches
- `ds-switch` - Toggle switch container
- `ds-switch-on` - Active switch state
- `ds-switch-thumb` - Switch thumb element
- `ds-switch-thumb-on` - Active thumb position

#### File Upload
- `ds-file-upload` - Upload drop zone
- `ds-file-upload-active` - Active drag state
- `ds-file-upload-content` - Upload content wrapper
- `ds-file-upload-icon` - Upload icon
- `ds-file-upload-text` - Upload text
- `ds-file-upload-hint` - Upload hint text

### Badges & Chips

#### Badges
- `ds-badge` - Base badge
- `ds-badge-default` - Default badge
- `ds-badge-primary` - Primary badge
- `ds-badge-success` - Success badge
- `ds-badge-warning` - Warning badge
- `ds-badge-error` - Error badge
- `ds-badge-info` - Info badge

#### Chips/Tags
- `ds-chip` - Base chip/tag
- `ds-chip-primary` - Primary colored chip
- `ds-chip-removable` - Chip with remove button
- `ds-chip-remove` - Remove button for chips

### Alerts & Notifications

#### Alert Boxes
- `ds-alert-info` - Info alert box
- `ds-alert-success` - Success alert
- `ds-alert-warning` - Warning alert
- `ds-alert-error` - Error alert

#### Callouts/Banners
- `ds-callout` - Base callout
- `ds-callout-default` - Default callout
- `ds-callout-info` - Info callout
- `ds-callout-success` - Success callout
- `ds-callout-warning` - Warning callout
- `ds-callout-danger` - Danger callout
- `ds-callout-title` - Callout title
- `ds-callout-content` - Callout content

#### Toast Notifications
- `ds-toast-container` - Toast container positioning
- `ds-toast` - Base toast notification
- `ds-toast-success` - Success toast
- `ds-toast-error` - Error toast
- `ds-toast-warning` - Warning toast
- `ds-toast-info` - Info toast
- `ds-toast-title` - Toast title
- `ds-toast-description` - Toast description

### Interactive Components

#### Navigation
- `ds-nav-container` - Navigation container
- `ds-nav-content` - Navigation content wrapper
- `ds-nav-desktop` - Desktop navigation
- `ds-nav-mobile` - Mobile navigation
- `ds-nav-logo-group` - Logo group container
- `ds-logo-icon` - Logo icon wrapper
- `ds-logo-text` - Logo text
- `ds-nav-button-active` - Active nav button
- `ds-nav-button-inactive` - Inactive nav button

#### Dropdowns
- `ds-dropdown-trigger` - Dropdown trigger with hover
- `ds-dropdown-content` - Dropdown content panel
- `ds-dropdown-panel` - Dropdown panel wrapper
- `ds-dropdown-item-active` - Active dropdown item
- `ds-dropdown-item-inactive` - Inactive dropdown item

#### Modals
- `ds-modal-backdrop` - Modal background overlay
- `ds-modal` - Modal container
- `ds-modal-header` - Modal header section
- `ds-modal-title` - Modal title
- `ds-modal-body` - Modal content body
- `ds-modal-footer` - Modal footer with actions
- `ds-modal-close` - Modal close button

#### Tabs
- `ds-tabs` - Tab container
- `ds-tab-active` - Active tab

#### Accordions
- `ds-accordion` - Accordion container
- `ds-accordion-item` - Accordion item
- `ds-accordion-trigger` - Accordion trigger
- `ds-accordion-content` - Accordion content

#### Tooltips
- `ds-tooltip` - Base tooltip
- `ds-tooltip-visible` - Visible tooltip
- `ds-tooltip-top`, `ds-tooltip-bottom`, `ds-tooltip-left`, `ds-tooltip-right` - Positions

#### Breadcrumbs
- `ds-breadcrumb` - Breadcrumb container
- `ds-breadcrumb-item` - Breadcrumb item
- `ds-breadcrumb-separator` - Separator
- `ds-breadcrumb-current` - Current page

#### Pagination
- `ds-pagination` - Pagination container
- `ds-pagination-item` - Page item
- `ds-pagination-active` - Active page
- `ds-pagination-disabled` - Disabled item
- `ds-pagination-ellipsis` - Ellipsis indicator

#### Progress
- `ds-progress` - Progress bar container
- `ds-progress-bar` - Progress bar fill
- `ds-progress-sm` - Small progress bar
- `ds-progress-lg` - Large progress bar

#### Sliders
- `ds-slider` - Slider container
- `ds-slider-track` - Slider track
- `ds-slider-range` - Slider filled range
- `ds-slider-thumb` - Slider thumb/handle

#### Steppers
- `ds-stepper` - Stepper container
- `ds-stepper-item` - Step item
- `ds-stepper-separator` - Step separator
- `ds-stepper-trigger` - Step trigger
- `ds-stepper-active` - Active step
- `ds-stepper-completed` - Completed step

#### Avatars
- `ds-avatar` - Avatar container
- `ds-avatar-sm`, `ds-avatar-md`, `ds-avatar-lg`, `ds-avatar-xl` - Sizes
- `ds-avatar-image` - Avatar image
- `ds-avatar-fallback` - Fallback initials

### Utilities

#### Loading States
- `ds-loading-state` - Loading state container
- `ds-empty-state` - Empty state container
- `ds-skeleton` - Loading skeleton
- `ds-spinner` - Loading spinner
- `ds-spinner-lg` - Large spinner

#### Visual Effects
- `ds-divider` - Horizontal divider
- `ds-truncate` - Text truncation
- `ds-transition` - Smooth transitions
- `ds-hover-scale` - Scale on hover
- `ds-hover-bg` - Background on hover

#### Display
- `ds-block`, `ds-inline-block`, `ds-inline`, `ds-hidden`
- `ds-sm:block`, `ds-sm:hidden` - Small screen
- `ds-md:block`, `ds-md:hidden` - Medium screen
- `ds-lg:block`, `ds-lg:hidden` - Large screen

#### Dimensions
- `ds-w-full`, `ds-h-full` - Full width/height
- `ds-min-h-screen` - Minimum screen height
- `ds-max-w-lg` through `ds-max-w-7xl` - Max widths

#### Overflow
- `ds-overflow-hidden`, `ds-overflow-auto`
- `ds-overflow-x-auto`, `ds-overflow-y-auto`

#### Border Radius
- `ds-rounded` through `ds-rounded-2xl`
- `ds-rounded-full` - Circle/pill shape
- `ds-rounded-none` - No radius

#### Shadows
- `ds-shadow` through `ds-shadow-2xl`
- `ds-shadow-none` - No shadow

#### Opacity
- `ds-opacity-0` through `ds-opacity-100`

#### Cursors
- `ds-cursor-pointer`, `ds-cursor-not-allowed`
- `ds-cursor-wait`, `ds-cursor-default`

#### Code Blocks
- `ds-code-block` - Code block container
- `ds-code-inline` - Inline code
- `ds-code-copy` - Copy button for code

#### Animations
- `ds-animate-in` - Animation wrapper
- `ds-fade-in` - Fade in animation
- `ds-scale-in` - Scale in animation
- `ds-slide-in-from-right` - Slide from right

#### Semantic Colors
- `ds-accent-primary`, `ds-accent-success`, `ds-accent-warning`, `ds-accent-danger`
- `ds-bg-accent-*-soft` - Soft background variants
- `ds-icon-primary`, `ds-icon-success`, `ds-icon-warning`, `ds-icon-danger`, `ds-icon-info`, `ds-icon-muted`

#### Feature Cards
- `ds-feature-card` - Feature card container
- `ds-feature-icon` - Feature icon wrapper
- `ds-feature-content` - Feature content
- `ds-feature-title` - Feature title
- `ds-feature-description` - Feature description

#### Metric Cards
- `ds-metric-card` - Metric display card
- `ds-metric-value` - Metric value
- `ds-metric-label` - Metric label
- `ds-metric-trend` - Trend indicator
- `ds-metric-grid` - Grid for metrics

#### Hero Sections
- `ds-hero` - Hero section container
- `ds-hero-content` - Hero content wrapper
- `ds-hero-title` - Hero title
- `ds-hero-description` - Hero description
- `ds-hero-actions` - Hero action buttons

## Framework Examples

### React

```tsx
function ReactExample() {
  return (
    <div className="ds-card-padded">
      <h3 className="ds-h3">React Component</h3>
      <div className="ds-stack">
        <input className="ds-input" placeholder="Enter text" />
        <button className="ds-btn-primary">Submit</button>
      </div>
    </div>
  );
}
```

### Vue

```vue
<template>
  <div class="ds-card-padded">
    <h3 class="ds-h3">Vue Component</h3>
    <div class="ds-stack">
      <input class="ds-input" placeholder="Enter text" />
      <button class="ds-btn-primary">Submit</button>
    </div>
  </div>
</template>
```

### Vanilla JavaScript

```javascript
function createCard() {
  const card = document.createElement('div');
  card.className = 'ds-card-padded ds-card-elevated';

  const title = document.createElement('h3');
  title.className = 'ds-h3';
  title.textContent = 'Vanilla JS Component';

  const button = document.createElement('button');
  button.className = 'ds-btn-primary';
  button.textContent = 'Click Me';

  card.appendChild(title);
  card.appendChild(button);
  return card;
}
```

## Best Practices

### DO ✅

1. **Use CSS classes directly** - They're always available
2. **Prefix with `ds-`** - All design system classes use this prefix
3. **Combine classes** - `className="ds-card-padded ds-card-elevated"`
4. **Import explicitly** - If using tokens, import the ES module
5. **Check availability** - Handle cases where tokens might not load

### DON'T ❌

1. **Don't access window/global** - No global pollution
2. **Don't assume tokens exist** - They're optional
3. **Don't create wrapper components** - Use classes directly
4. **Don't override ds- classes** - Create new classes instead
5. **Don't inject via services** - MFEs import what they need

## Migration from Components

If migrating from component-based design systems:

```tsx
// Old (component-based)
import { Card, Button } from '@company/design-system';
<Card elevated>
  <Button variant="primary">Click</Button>
</Card>

// New (class-based)
// No imports needed for CSS
<div className="ds-card-padded ds-card-elevated">
  <button className="ds-btn-primary">Click</button>
</div>
```

## TypeScript Support

The design system is CSS-only, so TypeScript support is minimal. You can optionally create type-safe constants:

```typescript
// Type-safe class name constants (optional)
const DESIGN_SYSTEM_CLASSES = {
  card: 'ds-card-padded ds-card-elevated',
  button: {
    primary: 'ds-btn-primary',
    secondary: 'ds-btn-secondary',
  },
} as const;

// Use in components
function MyComponent() {
  return (
    <div className={DESIGN_SYSTEM_CLASSES.card}>
      <button className={DESIGN_SYSTEM_CLASSES.button.primary}>
        Click
      </button>
    </div>
  );
}
```

## Environment Configuration

### Development

The container application automatically includes the design system CSS:

```typescript
// In container's main.tsx or index.css
import '@mfe/design-system/dist/design-system.css';
```

### Production

The design system CSS is bundled with the container application during build.

## Customization

The design system uses CSS variables for theming. These can be overridden in the container:

```css
:root {
  /* Override in container's CSS */
  --ds-color-primary: #007bff;
  --ds-spacing-unit: 0.25rem;
}
```

## Troubleshooting

### Classes not working?

- Check that container includes the CSS file
- Verify you're using correct class names (ds- prefix)
- Check browser console for 404 on CSS file

### TypeScript autocomplete?

- CSS classes don't have built-in TypeScript support
- Consider creating a constants file with class names for type safety
- VS Code extensions like "Tailwind CSS IntelliSense" can help with autocomplete

## Summary

The design system provides:

- **500+ CSS Utility Classes** - Comprehensive set for all UI needs
- **Zero global pollution** - No window/global variables
- **Framework agnostic** - Works with React, Vue, Solid.js, Vanilla JS
- **CSS-first approach** - Classes always available
- **Pure CSS approach** - No JavaScript required
- **Container-provided** - CSS loaded once, available to all MFEs
- **Cross-framework compatibility** - Designed for React, Vue, Solid.js, and Vanilla JS containers
- **Complete component systems** - Buttons, modals, forms, navigation, and more
- **Responsive utilities** - Mobile-first with breakpoint variants
- **Dark mode support** - Full dark mode compatibility
- **Semantic color system** - Consistent color usage across components

This approach ensures clean, maintainable code without the complexity of service injection or component libraries, while providing everything needed for modern web applications.
