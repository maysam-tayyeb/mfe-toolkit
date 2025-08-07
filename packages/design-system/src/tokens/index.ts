/**
 * Design System Tokens
 * Centralized design tokens for consistent UI across the MFE platform
 */

export const typography = {
  // Heading Levels
  h1: 'text-3xl font-bold tracking-tight',
  h2: 'text-2xl font-semibold',
  h3: 'text-xl font-semibold',
  h4: 'text-lg font-semibold',
  h5: 'text-base font-semibold',
  h6: 'text-sm font-semibold',

  // Body Text
  body: 'text-base',
  bodySmall: 'text-sm',
  bodyLarge: 'text-lg',
  caption: 'text-xs text-muted-foreground',
  overline: 'text-xs uppercase tracking-wider',

  // Semantic Typography
  pageTitle: 'text-3xl font-bold tracking-tight',
  pageDescription: 'text-muted-foreground mt-2',
  sectionTitle: 'text-2xl font-semibold',
  sectionDescription: 'text-sm text-muted-foreground',
  cardTitle: 'text-lg font-semibold',
  cardDescription: 'text-sm text-muted-foreground',
} as const;

export const spacing = {
  // Page Layout
  page: 'px-4 sm:px-6 lg:px-8 py-6',
  pageCompact: 'px-4 py-4',
  section: 'space-y-8',
  sectionCompact: 'space-y-6',

  // Component Spacing
  card: 'p-6',
  cardCompact: 'p-4',
  cardLarge: 'p-8',

  // Grid Gaps
  grid: {
    tight: 'gap-2',
    compact: 'gap-4',
    normal: 'gap-6',
    wide: 'gap-8',
  },

  // Stack Spacing (vertical)
  stack: {
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  },

  // Inline Spacing (horizontal)
  inline: {
    xs: 'space-x-1',
    sm: 'space-x-2',
    md: 'space-x-4',
    lg: 'space-x-6',
    xl: 'space-x-8',
  },
} as const;

export const layout = {
  // Container Widths
  container: 'max-w-7xl mx-auto',
  containerSmall: 'max-w-4xl mx-auto',
  containerLarge: 'max-w-full',

  // Common Layouts
  centered: 'flex items-center justify-center',
  stack: 'flex flex-col',
  inline: 'flex flex-row',
  spaceBetween: 'flex items-center justify-between',

  // Grid Layouts
  grid2: 'grid gap-6 md:grid-cols-2',
  grid3: 'grid gap-6 lg:grid-cols-3',
  grid4: 'grid gap-4 md:grid-cols-4',
  gridAuto: 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
} as const;

export const colors = {
  // Semantic Colors (use with Tailwind CSS variables)
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  muted: 'bg-muted text-muted-foreground',
  accent: 'bg-accent text-accent-foreground',
  card: 'bg-card text-card-foreground',
  
  // Status Colors
  success: 'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100',
  error: 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100',
  warning: 'bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100',
  info: 'bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100',
} as const;

export const borders = {
  // Border Styles
  default: 'border',
  none: 'border-0',
  
  // Border Widths
  thin: 'border',
  thick: 'border-2',
  
  // Border Radius
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
} as const;

export const shadows = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  inner: 'shadow-inner',
} as const;

export const transitions = {
  // Transition Properties
  all: 'transition-all',
  colors: 'transition-colors',
  opacity: 'transition-opacity',
  shadow: 'transition-shadow',
  transform: 'transition-transform',
  
  // Durations
  fast: 'duration-150',
  normal: 'duration-300',
  slow: 'duration-500',
  
  // Timing Functions
  ease: 'ease-in-out',
  linear: 'linear',
} as const;

// Re-export as default for convenience
export default {
  typography,
  spacing,
  layout,
  colors,
  borders,
  shadows,
  transitions,
};