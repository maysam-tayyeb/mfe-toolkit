# Theme Service Guide

This guide explains how to use the theme service in the MFE platform, including support for multiple themes beyond just light and dark.

## Overview

The theme service is a container-provided service that manages the application's visual theme. It's designed to:

- Provide centralized theme management
- Support multiple themes (not just light/dark)
- Persist user preferences
- Respect system theme preferences
- Allow real-time theme switching

## Basic Usage

### Accessing the Theme Service

The theme service is available through the MFE services:

```typescript
// In an MFE
export default {
  mount: (element, services) => {
    const themeService = services.theme;
    
    // Get current theme
    const currentTheme = themeService?.getTheme() || 'light';
    
    // Set a theme
    themeService?.setTheme('dark');
    
    // Subscribe to theme changes
    const unsubscribe = themeService?.subscribe((theme) => {
      console.log('Theme changed to:', theme);
    });
    
    // Clean up
    return () => {
      unsubscribe?.();
    };
  }
};
```

### React Integration

```typescript
import { useEffect, useState } from 'react';

function ThemedComponent({ services }) {
  const [theme, setTheme] = useState(services.theme?.getTheme() || 'light');
  
  useEffect(() => {
    const unsubscribe = services.theme?.subscribe((newTheme) => {
      setTheme(newTheme);
    });
    
    return unsubscribe;
  }, [services.theme]);
  
  return (
    <div className={`theme-aware-component ${theme}`}>
      Current theme: {theme}
    </div>
  );
}
```

## Multi-Theme Support

The theme service supports any number of themes, not just light and dark.

### Container Configuration

Configure available themes in your container application:

```typescript
// In container's main.tsx or App.tsx
import { configureThemeService } from '@/services/theme-service';

// Define your themes
const themes = ['light', 'dark', 'blue', 'sepia', 'high-contrast'];

// Configure before any components mount
configureThemeService(themes);
```

### Theme Service Interface

```typescript
export interface ThemeService {
  getTheme: () => Theme;
  setTheme: (theme: Theme) => void;
  subscribe: (callback: (theme: Theme) => void) => () => void;
  
  // Optional methods for multi-theme support
  getAvailableThemes?: () => Theme[];  // List all available themes
  cycleTheme?: () => void;             // Cycle to next theme
}
```

### Cycling Through Themes

```typescript
// If the container supports multiple themes
const themes = services.theme?.getAvailableThemes?.() || ['light', 'dark'];

// Cycle to next theme
services.theme?.cycleTheme?.();
```

## CSS Implementation

### Using CSS Classes

The theme service applies themes as CSS classes on the document root:

```css
/* Basic light/dark themes */
.light {
  --background: #ffffff;
  --foreground: #000000;
  --primary: #0066cc;
}

.dark {
  --background: #1a1a1a;
  --foreground: #ffffff;
  --primary: #66b3ff;
}

/* Additional themes */
.blue {
  --background: #1e40af;
  --foreground: #dbeafe;
  --primary: #60a5fa;
}

.sepia {
  --background: #f5e6d3;
  --foreground: #5c4033;
  --primary: #8b4513;
}
```

### Using Data Attributes

Themes are also applied as data attributes for more specific targeting:

```css
/* Target specific themes */
[data-theme="high-contrast"] {
  --background: #ffffff;
  --foreground: #000000;
  --border-width: 3px;
  --focus-outline: 4px solid #000000;
}

/* Component-specific theme styles */
[data-theme="dark"] .card {
  box-shadow: 0 4px 6px rgba(255, 255, 255, 0.1);
}
```

## Implementation Details

### Theme Persistence

The theme service automatically:
- Saves the user's theme preference to localStorage
- Restores the theme on page reload
- Falls back to system preference if no saved preference exists

### System Theme Detection

```typescript
// The service respects system preferences
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// If user hasn't set a preference, follow system
if (!localStorage.getItem('theme')) {
  // Use system preference
}
```

### Meta Theme Color

The service updates the meta theme-color for mobile browsers:

```typescript
// Automatically sets theme color for mobile browser UI
const themeColors = {
  'light': '#ffffff',
  'dark': '#000000',
  'blue': '#1e40af',
  'sepia': '#f5e6d3',
};
```

## Migration Guide

### From Universal State Manager

If you were previously using theme from the universal state manager:

```typescript
// Before (using state manager)
const theme = stateManager.get('theme');
stateManager.set('theme', 'dark');

// After (using theme service)
const theme = services.theme?.getTheme();
services.theme?.setTheme('dark');
```

### Adding More Themes

1. Configure the theme service with your themes:
   ```typescript
   configureThemeService(['light', 'dark', 'blue', 'sepia']);
   ```

2. Add corresponding CSS:
   ```css
   .blue { /* blue theme styles */ }
   .sepia { /* sepia theme styles */ }
   ```

3. Update UI to handle theme selection:
   ```typescript
   const themes = services.theme?.getAvailableThemes?.() || ['light', 'dark'];
   // Create theme picker UI
   ```

## Best Practices

### 1. Use CSS Variables

Define your theme values as CSS variables for easy customization:

```css
:root {
  --background: #ffffff;
  --foreground: #000000;
  --primary: #0066cc;
  --secondary: #6c757d;
}

body {
  background-color: var(--background);
  color: var(--foreground);
}
```

### 2. Respect User Preferences

Always respect the user's theme preference and system settings:

```typescript
// Good: Check for theme service availability
const theme = services.theme?.getTheme() || 'light';

// Good: Handle missing service gracefully
if (services.theme) {
  services.theme.setTheme('dark');
}
```

### 3. Clean Up Subscriptions

Always clean up theme subscriptions to prevent memory leaks:

```typescript
useEffect(() => {
  const unsubscribe = services.theme?.subscribe(handleThemeChange);
  return () => unsubscribe?.();
}, []);
```

### 4. Theme-Aware Components

Make your components theme-aware without hardcoding theme names:

```typescript
// Good: Works with any theme
<div className={`component theme-${theme}`}>

// Avoid: Hardcoding specific themes
<div className={theme === 'dark' ? 'dark-component' : 'light-component'}>
```

## Future Enhancements

Planned improvements to the theme service:

- **Theme Metadata**: Include theme descriptions and preview colors
- **Theme Presets**: Bundled theme collections (e.g., "accessibility pack")
- **Dynamic Loading**: Load theme CSS on demand
- **Custom Themes**: Allow users to create and save custom themes
- **Theme Transitions**: Smooth animations between theme changes

## Troubleshooting

### Theme Not Persisting

Check that localStorage is available and not blocked:

```typescript
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
} catch (e) {
  console.error('localStorage not available');
}
```

### Theme Not Applying

Ensure the theme service is properly initialized:

```typescript
// In container
const themeService = getThemeService();

// In MFE
if (!services.theme) {
  console.warn('Theme service not available');
}
```

### Flash of Unstyled Content

The theme is applied immediately on page load, but you can add a loading state:

```css
/* Hide content until theme is applied */
body:not([class*="theme"]) {
  visibility: hidden;
}
```