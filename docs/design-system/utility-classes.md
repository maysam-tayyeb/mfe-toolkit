# Design System Utility Classes Reference

The MFE platform design system provides over 500 utility classes for building consistent, cross-framework user interfaces. All classes are prefixed with `ds-` to avoid global pollution.

## Quick Start

```html
<!-- Basic page layout -->
<div class="ds-page">
  <h1 class="ds-page-title">Welcome</h1>
  <div class="ds-grid ds-grid-cols-3 ds-gap-4">
    <div class="ds-card-padded">Content</div>
  </div>
</div>
```

## Layout System

### Container Classes
- `ds-page` - Centered page container with max-width
- `ds-container` - Generic container
- `ds-hero` - Hero section
- `ds-hero-gradient` - Hero with gradient background

### Grid System
```html
<div class="ds-grid ds-grid-cols-2 ds-gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
</div>
```

- `ds-grid` - Grid container
- `ds-grid-cols-[1-6]` - Number of columns
- `ds-gap-[1-8]` - Gap between items

### Responsive Grid
- `ds-sm:grid-cols-2` - 2 columns on small screens
- `ds-md:grid-cols-3` - 3 columns on medium screens
- `ds-lg:grid-cols-4` - 4 columns on large screens

### Flexbox
- `ds-flex` - Flex container
- `ds-flex-row`, `ds-flex-col` - Direction
- `ds-flex-wrap` - Wrap items
- `ds-items-start`, `ds-items-center`, `ds-items-end` - Align items
- `ds-justify-start`, `ds-justify-center`, `ds-justify-between` - Justify content

## Typography

### Headings
- `ds-page-title` - Main page title
- `ds-section-title` - Section headers
- `ds-card-title` - Card titles

### Text Sizes
- `ds-text-xs` - Extra small
- `ds-text-sm` - Small
- `ds-text-base` - Base size
- `ds-text-lg` - Large
- `ds-text-xl` - Extra large
- `ds-text-2xl` - 2x large
- `ds-text-3xl` - 3x large

### Font Weights
- `ds-font-normal` - Normal weight
- `ds-font-medium` - Medium weight
- `ds-font-semibold` - Semi-bold
- `ds-font-bold` - Bold

### Text Utilities
- `ds-text-left`, `ds-text-center`, `ds-text-right` - Alignment
- `ds-text-muted` - Muted text color
- `ds-truncate` - Truncate text with ellipsis
- `ds-break-words` - Break long words

## Components

### Cards
```html
<div class="ds-card-padded">
  <h3 class="ds-card-title">Card Title</h3>
  <p>Card content</p>
</div>
```

- `ds-card` - Basic card
- `ds-card-padded` - Card with padding
- `ds-card-compact` - Compact card
- `ds-card-elevated` - Card with shadow

### Buttons
```html
<button class="ds-btn-primary">Primary</button>
<button class="ds-btn-secondary">Secondary</button>
<button class="ds-btn-outline">Outline</button>
```

#### Button Variants
- `ds-btn-primary` - Primary action
- `ds-btn-secondary` - Secondary action
- `ds-btn-outline` - Outline style
- `ds-btn-ghost` - Ghost button
- `ds-btn-danger` - Danger/destructive
- `ds-btn-success` - Success action
- `ds-btn-warning` - Warning action

#### Button Sizes
- `ds-btn-sm` - Small button
- `ds-btn-lg` - Large button

### Badges
```html
<span class="ds-badge">Default</span>
<span class="ds-badge-info">Info</span>
```

- `ds-badge` - Default badge
- `ds-badge-info` - Info badge
- `ds-badge-success` - Success badge
- `ds-badge-warning` - Warning badge
- `ds-badge-danger` - Danger badge

### Forms
- `ds-input` - Text input
- `ds-select` - Select dropdown
- `ds-textarea` - Textarea
- `ds-checkbox` - Checkbox
- `ds-radio` - Radio button
- `ds-switch` - Toggle switch

### Modals
```html
<div class="ds-modal-backdrop">
  <div class="ds-modal">
    <div class="ds-modal-header">
      <h2 class="ds-modal-title">Title</h2>
    </div>
    <div class="ds-modal-body">Content</div>
    <div class="ds-modal-footer">
      <button class="ds-btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

### Alerts
```html
<div class="ds-alert">
  <p>Alert message</p>
</div>
```

- `ds-alert` - Default alert
- `ds-alert-info` - Info alert
- `ds-alert-success` - Success alert
- `ds-alert-warning` - Warning alert
- `ds-alert-danger` - Danger alert

## Spacing

### Margins
- `ds-m-[0-4]` - All sides
- `ds-mt-[0-6]` - Top
- `ds-mb-[0-6]` - Bottom
- `ds-ml-[0-4]` - Left
- `ds-mr-[0-4]` - Right
- `ds-mx-auto` - Horizontal auto
- `ds-my-[1-4]` - Vertical

### Padding
- `ds-p-[0-6]` - All sides
- `ds-px-[2-6]` - Horizontal
- `ds-py-[1-4]` - Vertical
- `ds-pt-[3-4]` - Top
- `ds-pb-4` - Bottom

### Space Between
- `ds-space-x-[1-4]` - Horizontal space
- `ds-space-y-[1-6]` - Vertical space

## Width & Height

### Width
- `ds-w-full` - Full width
- `ds-w-auto` - Auto width
- `ds-w-[1-16]` - Fixed widths
- `ds-w-1/2`, `ds-w-1/3`, `ds-w-2/3`, `ds-w-1/4`, `ds-w-3/4` - Fractional widths

### Height
- `ds-h-full` - Full height
- `ds-h-screen` - Screen height
- `ds-h-[1-16]` - Fixed heights
- `ds-min-h-screen` - Minimum screen height
- `ds-max-h-96` - Maximum height

## Position & Display

### Position
- `ds-relative` - Relative positioning
- `ds-absolute` - Absolute positioning
- `ds-fixed` - Fixed positioning
- `ds-sticky` - Sticky positioning
- `ds-top-0`, `ds-right-0`, `ds-bottom-0`, `ds-left-0` - Position values

### Display
- `ds-block` - Block display
- `ds-inline-block` - Inline block
- `ds-inline` - Inline
- `ds-hidden` - Hidden

### Z-Index
- `ds-z-0` to `ds-z-50` - Z-index layers

## Visual Effects

### Borders
- `ds-border` - Default border
- `ds-border-2` - 2px border
- `ds-border-t`, `ds-border-b`, `ds-border-l`, `ds-border-r` - Directional borders
- `ds-rounded` - Default radius
- `ds-rounded-md`, `ds-rounded-lg` - Medium/large radius
- `ds-rounded-full` - Full radius

### Shadows
- `ds-shadow-sm` - Small shadow
- `ds-shadow` - Default shadow
- `ds-shadow-md` - Medium shadow
- `ds-shadow-lg` - Large shadow

### Opacity
- `ds-opacity-0` - Fully transparent
- `ds-opacity-25`, `ds-opacity-50`, `ds-opacity-75` - Partial opacity
- `ds-opacity-100` - Fully opaque

### Transitions
- `ds-transition-all` - All properties
- `ds-transition-colors` - Color transitions
- `ds-transition-opacity` - Opacity transitions
- `ds-duration-200`, `ds-duration-300` - Duration

## States & Interactions

### Hover Effects
- `ds-hover-scale` - Scale on hover
- `ds-hover-lift` - Lift effect on hover
- `ds-hover-bg` - Background change on hover

### Loading States
- `ds-loading-state` - Loading container
- `ds-spinner` - Loading spinner
- `ds-spinner-lg` - Large spinner

### Empty States
- `ds-empty-state` - Empty state container

### Animations
- `ds-animate-in` - Animate in
- `ds-fade-in` - Fade in effect
- `ds-scale-in` - Scale in effect

## Semantic Colors

### Accent Colors
- `ds-accent-primary` - Primary accent
- `ds-accent-success` - Success color
- `ds-accent-warning` - Warning color
- `ds-accent-danger` - Danger color
- `ds-accent-info` - Info color

### Background Variants
- `ds-bg-accent-primary-soft` - Soft primary background
- `ds-bg-accent-success-soft` - Soft success background
- `ds-bg-accent-warning-soft` - Soft warning background
- `ds-bg-accent-danger-soft` - Soft danger background

### Icon Colors
- `ds-icon-primary` - Primary icon color
- `ds-icon-success` - Success icon color
- `ds-icon-warning` - Warning icon color
- `ds-icon-danger` - Danger icon color
- `ds-icon-muted` - Muted icon color

## Responsive Design

All utility classes support responsive variants:

```html
<!-- Hidden on mobile, visible on larger screens -->
<div class="ds-hidden ds-md:block">
  Desktop content
</div>

<!-- Different grid columns at different breakpoints -->
<div class="ds-grid ds-grid-cols-1 ds-sm:grid-cols-2 ds-lg:grid-cols-4">
  <!-- Grid items -->
</div>
```

### Breakpoints
- `ds-sm:*` - Small screens (640px+)
- `ds-md:*` - Medium screens (768px+)
- `ds-lg:*` - Large screens (1024px+)

## Usage Tips

1. **Framework Agnostic**: These classes work with React, Vue, and Vanilla JS
2. **No Global Pollution**: All classes are prefixed with `ds-`
3. **Consistent Styling**: Use these classes for cross-MFE consistency
4. **Responsive First**: Use responsive variants for adaptive layouts
5. **Semantic Naming**: Choose semantic color classes for better maintainability

## Examples

### Complete Card Component
```html
<div class="ds-card-padded ds-card-elevated ds-hover-lift">
  <div class="ds-flex ds-items-center ds-justify-between ds-mb-4">
    <h3 class="ds-card-title">Statistics</h3>
    <span class="ds-badge-success">Active</span>
  </div>
  <div class="ds-grid ds-grid-cols-2 ds-gap-4">
    <div>
      <p class="ds-text-muted ds-text-sm">Total Users</p>
      <p class="ds-text-2xl ds-font-bold">1,234</p>
    </div>
    <div>
      <p class="ds-text-muted ds-text-sm">Active Sessions</p>
      <p class="ds-text-2xl ds-font-bold">567</p>
    </div>
  </div>
  <div class="ds-mt-4 ds-pt-4 ds-border-t">
    <button class="ds-btn-primary ds-w-full">View Details</button>
  </div>
</div>
```

### Responsive Navigation
```html
<nav class="ds-navbar">
  <div class="ds-flex ds-items-center ds-justify-between ds-px-4 ds-py-3">
    <h1 class="ds-text-lg ds-font-bold">Logo</h1>
    <div class="ds-hidden ds-md:flex ds-gap-4">
      <a class="ds-nav-item">Home</a>
      <a class="ds-nav-item-active">Dashboard</a>
      <a class="ds-nav-item">Settings</a>
    </div>
    <button class="ds-btn-ghost ds-md:hidden">Menu</button>
  </div>
</nav>
```