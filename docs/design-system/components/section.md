# Section Component

## Overview

Sections organize page content into logical groups with consistent spacing and optional headers.

## CSS Classes

```css
.ds-section {
  @apply py-8 space-y-6;
}

.ds-section-header {
  @apply mb-6 pb-4 border-b;
}

.ds-section-compact {
  @apply py-4 space-y-3;
}
```

## Usage

```html
<section class="ds-section">
  <div class="ds-section-header">
    <h2 class="ds-section-title">Section Title</h2>
    <p class="ds-section-description">Optional description</p>
  </div>
  <div class="ds-section-content">
    <!-- Section content -->
  </div>
</section>
```

## React Component

```tsx
import { Section } from '@mfe/design-system-react';

<Section title="Settings" description="Manage your preferences">
  {/* Content */}
</Section>
```

## Best Practices

1. **Logical grouping** - One topic per section
2. **Consistent spacing** - Use standard padding
3. **Clear headers** - Descriptive section titles
4. **Responsive** - Stack sections on mobile