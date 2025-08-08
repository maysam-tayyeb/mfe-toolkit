# Grid Component

## Overview

Grid components create responsive layouts that automatically adjust based on screen size.

## CSS Classes

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

## Gap Variants

```css
.ds-grid-tight {
  @apply gap-2;
}
.ds-grid-compact {
  @apply gap-3;
}
.ds-grid {
  @apply gap-4;
} /* Default */
.ds-grid-relaxed {
  @apply gap-6;
}
```

## Usage

```html
<!-- 3-column responsive grid -->
<div class="ds-grid-3 ds-grid-relaxed">
  <div class="ds-card">Item 1</div>
  <div class="ds-card">Item 2</div>
  <div class="ds-card">Item 3</div>
</div>
```

## React Component

```tsx
import { Grid } from '@mfe/design-system-react';

<Grid columns={3} gap="relaxed">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>;
```

## Best Practices

1. **Mobile-first** - Single column on mobile
2. **Consistent gaps** - Use predefined gap sizes
3. **Flexible items** - Content should adapt to grid
4. **Limit columns** - Max 4 columns for readability
