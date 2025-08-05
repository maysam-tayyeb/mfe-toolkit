# Multi-Theme Support

This branch extends the theme service to support more than just light and dark themes.

## Changes Made

### 1. Flexible Theme Type
- Changed `Theme` type from `'light' | 'dark'` to `string` to allow any theme name
- This enables containers to define custom themes like 'blue', 'sepia', 'high-contrast', etc.

### 2. Updated ThemeService Interface
- Removed `toggleTheme()` method (doesn't make sense for multiple themes)
- Added optional `getAvailableThemes()` method to list all themes
- Added optional `cycleTheme()` method to cycle through available themes
- These are optional to maintain backward compatibility

### 3. Enhanced ThemeServiceImpl
- Constructor now accepts an array of available themes (defaults to `['light', 'dark']`)
- `cycleTheme()` cycles through all available themes in order
- `applyTheme()` now:
  - Adds theme name as a CSS class (e.g., `.light`, `.dark`, `.blue`)
  - Sets `data-theme` attribute for flexible CSS targeting
  - Supports theme-specific meta theme colors

### 4. Configuration Support
- Added `configureThemeService()` to set available themes before initialization
- `getThemeService()` can accept themes array for first-time initialization

## Usage Examples

### Basic Usage (Light/Dark)
```typescript
// Default behavior - works exactly as before
const themeService = getThemeService();
themeService.setTheme('dark');
```

### Multiple Themes
```typescript
// Configure with multiple themes
import { configureThemeService } from '@/services/theme-service';

// In your app initialization
configureThemeService(['light', 'dark', 'blue', 'sepia']);

// Then use normally
const themeService = getThemeService();
themeService.cycleTheme(); // Cycles: light → dark → blue → sepia → light
```

### CSS Implementation
```css
/* Target themes using class names */
.light {
  --background: #ffffff;
  --foreground: #000000;
}

.dark {
  --background: #000000;
  --foreground: #ffffff;
}

.blue {
  --background: #1e40af;
  --foreground: #dbeafe;
}

.sepia {
  --background: #f5e6d3;
  --foreground: #5c4033;
}

/* Or using data attributes */
[data-theme="high-contrast"] {
  --background: #ffffff;
  --foreground: #000000;
  --border-width: 2px;
}
```

### Container Configuration
```typescript
// In container's main.tsx or App.tsx
import { configureThemeService } from '@/services/theme-service';

// Define your themes
const themes = ['light', 'dark', 'blue', 'sepia', 'high-contrast'];

// Configure before any components mount
configureThemeService(themes);
```

### MFE Theme Awareness
```typescript
// MFEs can check available themes
const themeService = services.theme;
const availableThemes = themeService?.getAvailableThemes?.() || ['light', 'dark'];

// React to any theme
useEffect(() => {
  const unsubscribe = services.theme?.subscribe((theme) => {
    console.log('Current theme:', theme);
    // Adjust MFE styling based on theme
  });
  return unsubscribe;
}, [services.theme]);
```

## Benefits

1. **Flexibility**: Supports unlimited themes without code changes
2. **Backward Compatible**: Default behavior unchanged
3. **Container Control**: Each container can define its own themes
4. **CSS Flexibility**: Use classes or data attributes for styling
5. **Progressive Enhancement**: Optional methods allow gradual adoption

## Migration Path

1. No changes needed for existing implementations
2. To add more themes:
   - Call `configureThemeService()` with theme array
   - Add corresponding CSS for new themes
   - Update UI to handle theme cycling (optional)

## Future Enhancements

- Theme metadata (theme descriptions, preview colors)
- Theme presets/bundles
- Dynamic theme loading
- User-defined custom themes