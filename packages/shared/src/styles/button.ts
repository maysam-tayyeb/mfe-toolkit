// Shared button styles for consistency across MFEs
export const buttonStyles = {
  base: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  variants: {
    default: 'bg-foreground text-background hover:bg-foreground/90',
    secondary: 'bg-muted text-foreground hover:bg-muted/80',
    outline: 'border border-input bg-background hover:bg-muted hover:border-foreground/20',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  },
  sizes: {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3',
    lg: 'h-11 px-8',
  },
};

// Helper function to get button classes
export function getButtonClasses(
  variant: keyof typeof buttonStyles.variants = 'default',
  size: keyof typeof buttonStyles.sizes = 'default',
  className?: string
): string {
  return [
    buttonStyles.base,
    buttonStyles.variants[variant],
    buttonStyles.sizes[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');
}