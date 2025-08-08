# Design System Architecture

## Core Principle: No Global Pollution

The design system will be provided through proper dependency injection, NOT through window/global objects.

## Multi-Framework Strategy

### Architecture Decision: Framework-Specific Packages with Shared Tokens

```
@mfe/design-system-tokens     (pure CSS/JS tokens)
@mfe/design-system-react      (React components)
@mfe/design-system-vue        (Vue components)
@mfe/design-system-vanilla    (Web Components or CSS classes)
```

### Why This Approach?

1. **No Global Pollution**: Components are imported, not accessed from window
2. **Tree-Shaking**: MFEs only bundle what they use
3. **Type Safety**: Full TypeScript support for each framework
4. **Framework Idioms**: Each implementation follows framework best practices
5. **Shared Tokens**: Consistency through shared design tokens

## Package Structure

### 1. Design System Tokens (Framework Agnostic)

```
packages/design-system-tokens/
├── src/
│   ├── colors.ts       # Color tokens
│   ├── typography.ts   # Typography scales
│   ├── spacing.ts      # Spacing system
│   ├── shadows.ts      # Shadow definitions
│   ├── borders.ts      # Border styles
│   ├── animations.ts   # Animation tokens
│   └── index.ts        # Main export
├── dist/
│   ├── tokens.css      # CSS custom properties
│   ├── tokens.js       # JS/TS tokens
│   └── tokens.scss     # SCSS variables
└── package.json
```

### 2. React Design System

```
packages/design-system-react/
├── src/
│   ├── components/
│   │   ├── Card/
│   │   │   ├── Card.tsx
│   │   │   ├── Card.test.tsx
│   │   │   └── index.ts
│   │   ├── Button/
│   │   ├── Section/
│   │   ├── Grid/
│   │   └── index.ts
│   ├── hooks/
│   │   └── useDesignTokens.ts
│   └── index.ts
└── package.json
```

### 3. Vue Design System

```
packages/design-system-vue/
├── src/
│   ├── components/
│   │   ├── Card/
│   │   │   ├── Card.vue
│   │   │   ├── Card.test.ts
│   │   │   └── index.ts
│   │   ├── Button/
│   │   └── index.ts
│   ├── composables/
│   │   └── useDesignTokens.ts
│   └── index.ts
└── package.json
```

### 4. Vanilla Design System

```
packages/design-system-vanilla/
├── src/
│   ├── styles/
│   │   ├── components.css
│   │   └── utilities.css
│   ├── components/
│   │   ├── card.ts       # Class generators
│   │   ├── button.ts
│   │   └── index.ts
│   └── index.ts
└── package.json
```

## Distribution Strategy

### 1. Through Container Services (NO WINDOW POLLUTION)

```typescript
// container/src/services/design-system-service.ts
import * as ReactComponents from '@mfe/design-system-react';
import * as VueComponents from '@mfe/design-system-vue';
import * as VanillaHelpers from '@mfe/design-system-vanilla';
import * as Tokens from '@mfe/design-system-tokens';

export class DesignSystemService {
  getReactComponents() {
    return ReactComponents;
  }

  getVueComponents() {
    return VueComponents;
  }

  getVanillaHelpers() {
    return VanillaHelpers;
  }

  getTokens() {
    return Tokens;
  }
}

// Injected into MFE at mount
const services = {
  designSystem: new DesignSystemService(),
  // ... other services
};

mfe.mount(element, services);
```

### 2. In MFE Usage

#### React MFE

```typescript
export default function mount(element: HTMLElement, services: MFEServices) {
  const { Card, Button } = services.designSystem.getReactComponents();

  const App = () => (
    <Card variant="elevated">
      <Button variant="primary">Click me</Button>
    </Card>
  );

  const root = ReactDOM.createRoot(element);
  root.render(<App />);
}
```

#### Vue MFE

```typescript
export default function mount(element: HTMLElement, services: MFEServices) {
  const { Card, Button } = services.designSystem.getVueComponents();

  const app = createApp({
    components: { Card, Button },
    template: `
      <Card variant="elevated">
        <Button variant="primary">Click me</Button>
      </Card>
    `,
  });

  app.mount(element);
}
```

#### Vanilla MFE

```typescript
export default function mount(element: HTMLElement, services: MFEServices) {
  const { getCardClasses, getButtonClasses } = services.designSystem.getVanillaHelpers();

  element.innerHTML = `
    <div class="${getCardClasses('elevated')}">
      <button class="${getButtonClasses('primary')}">Click me</button>
    </div>
  `;
}
```

## Development Container Integration

```typescript
// dev-container/src/services/design-system-service.ts
export class DevDesignSystemService {
  private reactComponents: any;
  private vueComponents: any;
  private vanillaHelpers: any;

  async initialize() {
    // Dynamically import based on MFE framework
    if (this.detectFramework() === 'react') {
      this.reactComponents = await import('@mfe/design-system-react');
    } else if (this.detectFramework() === 'vue') {
      this.vueComponents = await import('@mfe/design-system-vue');
    } else {
      this.vanillaHelpers = await import('@mfe/design-system-vanilla');
    }
  }

  getReactComponents() {
    return this.reactComponents;
  }

  // ... other getters
}
```

## Implementation Priority

### Phase 1: Core Components (Week 1)

1. **Tokens Package** - Foundation for all frameworks
2. **React Components** - Card, Button (most MFEs use React)
3. **Apply to Container** - Use Card in one page

### Phase 2: Expand Coverage (Week 2)

1. **Vue Components** - Card, Button
2. **Vanilla Helpers** - CSS classes and utilities
3. **Update Modal Demo MFE** - Use design system

### Phase 3: Full Migration (Week 3)

1. **All Core Components** - Section, Grid, InfoBlock
2. **Update All Container Pages**
3. **Update All Service Demo MFEs**

## Example: Card Component Implementation

### 1. Tokens

```typescript
// design-system-tokens/src/card.ts
export const cardTokens = {
  padding: {
    compact: '1rem',
    normal: '1.5rem',
    large: '2rem',
  },
  borderRadius: '0.5rem',
  borderColor: 'var(--border)',
  background: 'var(--card)',
  shadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
};
```

### 2. React Implementation

```typescript
// design-system-react/src/components/Card/Card.tsx
import React from 'react';
import { cardTokens } from '@mfe/design-system-tokens';
import { cn } from '../../utils/cn';

export interface CardProps {
  variant?: 'default' | 'elevated' | 'interactive';
  padding?: 'compact' | 'normal' | 'large';
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'normal',
  children,
  className
}) => {
  const styles = {
    padding: cardTokens.padding[padding],
    borderRadius: cardTokens.borderRadius,
    border: `1px solid ${cardTokens.borderColor}`,
    background: cardTokens.background,
    boxShadow: variant === 'elevated' ? cardTokens.shadow.md : cardTokens.shadow.sm
  };

  return (
    <div className={cn('ds-card', className)} style={styles}>
      {children}
    </div>
  );
};
```

### 3. Vue Implementation

```vue
<!-- design-system-vue/src/components/Card/Card.vue -->
<template>
  <div :class="['ds-card', className]" :style="cardStyles">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cardTokens } from '@mfe/design-system-tokens';

interface Props {
  variant?: 'default' | 'elevated' | 'interactive';
  padding?: 'compact' | 'normal' | 'large';
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'normal',
});

const cardStyles = computed(() => ({
  padding: cardTokens.padding[props.padding],
  borderRadius: cardTokens.borderRadius,
  border: `1px solid ${cardTokens.borderColor}`,
  background: cardTokens.background,
  boxShadow: props.variant === 'elevated' ? cardTokens.shadow.md : cardTokens.shadow.sm,
}));
</script>
```

### 4. Vanilla Implementation

```typescript
// design-system-vanilla/src/components/card.ts
import { cardTokens } from '@mfe/design-system-tokens';

export function getCardClasses(
  variant: 'default' | 'elevated' | 'interactive' = 'default',
  padding: 'compact' | 'normal' | 'large' = 'normal'
): string {
  const baseClasses = 'ds-card rounded-lg border bg-card text-card-foreground';
  const paddingClasses = {
    compact: 'p-4',
    normal: 'p-6',
    large: 'p-8',
  };
  const variantClasses = {
    default: 'shadow-sm',
    elevated: 'shadow-md',
    interactive: 'shadow-sm hover:shadow-md transition-shadow cursor-pointer',
  };

  return `${baseClasses} ${paddingClasses[padding]} ${variantClasses[variant]}`;
}

export function createCard(
  content: string,
  options: { variant?: string; padding?: string } = {}
): HTMLElement {
  const div = document.createElement('div');
  div.className = getCardClasses(options.variant as any, options.padding as any);
  div.innerHTML = content;
  return div;
}
```

## Migration Example: Modal Demo MFE

### Before (No Design System)

```typescript
// Direct Tailwind classes
<div className="border rounded-lg p-6 space-y-4">
  <button className="px-4 py-2 bg-primary text-white rounded">
    Click me
  </button>
</div>
```

### After (With Design System)

```typescript
// Using injected design system
const { Card, Button } = services.designSystem.getReactComponents();

<Card variant="default" padding="normal">
  <Button variant="primary">Click me</Button>
</Card>
```

## Benefits

1. **No Global Pollution**: Everything is properly injected
2. **Framework Flexibility**: Each framework gets idiomatic components
3. **Consistency**: Shared tokens ensure visual consistency
4. **Type Safety**: Full TypeScript support
5. **Tree Shaking**: Only used components are bundled
6. **Testability**: Components can be tested in isolation

## Next Steps

1. Create token package first
2. Implement React Card and Button
3. Apply to one container page
4. Update dev container to provide design system service
5. Migrate one MFE to use design system
6. Document the process
7. Scale to other frameworks and components
