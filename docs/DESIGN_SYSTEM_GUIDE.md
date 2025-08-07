# Design System Usage Guide

## Overview

The MFE Design System provides a framework-agnostic set of CSS utilities and optional JavaScript tokens for building consistent UIs across all microfrontends. It follows a **zero global pollution** principle - no window objects, no global variables.

## Architecture

### How It Works

1. **CSS Classes**: Provided globally via container's stylesheet
2. **ES Modules**: Optional tokens for programmatic use
3. **No Service Injection**: MFEs explicitly import what they need
4. **No Global Pollution**: Everything is explicit, no magic

### File Structure

```
/dist/design-system/
├── design-system.css        # Tailwind-based utility classes
├── design-system.esm.js     # ES module with tokens/patterns
├── design-system.d.ts       # TypeScript definitions
└── manifest.json            # Version and metadata
```

## Usage Patterns

### Pattern 1: CSS Classes Only (Recommended)

The simplest approach - just use the CSS classes provided by the container:

```tsx
// No imports needed - classes are in the stylesheet
function MyComponent() {
  return (
    <div className="ds-card-padded ds-card-elevated">
      <h2 className="ds-h2">Hello World</h2>
      <p className="ds-text-muted">This uses design system classes</p>
      <button className="ds-button-primary">Click Me</button>
    </div>
  );
}
```

### Pattern 2: With ES Module Tokens (Optional)

For programmatic access to design tokens:

```tsx
import { useEffect, useState } from 'react';

function MyComponent() {
  const [tokens, setTokens] = useState(null);
  
  useEffect(() => {
    // Explicit import - no globals
    import('http://localhost:8080/design-system/design-system.esm.js')
      .then(module => setTokens(module))
      .catch(() => console.log('Tokens not available'));
  }, []);
  
  // Use tokens programmatically if needed
  const cardClass = tokens?.patterns.card.elevated || 'ds-card-elevated';
  
  return <div className={cardClass}>Content</div>;
}
```

### Pattern 3: Build-Time Import (Monorepo)

If your MFE is in the same monorepo:

```tsx
// Import at build time - bundled with your MFE
import { patterns, classNames } from '@mfe/design-system';

function MyComponent() {
  return (
    <div className={patterns.card.elevated}>
      <button className={classNames.buttonPrimary}>Click</button>
    </div>
  );
}
```

## Available CSS Classes

### Cards
- `ds-card` - Base card style
- `ds-card-padded` - Card with padding
- `ds-card-compact` - Card with less padding
- `ds-card-elevated` - Card with shadow
- `ds-card-interactive` - Card with hover effects

### Buttons
- `ds-button` - Base button (don't use alone)
- `ds-button-primary` - Primary action button
- `ds-button-secondary` - Secondary button
- `ds-button-outline` - Outlined button
- `ds-button-ghost` - Minimal button
- `ds-button-destructive` - Danger/delete button
- `ds-button-sm` - Small size modifier
- `ds-button-lg` - Large size modifier

### Typography
- `ds-h1` through `ds-h4` - Heading levels
- `ds-text-muted` - Muted text color
- `ds-text-small` - Small text size
- `ds-text-xs` - Extra small text

### Layout
- `ds-container` - Max-width container
- `ds-container-narrow` - Narrower container
- `ds-section` - Section with vertical spacing
- `ds-grid-2` - 2 column grid
- `ds-grid-3` - 3 column grid
- `ds-grid-4` - 4 column grid
- `ds-stack` - Vertical spacing between children
- `ds-stack-sm` - Small vertical spacing
- `ds-stack-lg` - Large vertical spacing

### Forms
- `ds-input` - Text input field
- `ds-textarea` - Textarea field
- `ds-label` - Form label
- `ds-form-group` - Form field wrapper

### Badges
- `ds-badge` - Base badge
- `ds-badge-default` - Default badge
- `ds-badge-primary` - Primary badge
- `ds-badge-success` - Success badge
- `ds-badge-warning` - Warning badge
- `ds-badge-error` - Error badge

### Alerts
- `ds-alert-info` - Info alert box
- `ds-alert-success` - Success alert
- `ds-alert-warning` - Warning alert
- `ds-alert-error` - Error alert

### Utilities
- `ds-divider` - Horizontal divider
- `ds-skeleton` - Loading skeleton
- `ds-spinner` - Loading spinner
- `ds-truncate` - Text truncation
- `ds-transition` - Smooth transitions

## Framework Examples

### React
```tsx
function ReactExample() {
  return (
    <div className="ds-card-padded">
      <h3 className="ds-h3">React Component</h3>
      <div className="ds-stack">
        <input className="ds-input" placeholder="Enter text" />
        <button className="ds-button-primary">Submit</button>
      </div>
    </div>
  );
}
```

### Vue
```vue
<template>
  <div class="ds-card-padded">
    <h3 class="ds-h3">Vue Component</h3>
    <div class="ds-stack">
      <input class="ds-input" placeholder="Enter text" />
      <button class="ds-button-primary">Submit</button>
    </div>
  </div>
</template>
```

### Vanilla JavaScript
```javascript
function createCard() {
  const card = document.createElement('div');
  card.className = 'ds-card-padded ds-card-elevated';
  
  const title = document.createElement('h3');
  title.className = 'ds-h3';
  title.textContent = 'Vanilla JS Component';
  
  const button = document.createElement('button');
  button.className = 'ds-button-primary';
  button.textContent = 'Click Me';
  
  card.appendChild(title);
  card.appendChild(button);
  return card;
}
```

## Best Practices

### DO ✅

1. **Use CSS classes directly** - They're always available
2. **Prefix with `ds-`** - All design system classes use this prefix
3. **Combine classes** - `className="ds-card-padded ds-card-elevated"`
4. **Import explicitly** - If using tokens, import the ES module
5. **Check availability** - Handle cases where tokens might not load

### DON'T ❌

1. **Don't access window/global** - No global pollution
2. **Don't assume tokens exist** - They're optional
3. **Don't create wrapper components** - Use classes directly
4. **Don't override ds- classes** - Create new classes instead
5. **Don't inject via services** - MFEs import what they need

## Migration from Components

If migrating from component-based design systems:

```tsx
// Old (component-based)
import { Card, Button } from '@company/design-system';
<Card elevated>
  <Button variant="primary">Click</Button>
</Card>

// New (class-based)
// No imports needed for CSS
<div className="ds-card-padded ds-card-elevated">
  <button className="ds-button-primary">Click</button>
</div>
```

## TypeScript Support

When using the ES module:

```typescript
// Type definition for design tokens
interface DesignTokens {
  patterns: {
    card: Record<string, string>;
    button: Record<string, string>;
    layout: Record<string, string>;
  };
  classNames: Record<string, string>;
  tokens: Record<string, any>;
  version: string;
}

// Import with types
const tokens = await import('http://localhost:8080/design-system/design-system.esm.js') as DesignTokens;
```

## Environment Configuration

### Development
```html
<!-- Container's index.html -->
<link rel="stylesheet" href="http://localhost:8080/design-system/design-system.css">
```

### Production
```html
<!-- Use CDN or production URL -->
<link rel="stylesheet" href="https://cdn.example.com/design-system/1.0.0/design-system.css">
```

## Customization

The design system uses CSS variables for theming. These can be overridden in the container:

```css
:root {
  /* Override in container's CSS */
  --ds-color-primary: #007bff;
  --ds-spacing-unit: 0.25rem;
}
```

## Troubleshooting

### Classes not working?
- Check that container includes the CSS file
- Verify you're using correct class names (ds- prefix)
- Check browser console for 404 on CSS file

### ES module not loading?
- Verify the serve:mfes script is running (port 8080)
- Check CORS settings if loading from different domain
- Module loading is optional - CSS classes work without it

### TypeScript errors?
- Import types from the .d.ts file
- Use type assertions when importing ES module
- Remember: CSS classes don't need TypeScript

## Summary

The design system provides:
- **Zero global pollution** - No window/global variables
- **Framework agnostic** - Works with React, Vue, Vanilla JS
- **CSS-first approach** - Classes always available
- **Optional ES modules** - For programmatic access
- **Explicit imports** - MFEs control their dependencies

This approach ensures clean, maintainable code without the complexity of service injection or component libraries.