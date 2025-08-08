# Color System

## Overview

The MFE Design System uses a **Modern Blue & Slate** palette with HSL-based color values for maximum flexibility and consistency. All colors support both light and dark modes through CSS custom properties.

## Color Palette

### Primary Colors

#### Blue (Primary)
The main brand color used for primary actions and key UI elements.

```css
--primary: 221.2 83.2% 53.3%;      /* hsl(221, 83%, 53%) - Vibrant Blue */
--primary-foreground: 210 40% 98%; /* White text on primary */
```

**Usage:**
- Primary buttons
- Active navigation items
- Focus states
- Important links

#### Slate (Neutral)
The foundation of our neutral color scale.

```css
--background: 0 0% 100%;           /* White background */
--foreground: 222.2 84% 4.9%;      /* Near-black text */
--muted: 210 40% 96.1%;           /* Light gray backgrounds */
--muted-foreground: 215.4 16.3% 46.9%; /* Gray text */
```

### Semantic Colors

#### Success (Green)
```css
--success: 142 76% 36%;           /* Green for success states */
--success-foreground: 355 100% 100%; /* White text on success */
```

#### Warning (Amber)
```css
--warning: 38 92% 50%;            /* Amber for warnings */
--warning-foreground: 48 96% 89%; /* Dark text on warning */
```

#### Error (Red)
```css
--destructive: 0 84.2% 60.2%;     /* Red for errors */
--destructive-foreground: 210 40% 98%; /* White text on error */
```

#### Info (Blue variant)
```css
--info: 199 89% 48%;              /* Light blue for info */
--info-foreground: 210 40% 98%;   /* White text on info */
```

## CSS Classes

### Background Colors

```css
.ds-bg-primary    { background: hsl(var(--primary)); }
.ds-bg-secondary  { background: hsl(var(--secondary)); }
.ds-bg-muted      { background: hsl(var(--muted)); }
.ds-bg-success    { background: hsl(var(--success)); }
.ds-bg-warning    { background: hsl(var(--warning)); }
.ds-bg-error      { background: hsl(var(--destructive)); }
.ds-bg-info       { background: hsl(var(--info)); }
```

### Text Colors

```css
.ds-text-primary   { color: hsl(var(--primary)); }
.ds-text-muted     { color: hsl(var(--muted-foreground)); }
.ds-text-success   { color: hsl(var(--success)); }
.ds-text-warning   { color: hsl(var(--warning)); }
.ds-text-error     { color: hsl(var(--destructive)); }
.ds-text-info      { color: hsl(var(--info)); }
```

### Border Colors

```css
.ds-border-primary { border-color: hsl(var(--primary)); }
.ds-border-muted   { border-color: hsl(var(--border)); }
.ds-border-success { border-color: hsl(var(--success)); }
.ds-border-warning { border-color: hsl(var(--warning)); }
.ds-border-error   { border-color: hsl(var(--destructive)); }
```

## Dark Mode

The design system automatically supports dark mode through CSS custom properties. When `.dark` class is applied to the root element, colors invert appropriately:

```css
.dark {
  --background: 222.2 84% 4.9%;     /* Dark background */
  --foreground: 210 40% 98%;        /* Light text */
  --muted: 217.2 32.6% 17.5%;      /* Dark muted */
  --muted-foreground: 215 20.2% 65.1%; /* Light muted text */
  
  /* Primary colors remain vibrant in dark mode */
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
}
```

## Usage Examples

### Component with Semantic Colors

```html
<!-- Success message -->
<div class="ds-card ds-bg-success/10 ds-border-success">
  <p class="ds-text-success">✓ Operation completed successfully</p>
</div>

<!-- Error message -->
<div class="ds-card ds-bg-error/10 ds-border-error">
  <p class="ds-text-error">✗ An error occurred</p>
</div>

<!-- Info banner -->
<div class="ds-card ds-bg-info/10 ds-border-info">
  <p class="ds-text-info">ℹ For your information</p>
</div>
```

### Button Variants

```html
<!-- Primary button -->
<button class="ds-button-primary">
  Save Changes
</button>

<!-- Destructive button -->
<button class="ds-button ds-bg-error ds-text-white">
  Delete Item
</button>

<!-- Success button -->
<button class="ds-button ds-bg-success ds-text-white">
  Confirm
</button>
```

## Accessibility

### Color Contrast
All color combinations meet WCAG AA standards:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- Interactive elements: 3:1 contrast ratio

### Color Blindness
- Don't rely solely on color to convey information
- Use icons and text labels alongside color coding
- Test with color blindness simulators

## Best Practices

1. **Use semantic colors** for their intended purpose (success for positive, error for negative)
2. **Maintain consistency** - don't create custom colors outside the system
3. **Test in both modes** - ensure your UI works in light and dark themes
4. **Consider context** - muted colors for less important elements
5. **Accessibility first** - always check contrast ratios

## Color Psychology

- **Blue (Primary)**: Trust, stability, professionalism
- **Green (Success)**: Growth, positivity, confirmation
- **Red (Error)**: Urgency, importance, warning
- **Amber (Warning)**: Caution, attention, notification
- **Slate (Neutral)**: Balance, sophistication, clarity

## Migration Notes

When migrating from custom colors:

1. Replace hex values with HSL variables
2. Use semantic color names instead of color values
3. Update hover/focus states to use opacity modifiers
4. Test dark mode compatibility

```css
/* Old */
.custom-button {
  background: #3B82F6;
  color: white;
}

/* New */
.custom-button {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}
```