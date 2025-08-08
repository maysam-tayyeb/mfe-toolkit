# Card Component

## Overview

Cards are container components that group related content and actions. They provide visual hierarchy and organization to interfaces.

## CSS Classes

### Base Card
```css
.ds-card {
  @apply border rounded-lg p-6 bg-card;
}
```

### Variants
```css
.ds-card-compact  { @apply p-4; }           /* Less padding */
.ds-card-padded   { @apply p-8; }           /* More padding */
.ds-card-elevated { @apply shadow-md; }     /* With shadow */
.ds-card-interactive { 
  @apply hover:shadow-lg transition-shadow cursor-pointer;
}
```

## Usage

### Basic Card
```html
<div class="ds-card">
  <h3 class="ds-card-title">Card Title</h3>
  <p class="ds-text-muted">Card description or content goes here.</p>
</div>
```

### Card with Actions
```html
<div class="ds-card">
  <div class="flex justify-between items-start mb-4">
    <h3 class="ds-card-title">Settings</h3>
    <button class="ds-button-ghost">Edit</button>
  </div>
  <p class="text-sm mb-4">Configure your preferences</p>
  <div class="flex gap-2">
    <button class="ds-button-primary">Save</button>
    <button class="ds-button-outline">Cancel</button>
  </div>
</div>
```

### Interactive Card
```html
<div class="ds-card ds-card-interactive" onclick="handleClick()">
  <h3 class="ds-card-title">Click me</h3>
  <p class="text-sm">This entire card is clickable</p>
</div>
```

## React Component

```tsx
import { Card } from '@mfe/design-system-react';

<Card variant="elevated">
  <h3 class="ds-card-title">React Card</h3>
  <p>Content goes here</p>
</Card>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'default' \| 'compact' \| 'elevated' \| 'interactive' | 'default' | Card style variant |
| className | string | '' | Additional CSS classes |
| onClick | function | - | Click handler (interactive variant) |

## Examples

### Stats Card
```html
<div class="ds-card-compact">
  <div class="flex justify-between items-center">
    <div>
      <p class="ds-text-xs ds-text-muted">Total Users</p>
      <p class="text-2xl font-bold">1,234</p>
    </div>
    <div class="text-green-500">
      <svg><!-- Icon --></svg>
    </div>
  </div>
</div>
```

### Feature Card
```html
<div class="ds-card">
  <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
    <svg class="text-primary"><!-- Icon --></svg>
  </div>
  <h3 class="ds-card-title mb-2">Feature Name</h3>
  <p class="text-sm text-muted-foreground">
    Description of the feature and its benefits.
  </p>
</div>
```

## Accessibility

- Use semantic HTML (article, section) when appropriate
- Ensure interactive cards have proper focus states
- Provide keyboard navigation for clickable cards
- Include appropriate ARIA labels

## Best Practices

1. **Consistent padding** - Use variant classes, not custom padding
2. **Clear hierarchy** - Use ds-card-title for headings
3. **Appropriate elevation** - Reserve shadows for important cards
4. **Group related content** - One topic per card
5. **Responsive design** - Cards should stack on mobile