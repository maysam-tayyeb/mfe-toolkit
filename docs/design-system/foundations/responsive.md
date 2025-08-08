# Responsive Design

## Overview

The MFE Design System provides responsive utilities and patterns that ensure consistent behavior across all screen sizes.

## Breakpoints

```css
sm:  640px   /* Small devices */
md:  768px   /* Medium devices */
lg:  1024px  /* Large devices */
xl:  1280px  /* Extra large devices */
2xl: 1536px  /* 2X large devices */
```

## Responsive Grid Classes

### Column Grids

```css
.ds-grid-1 {
  @apply grid grid-cols-1;
}
.ds-grid-2 {
  @apply grid grid-cols-1 md:grid-cols-2;
}
.ds-grid-3 {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3;
}
.ds-grid-4 {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4;
}
```

### Responsive Patterns

```html
<!-- Stack on mobile, grid on desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="ds-card">Item 1</div>
  <div class="ds-card">Item 2</div>
  <div class="ds-card">Item 3</div>
</div>

<!-- Hide on mobile -->
<div class="hidden md:block">Desktop only content</div>

<!-- Different padding by screen size -->
<div class="p-4 md:p-6 lg:p-8">Responsive padding</div>
```

## Container Widths

```css
.ds-container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.ds-container-narrow {
  @apply max-w-4xl mx-auto px-4 sm:px-6;
}

.ds-container-wide {
  @apply max-w-full mx-auto px-4 sm:px-6 lg:px-8;
}
```

## Mobile-First Approach

Always design for mobile first, then enhance for larger screens:

```css
/* Base (mobile) styles */
.component {
  padding: 1rem;
  font-size: 14px;
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    padding: 1.5rem;
    font-size: 16px;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    padding: 2rem;
  }
}
```

## Common Responsive Patterns

### Navigation

```html
<!-- Mobile: Hamburger, Desktop: Full menu -->
<nav class="flex items-center justify-between">
  <div class="md:hidden">
    <!-- Hamburger menu -->
  </div>
  <div class="hidden md:flex gap-4">
    <!-- Desktop menu items -->
  </div>
</nav>
```

### Cards Grid

```html
<!-- Responsive card layout -->
<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  <div class="ds-card">Card 1</div>
  <div class="ds-card">Card 2</div>
  <div class="ds-card">Card 3</div>
  <div class="ds-card">Card 4</div>
</div>
```

### Sidebar Layout

```html
<!-- Stacked on mobile, sidebar on desktop -->
<div class="flex flex-col lg:flex-row gap-6">
  <aside class="lg:w-64">
    <!-- Sidebar content -->
  </aside>
  <main class="flex-1">
    <!-- Main content -->
  </main>
</div>
```

## Best Practices

1. **Mobile-first development** - Start small, enhance up
2. **Test at all breakpoints** - Don't assume, verify
3. **Maintain touch targets** - 44x44px minimum on mobile
4. **Readable line lengths** - 45-75 characters ideal
5. **Progressive disclosure** - Show less on mobile, more on desktop
