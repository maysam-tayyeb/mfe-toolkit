# Common UI Patterns

## Overview

Reusable UI patterns built with design system components for common interface needs.

## Page Layouts

### Dashboard Layout
```html
<div class="ds-page">
  <header class="mb-6">
    <h1 class="ds-page-title">Dashboard</h1>
    <p class="ds-page-description">Overview of your application</p>
  </header>
  
  <div class="ds-grid-4 ds-grid-relaxed mb-6">
    <!-- Stat cards -->
  </div>
  
  <div class="ds-grid-2 ds-grid-relaxed">
    <!-- Content sections -->
  </div>
</div>
```

### Settings Page
```html
<div class="ds-page">
  <h1 class="ds-page-title mb-6">Settings</h1>
  
  <div class="ds-stack-lg">
    <section class="ds-card">
      <h2 class="ds-section-title mb-4">General</h2>
      <!-- Settings form -->
    </section>
    
    <section class="ds-card">
      <h2 class="ds-section-title mb-4">Security</h2>
      <!-- Security settings -->
    </section>
  </div>
</div>
```

## Component Patterns

### Stat Cards
```html
<div class="ds-grid-4 ds-grid-compact">
  <div class="ds-card-compact">
    <p class="ds-text-xs ds-text-muted">Total Users</p>
    <p class="text-2xl font-bold">1,234</p>
    <p class="ds-text-xs text-green-500">↑ 12%</p>
  </div>
  <!-- More stat cards -->
</div>
```

### Feature Grid
```html
<div class="ds-grid-3 ds-grid-relaxed">
  <div class="ds-card text-center">
    <div class="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg">
      <!-- Icon -->
    </div>
    <h3 class="ds-card-title mb-2">Feature</h3>
    <p class="text-sm ds-text-muted">Description</p>
  </div>
  <!-- More features -->
</div>
```

### Empty States
```html
<div class="ds-card text-center py-12">
  <div class="w-16 h-16 mx-auto mb-4 bg-muted rounded-full">
    <!-- Icon -->
  </div>
  <h3 class="text-lg font-medium mb-2">No data yet</h3>
  <p class="ds-text-muted mb-4">Get started by adding your first item</p>
  <button class="ds-button-primary">Add Item</button>
</div>
```

### Loading States
```html
<div class="ds-card">
  <div class="animate-pulse">
    <div class="h-4 bg-muted rounded w-3/4 mb-4"></div>
    <div class="h-4 bg-muted rounded w-1/2 mb-4"></div>
    <div class="h-4 bg-muted rounded w-5/6"></div>
  </div>
</div>
```

## Form Patterns

### Stacked Form
```html
<form class="ds-card ds-stack-md">
  <div>
    <label class="text-sm font-medium mb-1">Name</label>
    <input class="w-full" type="text" />
  </div>
  
  <div>
    <label class="text-sm font-medium mb-1">Email</label>
    <input class="w-full" type="email" />
    <p class="ds-text-xs ds-text-muted mt-1">We'll never share</p>
  </div>
  
  <div class="flex gap-2 mt-4">
    <button class="ds-button-primary">Submit</button>
    <button class="ds-button-outline" type="button">Cancel</button>
  </div>
</form>
```

## Navigation Patterns

### Tab Navigation
```html
<div class="border-b mb-6">
  <nav class="flex gap-6">
    <button class="pb-3 border-b-2 border-primary font-medium">
      Overview
    </button>
    <button class="pb-3 text-muted-foreground">
      Details
    </button>
    <button class="pb-3 text-muted-foreground">
      Settings
    </button>
  </nav>
</div>
```

## Best Practices

1. **Consistency** - Use same patterns throughout
2. **Responsiveness** - Test on all screen sizes
3. **Accessibility** - Include ARIA labels
4. **Performance** - Lazy load heavy content
5. **User Feedback** - Show loading/error states