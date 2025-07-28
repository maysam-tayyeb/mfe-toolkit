/**
 * Common Tailwind class combinations for consistency across the platform
 */

export const buttonStyles = {
  primary: "inline-flex items-center justify-center h-9 px-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium",
  secondary: "inline-flex items-center justify-center h-9 px-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium",
  outline: "inline-flex items-center justify-center h-9 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors text-sm font-medium",
  ghost: "inline-flex items-center justify-center h-9 px-3 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors text-sm font-medium",
  destructive: "inline-flex items-center justify-center h-9 px-3 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors text-sm font-medium",
} as const;

export const cardStyles = {
  default: "border rounded-lg p-6 space-y-4",
  compact: "border rounded-lg p-4 space-y-3",
  elevated: "border rounded-lg p-6 space-y-4 shadow-sm",
  interactive: "border rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow",
} as const;

export const sectionStyles = {
  base: "space-y-6",
  withPadding: "space-y-6 p-6",
  muted: "bg-muted/50 rounded-lg p-6",
} as const;

export const gridStyles = {
  cols2: "grid gap-6 md:grid-cols-2",
  cols3: "grid gap-6 md:grid-cols-3",
  cols4: "grid gap-4 md:grid-cols-4",
  responsive: "grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
} as const;

export const textStyles = {
  h1: "text-3xl font-bold tracking-tight",
  h2: "text-2xl font-bold",
  h3: "text-xl font-semibold",
  h4: "text-lg font-semibold",
  subtitle: "text-muted-foreground mt-2",
  label: "text-sm font-medium",
  small: "text-sm text-muted-foreground",
} as const;

export const inputStyles = {
  default: "w-full px-3 py-2 border rounded-md text-sm",
  textarea: "w-full px-3 py-2 border rounded-md text-sm font-mono",
} as const;

export const badgeStyles = {
  default: "px-2 py-1 rounded text-xs",
  primary: "px-2 py-1 bg-primary/10 text-primary rounded-md text-xs",
  secondary: "px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs",
  success: "px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs",
  warning: "px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 rounded text-xs",
  error: "px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-xs",
} as const;