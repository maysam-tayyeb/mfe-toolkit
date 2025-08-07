import React from 'react';
import { cn } from '@mfe/shared';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}) => {
  // Base styles - standardized on h-9 for medium size
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variantStyles = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  // Standardized sizes - using h-9 as default
  const sizeStyles = {
    xs: 'h-7 px-2 text-xs',
    sm: 'h-8 px-3 text-sm',
    md: 'h-9 px-4 text-sm',
    lg: 'h-10 px-6 text-base',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Icon Button variant for buttons with only icons
export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode;
  label: string; // For accessibility
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  size = 'md',
  ...props
}) => {
  // Square aspect ratio for icon buttons
  const iconSizeStyles = {
    xs: 'h-7 w-7',
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10',
  };

  return (
    <Button
      {...props}
      size={size}
      className={cn(iconSizeStyles[size], 'p-0', props.className)}
      aria-label={label}
    >
      {icon}
    </Button>
  );
};

// Button Group for organizing related buttons
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'tight' | 'normal' | 'wide';
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  spacing = 'normal',
  className,
  ...props
}) => {
  const orientationStyles = {
    horizontal: 'flex-row',
    vertical: 'flex-col',
  };

  const spacingStyles = {
    tight: orientation === 'horizontal' ? 'space-x-1' : 'space-y-1',
    normal: orientation === 'horizontal' ? 'space-x-2' : 'space-y-2',
    wide: orientation === 'horizontal' ? 'space-x-4' : 'space-y-4',
  };

  return (
    <div
      className={cn(
        'flex',
        orientationStyles[orientation],
        spacingStyles[spacing],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};