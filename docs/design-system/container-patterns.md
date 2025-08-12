# Container Design Patterns

This guide documents the design patterns and CSS classes available for building consistent container applications across React, Vue, and Vanilla JavaScript frameworks.

## Overview

The MFE Toolkit provides a comprehensive design system with 400+ utility classes. Container applications have additional patterns that are specifically designed for orchestrating and managing microfrontends.

## Container-Specific Classes

These classes are available in `@mfe/design-system/src/styles/container.css` and are specifically designed for container applications (not typically needed by MFEs).

## Loading States

### Full-Screen Loading

Used for initial application load or major route changes.

```html
<!-- Full-screen loading state -->
<div class="ds-loading-fullscreen">
  <div class="ds-loading-wrapper">
    <div class="ds-spinner ds-spinner-lg"></div>
    <p class="ds-loading-text-lg">Loading MFE Registry...</p>
  </div>
</div>
```

### Component Loading

Used for in-place loading within a component or section.

```html
<!-- In-place loading -->
<div class="ds-loading-container">
  <div class="ds-loading-wrapper">
    <div class="ds-spinner ds-spinner-sm"></div>
    <p class="ds-loading-text">Loading MFE...</p>
  </div>
</div>
```

### Spinner Variants

```html
<!-- Primary spinner (blue) -->
<div class="ds-spinner ds-spinner-primary ds-spinner-md"></div>

<!-- Secondary spinner (gray) -->
<div class="ds-spinner ds-spinner-secondary ds-spinner-lg"></div>
```

## MFE Management

### MFE Error States

```html
<!-- MFE error boundary -->
<div class="ds-mfe-boundary">
  <div class="ds-mfe-error">
    <p class="ds-mfe-error-text">Failed to load MFE</p>
  </div>
</div>

<!-- MFE not found -->
<div class="ds-mfe-not-found">
  <p class="ds-mfe-not-found-text">MFE 'example' not found</p>
</div>
```

### MFE Registry Display

```html
<!-- Registry container -->
<div class="ds-registry-container">
  <!-- Registry item -->
  <div class="ds-registry-item">
    <div class="ds-registry-header">
      <h3 class="ds-registry-title">
        <span>🎯</span>
        <span>Example MFE</span>
      </h3>
      <span class="ds-badge ds-badge-success">Active</span>
    </div>
    
    <div class="ds-registry-metadata">
      <div class="ds-registry-meta-item">
        <span class="ds-registry-meta-label">Version</span>
        <span class="ds-registry-meta-value">1.0.0</span>
      </div>
      <div class="ds-registry-meta-item">
        <span class="ds-registry-meta-label">Status</span>
        <span class="ds-registry-meta-value">Loaded</span>
      </div>
    </div>
  </div>
</div>
```

## Feature Cards & CTAs

### Feature Grid

```html
<!-- Feature grid layout -->
<div class="ds-feature-grid">
  <a href="/feature" class="ds-feature-card-link">
    <div class="ds-feature-icon-wrapper">
      <span class="ds-icon-primary">🚀</span>
    </div>
    <div>
      <h3 class="ds-card-title">Feature Name</h3>
      <p class="ds-text-muted">Description</p>
    </div>
  </a>
</div>
```

### Call-to-Action Section

```html
<!-- CTA section -->
<div class="ds-cta-section">
  <h2 class="ds-cta-title">Ready to Get Started?</h2>
  <p class="ds-cta-description">
    Build your next microfrontend application
  </p>
  <div class="ds-cta-button-group">
    <button class="ds-btn ds-btn-primary">Get Started</button>
    <button class="ds-btn ds-btn-outline">Learn More</button>
  </div>
</div>
```

## Console & Logging

### Log Container

```html
<!-- Log container -->
<div class="ds-log-container">
  <!-- Info log entry -->
  <div class="ds-log-entry-info">
    <span class="ds-log-timestamp">10:23:45</span>
    <span class="ds-log-message">MFE loaded successfully</span>
  </div>
  
  <!-- Error log entry -->
  <div class="ds-log-entry-error">
    <span class="ds-log-timestamp">10:23:46</span>
    <span class="ds-log-message">Failed to connect to service</span>
  </div>
  
  <!-- Success log entry -->
  <div class="ds-log-entry-success">
    <span class="ds-log-timestamp">10:23:47</span>
    <span class="ds-log-message">Connection established</span>
  </div>
  
  <!-- Warning log entry -->
  <div class="ds-log-entry-warning">
    <span class="ds-log-timestamp">10:23:48</span>
    <span class="ds-log-message">High memory usage detected</span>
  </div>
</div>
```

### State Display

```html
<!-- State container -->
<div class="ds-state-container">
  <div class="ds-state-grid">
    <div class="ds-state-item">
      <div class="ds-state-key">User ID</div>
      <div class="ds-state-value">user-123</div>
    </div>
    <div class="ds-state-item">
      <div class="ds-state-key">Session</div>
      <div class="ds-state-value">active</div>
    </div>
  </div>
</div>
```

## Dashboard Components

### Dashboard Grid

```html
<!-- Dashboard metrics grid -->
<div class="ds-dashboard-grid">
  <!-- Stat card -->
  <div class="ds-dashboard-stat">
    <div class="ds-dashboard-stat-label">Total MFEs</div>
    <div class="ds-dashboard-stat-value">12</div>
    <div class="ds-dashboard-stat-trend-up">↑ 20% from last week</div>
  </div>
  
  <!-- Stat card with downward trend -->
  <div class="ds-dashboard-stat">
    <div class="ds-dashboard-stat-label">Error Rate</div>
    <div class="ds-dashboard-stat-value">0.3%</div>
    <div class="ds-dashboard-stat-trend-down">↓ 5% from last week</div>
  </div>
</div>
```

### Platform Metrics

```html
<!-- Enhanced metrics container -->
<div class="ds-metrics-container">
  <div class="ds-metric-card-enhanced">
    <div class="ds-metric-background">📊</div>
    <div class="ds-metric-icon">📊</div>
    <div class="ds-metric-label">Active Users</div>
    <div class="ds-metric-value">1,234</div>
    <div class="ds-metric-trend ds-metric-trend-up">+15%</div>
  </div>
</div>
```

## Service Demonstrations

### Service Demo Layout

```html
<!-- Service demo container -->
<div class="ds-service-demo">
  <!-- Service section -->
  <div class="ds-service-section">
    <h2 class="ds-service-title">Event Bus Demo</h2>
    
    <!-- Service controls -->
    <div class="ds-service-controls">
      <button class="ds-btn ds-btn-primary">Send Event</button>
      <button class="ds-btn ds-btn-secondary">Clear Log</button>
    </div>
    
    <!-- Service output -->
    <div class="ds-service-output">
      <!-- Output content -->
    </div>
  </div>
</div>
```

## Error Boundaries

### Error Display

```html
<!-- Error boundary -->
<div class="ds-error-boundary">
  <h2 class="ds-error-title">Something went wrong</h2>
  <p class="ds-error-message">
    An unexpected error occurred while loading the component.
  </p>
  <pre class="ds-error-stack">
    Error: Cannot read property 'foo' of undefined
    at Component.render (component.js:123)
  </pre>
  <div class="ds-error-actions">
    <button class="ds-btn ds-btn-primary">Retry</button>
    <button class="ds-btn ds-btn-outline">Go Home</button>
  </div>
</div>
```

## Settings & Configuration

### Settings Form

```html
<!-- Settings section -->
<div class="ds-settings-section">
  <div class="ds-settings-header">
    <h2 class="ds-settings-title">General Settings</h2>
    <p class="ds-settings-description">
      Configure your application preferences
    </p>
  </div>
  
  <form class="ds-settings-form">
    <div class="ds-settings-group">
      <label class="ds-settings-label">API Endpoint</label>
      <input type="text" class="ds-settings-input" />
      <p class="ds-settings-hint">
        Enter the API endpoint URL
      </p>
    </div>
  </form>
</div>
```

## Navigation Patterns

### Mobile Navigation

```html
<!-- Mobile backdrop -->
<div class="ds-mobile-backdrop"></div>

<!-- Mobile panel -->
<div class="ds-mobile-panel">
  <!-- Navigation content -->
</div>
```

## Responsive Utilities

The design system includes responsive variants for grid layouts:

```html
<!-- Responsive grid -->
<div class="ds-grid ds-grid-cols-1 ds-md:grid-cols-2 ds-lg:grid-cols-4">
  <!-- Grid items -->
</div>

<!-- Responsive visibility -->
<div class="ds-hidden ds-md:block">
  <!-- Hidden on mobile, visible on tablet and up -->
</div>
```

## Implementation Examples

### React Container

```jsx
function AppContent() {
  const [loading, setLoading] = useState(true);
  
  if (loading) {
    return (
      <div className="ds-loading-fullscreen">
        <div className="ds-loading-wrapper">
          <div className="ds-spinner ds-spinner-lg"></div>
          <p className="ds-loading-text-lg">Loading MFE Registry...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="ds-page-container">
      {/* Container content */}
    </div>
  );
}
```

### Vue Container

```vue
<template>
  <div v-if="loading" class="ds-loading-fullscreen">
    <div class="ds-loading-wrapper">
      <div class="ds-spinner ds-spinner-lg"></div>
      <p class="ds-loading-text-lg">Loading MFE Registry...</p>
    </div>
  </div>
  
  <div v-else class="ds-page-container">
    <!-- Container content -->
  </div>
</template>
```

### Vanilla JavaScript

```javascript
function renderLoading() {
  return `
    <div class="ds-loading-fullscreen">
      <div class="ds-loading-wrapper">
        <div class="ds-spinner ds-spinner-lg"></div>
        <p class="ds-loading-text-lg">Loading MFE Registry...</p>
      </div>
    </div>
  `;
}

document.getElementById('app').innerHTML = renderLoading();
```

## Best Practices

1. **Use Design System Classes**: Always prefer design system classes over custom styles
2. **Maintain Consistency**: Use the same patterns across all container implementations
3. **Responsive Design**: Use responsive variants (ds-sm:*, ds-md:*, ds-lg:*)
4. **Dark Mode Support**: All classes support dark mode automatically
5. **Semantic Classes**: Use semantic variants (success, warning, error) for better UX
6. **Performance**: Container styles are optimized for performance and minimal bundle size

## Migration Guide

If you're migrating from Tailwind/ShadCN classes to design system classes:

| Tailwind/ShadCN | Design System |
|-----------------|---------------|
| `text-muted-foreground` | `ds-text-muted` |
| `animate-spin` | `ds-spinner` |
| `border-primary` | `ds-accent-primary` |
| `h-64` | `ds-h-64` |
| `min-h-screen` | `ds-min-h-screen` |
| `grid grid-cols-2 md:grid-cols-4` | `ds-grid ds-grid-cols-2 ds-md:grid-cols-4` |

## Container vs MFE Classes

### Container-Specific (in container.css)
- Loading states (fullscreen, container)
- MFE management (error, boundary, registry)
- Dashboard components
- Service demonstrations
- Settings forms
- Console/logging displays

### Shared with MFEs (in index.css)
- Buttons, cards, badges
- Typography, colors
- Form elements
- Modals, toasts
- Basic layouts
- Utility classes

## Further Resources

- [Design System Overview](./index.md)
- [Component Library](./components.md)
- [Color Palette](./colors.md)
- [Typography Guidelines](./typography.md)
- [Responsive Design](./responsive.md)