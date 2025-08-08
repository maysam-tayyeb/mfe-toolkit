# InfoBlock Component

## Overview

InfoBlocks display structured information with icons, titles, and descriptions. Commonly used for feature highlights, stats, or informational sections.

## CSS Structure

```html
<div class="ds-info-block">
  <div class="ds-info-block-icon">
    <svg><!-- Icon --></svg>
  </div>
  <div class="ds-info-block-content">
    <h3 class="ds-info-block-title">Title</h3>
    <p class="ds-info-block-description">Description text</p>
  </div>
</div>
```

## Variants

```css
.ds-info-block-horizontal { /* Icon beside content */ }
.ds-info-block-centered   { /* Centered alignment */ }
.ds-info-block-compact    { /* Smaller spacing */ }
```

## React Component

```tsx
import { InfoBlock } from '@mfe/design-system-react';

<InfoBlock
  icon={<IconComponent />}
  title="Feature Name"
  description="Feature description"
  variant="horizontal"
/>
```

## Best Practices

1. **Consistent icons** - Use same icon style/size
2. **Brief content** - Keep descriptions concise
3. **Visual balance** - Align multiple blocks
4. **Semantic HTML** - Use appropriate heading levels