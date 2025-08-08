# Typography System

## Overview

The MFE Design System uses a **compact, efficient typography scale** optimized for information density and readability. The system provides consistent text styles across all components and frameworks.

## Type Scale

### Size Scale
Our typography uses a modular scale with clear hierarchy:

```css
text-xs:   0.75rem  (12px)  /* Captions, labels */
text-sm:   0.875rem (14px)  /* Body small, secondary text */
text-base: 1rem     (16px)  /* Default body text */
text-lg:   1.125rem (18px)  /* Large body, small headings */
text-xl:   1.25rem  (20px)  /* Section headings */
text-2xl:  1.5rem   (24px)  /* Page headings */
text-3xl:  1.875rem (30px)  /* Hero headings (rarely used) */
```

### Weight Scale
Limited weights for consistency:

```css
font-normal:   400  /* Body text */
font-medium:   500  /* Emphasized text */
font-semibold: 600  /* Headings, buttons */
font-bold:     700  /* Page titles, important */
```

## Semantic Typography Classes

### Page Level

```css
.ds-page-title {
  @apply text-xl font-bold tracking-tight;
  /* Main page heading */
}

.ds-page-description {
  @apply text-sm text-muted-foreground mt-1;
  /* Page subtitle/description */
}
```

### Section Level

```css
.ds-section-title {
  @apply text-lg font-semibold;
  /* Section headings */
}

.ds-section-description {
  @apply text-sm text-muted-foreground;
  /* Section descriptions */
}
```

### Component Level

```css
.ds-card-title {
  @apply text-base font-semibold;
  /* Card headings */
}

.ds-card-description {
  @apply text-sm text-muted-foreground;
  /* Card descriptions */
}
```

### Utility Classes

```css
.ds-text-small {
  @apply text-sm;
  /* Small body text */
}

.ds-text-muted {
  @apply text-muted-foreground;
  /* De-emphasized text */
}

.ds-text-xs {
  @apply text-xs;
  /* Very small text, labels */
}
```

## Usage Examples

### Page Header

```html
<header>
  <h1 class="ds-page-title">Event Bus Service Demo</h1>
  <p class="ds-page-description">
    Explore cross-MFE communication using the Event Bus pub/sub pattern
  </p>
</header>
```

### Card Component

```html
<div class="ds-card">
  <h2 class="ds-card-title">Analytics Dashboard</h2>
  <p class="ds-card-description">
    View your real-time analytics and metrics
  </p>
  <div class="mt-4">
    <p class="text-sm">Active users: 1,234</p>
    <p class="ds-text-xs ds-text-muted">Updated 5 minutes ago</p>
  </div>
</div>
```

### Section Layout

```html
<section>
  <h2 class="ds-section-title">Service Configuration</h2>
  <p class="ds-section-description">
    Configure your MFE services and dependencies
  </p>
  <!-- Section content -->
</section>
```

### Data Display

```html
<div class="space-y-2">
  <div class="flex justify-between">
    <span class="text-sm font-medium">Status</span>
    <span class="text-sm text-green-600">Active</span>
  </div>
  <div class="flex justify-between">
    <span class="text-sm font-medium">Version</span>
    <span class="text-sm font-mono">v2.1.0</span>
  </div>
  <div class="flex justify-between">
    <span class="text-sm font-medium">Last Updated</span>
    <span class="ds-text-xs ds-text-muted">2 hours ago</span>
  </div>
</div>
```

## Font Families

### System Font Stack
We use system fonts for optimal performance and native feel:

```css
font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
           "Helvetica Neue", Arial, sans-serif;
```

### Monospace (Code)
For code and technical content:

```css
font-mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", 
           Consolas, "Courier New", monospace;
```

## Line Height

Optimized for readability:

```css
leading-none:    1      /* Compact headings */
leading-tight:   1.25   /* Headings */
leading-snug:    1.375  /* Dense text */
leading-normal:  1.5    /* Body text (default) */
leading-relaxed: 1.625  /* Comfortable reading */
leading-loose:   2      /* Very spacious */
```

## Letter Spacing

```css
tracking-tighter: -0.05em  /* Very tight */
tracking-tight:   -0.025em /* Tight (headings) */
tracking-normal:  0        /* Default */
tracking-wide:    0.025em  /* Slightly wide */
tracking-wider:   0.05em   /* Wide (labels) */
tracking-widest:  0.1em    /* Very wide */
```

## Best Practices

### 1. Hierarchy
- Use no more than 3 heading levels per page
- Maintain consistent size relationships
- Don't skip heading levels

### 2. Readability
- Body text: 16px minimum (text-base)
- Line length: 45-75 characters ideal
- Adequate line height for body text (1.5)
- Sufficient contrast (WCAG AA)

### 3. Consistency
- Use semantic classes, not arbitrary sizes
- Maintain weight consistency (semibold for headings)
- Keep decorations minimal (avoid underlines except links)

### 4. Information Density
- Use compact sizes (text-sm) for secondary info
- Leverage text-xs for metadata and timestamps
- Balance density with readability

## Responsive Typography

Typography automatically scales on smaller screens:

```css
/* Mobile adjustments */
@media (max-width: 640px) {
  .ds-page-title {
    @apply text-lg; /* Scale down from text-xl */
  }
  
  .ds-section-title {
    @apply text-base; /* Scale down from text-lg */
  }
}
```

## Accessibility

### Font Size
- Minimum 14px for body text
- User can zoom to 200% without horizontal scroll
- Relative units (rem) for scalability

### Contrast Ratios
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- Always test with tools

### Reading Experience
- Adequate line spacing
- Clear hierarchy
- Consistent patterns

## Common Patterns

### Form Labels
```html
<label class="text-sm font-medium">
  Email Address
  <input type="email" class="mt-1" />
</label>
<span class="ds-text-xs ds-text-muted">
  We'll never share your email
</span>
```

### Status Messages
```html
<div class="flex items-center gap-2">
  <span class="text-sm font-medium">Status:</span>
  <span class="text-sm text-green-600 font-medium">Connected</span>
</div>
```

### Metadata Display
```html
<div class="ds-text-xs ds-text-muted">
  Last updated: 5 minutes ago • Version 2.1.0 • 1.2MB
</div>
```

## Migration Guide

### From Custom Typography
```css
/* Old */
h1 { font-size: 32px; font-weight: 800; }
.subtitle { font-size: 14px; color: #666; }

/* New */
.ds-page-title     /* Use semantic class */
.ds-page-description /* Use semantic class */
```

### From Tailwind Arbitrary Values
```html
<!-- Old -->
<h1 class="text-[28px] font-[600]">Title</h1>

<!-- New -->
<h1 class="ds-page-title">Title</h1>
```