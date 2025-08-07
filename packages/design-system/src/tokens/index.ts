/**
 * Design System Tokens
 * Centralized design tokens for consistent UI across the MFE platform
 * These tokens are framework-agnostic and can be used with React, Vue, or Vanilla JS
 */

export const typography = {
  // Optimized Typography for Screen Real Estate
  pageTitle: 'text-xl font-bold',  // Main page titles
  sectionTitle: 'text-base font-semibold',  // Section headers
  cardTitle: 'text-sm font-medium',  // Card headers
  body: 'text-sm',  // Body text
  small: 'text-xs',  // Small text
  caption: 'text-xs text-slate-500',  // Captions
  
  // Legacy heading support (compact sizes)
  h1: 'text-xl font-bold',
  h2: 'text-lg font-semibold',
  h3: 'text-base font-semibold',
  h4: 'text-sm font-medium',
  h5: 'text-sm font-medium',
  h6: 'text-xs font-medium',

  // Body Text Sizes
  bodyBase: 'text-base',
  bodySmall: 'text-sm',
  bodyLarge: 'text-lg',
  overline: 'text-xs uppercase tracking-wider',

  // Semantic Typography (Compact)
  pageHeader: 'text-xl font-bold',
  pageDescription: 'text-sm text-slate-500 mt-1',
  sectionHeader: 'text-base font-semibold',
  sectionDescription: 'text-sm text-slate-500',
  cardHeader: 'text-sm font-medium',
  cardDescription: 'text-xs text-slate-500',
} as const;

export const spacing = {
  // Page Layout (Compact)
  page: 'px-4 sm:px-6 lg:px-8 py-4',  // Reduced vertical padding
  pageCompact: 'px-4 py-3',
  section: 'space-y-4',  // Reduced from space-y-8
  sectionCompact: 'space-y-3',

  // Component Spacing (Compact)
  card: 'p-4',  // Reduced from p-6
  cardCompact: 'p-3',  // Reduced from p-4
  cardLarge: 'p-6',  // Reduced from p-8

  // Grid Gaps (Compact)
  grid: {
    tight: 'gap-2',
    compact: 'gap-3',
    normal: 'gap-4',  // Reduced from gap-6
    wide: 'gap-6',  // Reduced from gap-8
  },

  // Stack Spacing (vertical, compact)
  stack: {
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-3',  // Reduced from space-y-4
    lg: 'space-y-4',  // Reduced from space-y-6
    xl: 'space-y-6',  // Reduced from space-y-8
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
  // Container Widths (Centered)
  container: 'max-w-6xl mx-auto',  // Reduced from 7xl for better centering
  containerNarrow: 'max-w-4xl mx-auto',
  containerWide: 'max-w-7xl mx-auto',

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
  // Primary Palette (Blue & Slate)
  primary: 'bg-blue-500 text-white',
  primaryHover: 'hover:bg-blue-600',
  secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100',
  secondaryHover: 'hover:bg-slate-200 dark:hover:bg-slate-600',
  
  // Surface Colors
  surface: 'bg-white dark:bg-slate-800',
  muted: 'bg-slate-50 dark:bg-slate-900',
  border: 'border-slate-200 dark:border-slate-700',
  
  // Text Colors
  text: 'text-slate-900 dark:text-slate-100',
  textMuted: 'text-slate-500 dark:text-slate-400',
  
  // Status Colors (Modern Palette)
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
  error: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200',
} as const;

export const borders = {
  // Border Styles
  default: 'border',
  borderNone: 'border-0',
  
  // Border Widths
  thin: 'border',
  thick: 'border-2',
} as const;

export const radius = {
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
  radius,
  shadows,
  transitions,
};