# Accessibility Guidelines

## Overview

The MFE Design System is built with accessibility in mind, following WCAG 2.1 AA standards.

## Core Principles

### 1. Perceivable
- Sufficient color contrast (4.5:1 for normal text)
- Don't rely solely on color
- Provide text alternatives for images
- Support zoom up to 200%

### 2. Operable
- Keyboard navigable
- No keyboard traps
- Sufficient time limits
- No seizure-inducing content

### 3. Understandable
- Predictable navigation
- Clear labels and instructions
- Consistent UI patterns
- Error identification and suggestions

### 4. Robust
- Valid HTML
- ARIA used correctly
- Works with assistive technology
- Progressive enhancement

## Component Guidelines

### Buttons
```html
<!-- Good: Descriptive label -->
<button class="ds-button-primary" aria-label="Save document">
  Save
</button>

<!-- Good: Disabled state -->
<button class="ds-button-primary" disabled aria-disabled="true">
  Processing...
</button>
```

### Forms
```html
<!-- Good: Associated labels -->
<div>
  <label for="email" class="text-sm font-medium">
    Email Address <span aria-label="required">*</span>
  </label>
  <input id="email" type="email" required aria-required="true" />
  <span class="ds-text-xs ds-text-error" role="alert">
    Please enter a valid email
  </span>
</div>
```

### Cards
```html
<!-- Good: Semantic structure -->
<article class="ds-card" role="article">
  <h2 class="ds-card-title">Article Title</h2>
  <p>Content...</p>
  <a href="#" aria-label="Read more about Article Title">
    Read more
  </a>
</article>
```

## Color Contrast

All design system colors meet WCAG AA standards:

- Primary on white: 4.6:1 ✓
- Text on background: 15:1 ✓
- Muted text: 4.5:1 ✓
- Error text: 4.5:1 ✓

## Keyboard Navigation

- Tab through interactive elements
- Enter/Space activate buttons
- Escape closes modals
- Arrow keys navigate menus

## Screen Reader Support

- Use semantic HTML
- Provide ARIA labels
- Announce dynamic changes
- Hide decorative elements

## Testing Checklist

- [ ] Keyboard only navigation
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Color contrast validation
- [ ] Zoom to 200%
- [ ] Focus indicators visible
- [ ] Error messages clear
- [ ] Time limits adjustable