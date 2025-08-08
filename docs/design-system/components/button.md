# Button Component

## Overview

Buttons trigger actions and guide users through interfaces. The design system provides consistent button styles across all MFEs.

## CSS Classes

### Variants

```css
.ds-button-primary {
  /* Primary action */
}
.ds-button-secondary {
  /* Secondary action */
}
.ds-button-outline {
  /* Outlined style */
}
.ds-button-ghost {
  /* Minimal style */
}
.ds-button-destructive {
  /* Dangerous actions */
}
```

### Sizes

```css
.ds-button-xs {
  @apply h-7 px-2 text-xs;
}
.ds-button-sm {
  @apply h-8 px-3 text-sm;
}
.ds-button {
  @apply h-9 px-4;
} /* Default */
.ds-button-lg {
  @apply h-10 px-6;
}
```

## Usage

```html
<!-- Primary button -->
<button class="ds-button-primary">Save Changes</button>

<!-- Outlined button -->
<button class="ds-button-outline">Cancel</button>

<!-- Small destructive button -->
<button class="ds-button-destructive ds-button-sm">Delete</button>
```

## React Component

```tsx
import { Button } from '@mfe/design-system-react';

<Button variant="primary" size="sm">
  Click me
</Button>;
```

## Best Practices

1. **One primary button** per section
2. **Clear labels** - Use verbs for actions
3. **Consistent sizing** - Match button sizes in groups
4. **Loading states** - Show feedback for async actions
5. **Accessibility** - Include focus states and ARIA labels
