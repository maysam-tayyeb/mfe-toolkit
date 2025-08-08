# Spacing System

## Overview

The MFE Design System uses a consistent 4px-based spacing scale that creates visual rhythm and hierarchy throughout the interface.

## Spacing Scale

```css
0:  0px     /* No spacing */
1:  0.25rem /* 4px - Tight */
2:  0.5rem  /* 8px - Compact */
3:  0.75rem /* 12px - Comfortable */
4:  1rem    /* 16px - Normal */
5:  1.25rem /* 20px - Relaxed */
6:  1.5rem  /* 24px - Spacious */
8:  2rem    /* 32px - Wide */
10: 2.5rem  /* 40px - Very wide */
12: 3rem    /* 48px - Extra wide */
```

## Semantic Spacing Classes

### Page Layout

```css
.ds-page {
  @apply max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6;
}
```

### Cards

```css
.ds-card {
  @apply p-6;
} /* Standard padding */
.ds-card-compact {
  @apply p-4;
} /* Compact variant */
.ds-card-padded {
  @apply p-8;
} /* Spacious variant */
```

### Stacks (Vertical Spacing)

```css
.ds-stack-xs {
  @apply space-y-1;
} /* 4px between items */
.ds-stack-sm {
  @apply space-y-2;
} /* 8px between items */
.ds-stack {
  @apply space-y-3;
} /* 12px between items */
.ds-stack-md {
  @apply space-y-4;
} /* 16px between items */
.ds-stack-lg {
  @apply space-y-6;
} /* 24px between items */
```

### Grids (Gap Spacing)

```css
.ds-grid-tight {
  @apply gap-2;
} /* 8px gaps */
.ds-grid-compact {
  @apply gap-3;
} /* 12px gaps */
.ds-grid {
  @apply gap-4;
} /* 16px gaps */
.ds-grid-relaxed {
  @apply gap-6;
} /* 24px gaps */
.ds-grid-wide {
  @apply gap-8;
} /* 32px gaps */
```

## Common Patterns

### Card with Content

```html
<div class="ds-card">
  <h2 class="ds-card-title mb-2">Card Title</h2>
  <p class="ds-text-muted mb-4">Description text</p>
  <div class="ds-stack-sm">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
  </div>
</div>
```

### Form Layout

```html
<form class="ds-stack-md">
  <div>
    <label class="text-sm font-medium mb-1">Name</label>
    <input class="w-full" />
  </div>
  <div>
    <label class="text-sm font-medium mb-1">Email</label>
    <input class="w-full" />
  </div>
  <button class="ds-button-primary mt-4">Submit</button>
</form>
```

### Grid Layout

```html
<div class="ds-grid-3 ds-grid-relaxed">
  <div class="ds-card">Content 1</div>
  <div class="ds-card">Content 2</div>
  <div class="ds-card">Content 3</div>
</div>
```

## Best Practices

1. **Use semantic classes** instead of arbitrary spacing
2. **Maintain consistency** within sections
3. **Create visual hierarchy** with spacing
4. **Consider mobile** - reduce spacing on small screens
5. **Group related items** with tighter spacing
