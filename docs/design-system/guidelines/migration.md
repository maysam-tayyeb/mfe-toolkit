# Migration Guide

## Overview

This guide helps you migrate from custom components, ShadCN UI, or inline styles to the MFE Design System.

## Migration Checklist

- [ ] Identify all custom components
- [ ] Map to design system equivalents
- [ ] Update imports and class names
- [ ] Remove redundant CSS
- [ ] Test responsive behavior
- [ ] Verify dark mode support

## Component Mapping

### From ShadCN UI

| ShadCN Component          | Design System Equivalent             |
| ------------------------- | ------------------------------------ |
| `<Card>` from ui/card     | `<div class="ds-card">`              |
| `<Button>` from ui/button | `<button class="ds-button-primary">` |
| `<Badge>` from ui/badge   | `<span class="ds-badge">`            |
| `<Alert>` from ui/alert   | `<div class="ds-alert">`             |

### From Custom Components

```tsx
// Before: Custom InfoBlock
<InfoBlock
  icon={icon}
  title={title}
  description={desc}
  customClass="my-info"
/>

// After: Design System
<div class="ds-info-block">
  <div class="ds-info-block-icon">{icon}</div>
  <div class="ds-info-block-content">
    <h3 class="ds-info-block-title">{title}</h3>
    <p class="ds-info-block-description">{desc}</p>
  </div>
</div>
```

## Class Name Updates

### Typography

```css
/* Before */
.heading-lg { font-size: 24px; font-weight: 700; }
.text-secondary { color: #666; }

/* After */
.ds-page-title
.ds-text-muted
```

### Spacing

```css
/* Before */
.card { padding: 24px; margin-bottom: 16px; }

/* After */
.ds-card /* includes standard padding */
.mb-4    /* margin-bottom utility */
```

### Colors

```css
/* Before */
.primary-btn { background: #3B82F6; }
.error-text { color: #EF4444; }

/* After */
.ds-button-primary
.ds-text-error
```

## Step-by-Step Migration

### 1. Install Design System

```bash
# For React projects
npm install @mfe/design-system-react

# CSS is provided by container - no installation needed
```

### 2. Update Imports

```tsx
// Before
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// After (React)
import { Card, Button } from '@mfe/design-system-react';

// Or use CSS classes directly (recommended)
// No imports needed!
```

### 3. Update Component Usage

```tsx
// Before: ShadCN Card
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>

// After: Design System
<div class="ds-card">
  <h3 class="ds-card-title mb-4">Title</h3>
  <div>Content here</div>
</div>
```

### 4. Remove Custom CSS

```css
/* Remove these custom styles */
.custom-card {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Use design system class instead */
.ds-card
```

## Common Patterns

### Form Migration

```tsx
// Before: Custom form styles
<form className="space-y-4 p-6 border rounded">
  <div className="form-group">
    <label className="form-label">Email</label>
    <input className="form-input" />
  </div>
</form>

// After: Design System
<form className="ds-card ds-stack-md">
  <div>
    <label className="text-sm font-medium mb-1">Email</label>
    <input className="w-full" />
  </div>
</form>
```

### Button Groups

```tsx
// Before: Custom button group
<div className="btn-group">
  <button className="btn btn-primary">Save</button>
  <button className="btn btn-secondary">Cancel</button>
</div>

// After: Design System
<div className="flex gap-2">
  <button className="ds-button-primary">Save</button>
  <button className="ds-button-outline">Cancel</button>
</div>
```

## Testing After Migration

1. **Visual Regression**
   - Compare before/after screenshots
   - Check all responsive breakpoints
   - Verify dark mode

2. **Functionality**
   - Test all interactive elements
   - Verify form submissions
   - Check event handlers

3. **Performance**
   - Measure bundle size reduction
   - Check render performance
   - Verify CSS deduplication

## Troubleshooting

### Styles Not Applied

- Ensure container provides design system CSS
- Check class name spelling (ds- prefix)
- Verify no CSS specificity conflicts

### React Components Not Found

- Install @mfe/design-system-react
- Check import paths
- Ensure React 19 compatibility

### Layout Issues

- Use design system spacing classes
- Check responsive utilities
- Verify grid/flex patterns

## Benefits After Migration

✅ **Consistency** - Unified look across all MFEs
✅ **Performance** - Smaller bundles, shared CSS
✅ **Maintenance** - Single source of truth
✅ **Dark Mode** - Automatic support
✅ **Accessibility** - Built-in a11y features
✅ **Documentation** - Comprehensive guides

## Need Help?

- Check component documentation in `/docs/design-system/components/`
- Review foundation docs for spacing, colors, typography
- See examples in container application
- Open an issue for migration problems
