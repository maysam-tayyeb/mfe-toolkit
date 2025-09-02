# packages/design-system/CLAUDE.md

## 🚨 DESIGN SYSTEM IS LAW - CRITICAL RULES

**ABSOLUTELY NO UI CHANGES WITHOUT DESIGN SYSTEM UPDATE**

### The Golden Rule

**ANY change of layout and style MUST be done through the design system. Any new UI MUST first update the design system. This is ABSOLUTE.**

### Critical Workflow (MANDATORY)

1. **STOP** - Never add styles to components directly
2. **CHECK** - Look for existing utilities in this package
3. **UPDATE** - If missing, add to `src/styles/index.css`
4. **BUILD** - Run `pnpm build:packages`
5. **USE** - Apply the new `ds-*` classes
6. **COMMIT** - Include both design system and component changes

### What NOT to Do (FORBIDDEN)

```tsx
// ❌ NEVER DO THIS - Inline styles
<div style={{ margin: '10px', padding: '20px' }}>

// ❌ NEVER DO THIS - Custom CSS classes
<div className="my-custom-class">

// ❌ NEVER DO THIS - Tailwind classes not from design system
<div className="bg-blue-500 p-4">

// ✅ ALWAYS DO THIS - Use design system classes
<div className="ds-card ds-p-4 ds-bg-accent-primary-soft">
```

## Architecture

- **Zero-Pollution**: CSS-first with NO global/window variables
- **Prefix**: All classes use `ds-*` prefix
- **Framework-Agnostic**: Works with React, Vue, Solid.js, Vanilla JS
- **500+ Utility Classes**: Complete component and utility system

## Available CSS Classes

### Layout & Containers
- `ds-page`, `ds-card`, `ds-card-padded`, `ds-card-compact`
- `ds-hero`, `ds-hero-gradient`
- `ds-grid`, `ds-grid-cols-[1-6]`
- `ds-flex`, `ds-flex-row`, `ds-flex-col`

### Typography
- `ds-page-title`, `ds-section-title`, `ds-card-title`
- `ds-text-xs`, `ds-text-sm`, `ds-text-lg`, `ds-text-xl`, `ds-text-2xl`, `ds-text-3xl`
- `ds-font-normal`, `ds-font-medium`, `ds-font-semibold`, `ds-font-bold`
- `ds-text-left`, `ds-text-center`, `ds-text-right`

### Components
- **Buttons**: `ds-btn-primary`, `ds-btn-secondary`, `ds-btn-outline`, `ds-btn-ghost`
- **Semantic**: `ds-btn-danger`, `ds-btn-success`, `ds-btn-warning`
- **Forms**: `ds-input`, `ds-select`, `ds-textarea`, `ds-checkbox`, `ds-radio`
- **Modal**: `ds-modal-backdrop`, `ds-modal`, `ds-modal-header`, `ds-modal-body`, `ds-modal-footer`
- **Toast**: `ds-toast-container`, `ds-toast`, `ds-toast-success`, `ds-toast-error`
- **Badges**: `ds-badge`, `ds-badge-info`, `ds-badge-success`, `ds-badge-warning`

### Spacing
- **Margin**: `ds-m-[0-4]`, `ds-mt-*`, `ds-mb-*`, `ds-ml-*`, `ds-mr-*`
- **Padding**: `ds-p-[0-6]`, `ds-px-*`, `ds-py-*`
- **Gap**: `ds-gap-[1-8]`, `ds-space-x-*`, `ds-space-y-*`

### Layout Utilities
- **Width**: `ds-w-full`, `ds-w-auto`, `ds-w-1/2`, `ds-w-1/3`
- **Height**: `ds-h-full`, `ds-h-screen`, `ds-min-h-screen`
- **Flex**: `ds-items-center`, `ds-justify-between`, `ds-flex-wrap`

### Visual Effects
- **Borders**: `ds-border`, `ds-border-2`, `ds-rounded`, `ds-rounded-lg`
- **Shadows**: `ds-shadow-sm`, `ds-shadow`, `ds-shadow-lg`
- **Transitions**: `ds-transition-all`, `ds-transition-colors`
- **Hover**: `ds-hover-scale`, `ds-hover-lift`

### Responsive Utilities
- `ds-sm:*` - Small screens and up
- `ds-md:*` - Medium screens and up
- `ds-lg:*` - Large screens and up

### Semantic Colors
- `ds-accent-primary`, `ds-accent-success`, `ds-accent-warning`, `ds-accent-danger`
- `ds-bg-accent-*-soft` - Soft background variants
- `ds-text-muted` - Muted text

## Usage Examples

```html
<!-- Card with button -->
<div class="ds-card-padded">
  <h2 class="ds-section-title">Title</h2>
  <button class="ds-btn-primary">Action</button>
</div>

<!-- Modal structure -->
<div class="ds-modal-backdrop">
  <div class="ds-modal">
    <div class="ds-modal-header">
      <h2 class="ds-modal-title">Modal</h2>
    </div>
    <div class="ds-modal-body">Content</div>
    <div class="ds-modal-footer">
      <button class="ds-btn-secondary">Cancel</button>
      <button class="ds-btn-primary">Save</button>
    </div>
  </div>
</div>
```

## Development

### File Structure
- `src/styles/index.css` - All CSS utilities
- `src/tokens/index.ts` - Design tokens
- `dist/index.css` - Built CSS (loaded by container)

### Adding New Utilities

1. Edit `src/styles/index.css`
2. Follow existing naming patterns (`ds-*`)
3. Add responsive variants if needed
4. Document in this file
5. Build: `pnpm build:packages`
6. Test in all frameworks

### Build Process
- Uses PostCSS for processing
- Outputs optimized CSS
- No JavaScript runtime required
- Tree-shaking friendly

## Important Notes

- This package is private (not published to npm)
- Container loads the CSS once for all MFEs
- No framework dependencies
- Pure CSS implementation
- Zero global pollution

## Why This Matters

1. **Consistency**: All MFEs share the same design language
2. **Maintainability**: Changes in one place affect all components
3. **Performance**: Single CSS file loaded once
4. **Framework Agnostic**: Works everywhere

**Remember: The design system is not optional. It is the ONLY way to style UI components.**