import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  disabled,
  ...props
}) => {
  // Use ds-* classes from the container's CSS
  const variantClass = {
    default: 'ds-button-primary',
    primary: 'ds-button-primary',
    secondary: 'ds-button-secondary',
    outline: 'ds-button-outline',
    ghost: 'ds-button-ghost',
    destructive: 'ds-button-destructive',
  }[variant];

  const sizeClass = {
    xs: 'ds-button-xs',
    sm: 'ds-button-sm',
    md: '',
    lg: 'ds-button-lg',
  }[size];

  const classes = [variantClass, sizeClass, className].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
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
  className = '',
  ...props
}) => {
  // Square aspect ratio for icon buttons
  const iconSizeClass = {
    xs: 'h-7 w-7',
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10',
  }[size];

  return (
    <Button
      {...props}
      size={size}
      className={`${iconSizeClass} p-0 ${className}`.trim()}
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
  className = '',
  ...props
}) => {
  const orientationClass = orientation === 'horizontal' ? 'flex-row' : 'flex-col';
  
  const spacingClass = {
    tight: orientation === 'horizontal' ? 'space-x-1' : 'space-y-1',
    normal: orientation === 'horizontal' ? 'space-x-2' : 'space-y-2',
    wide: orientation === 'horizontal' ? 'space-x-4' : 'space-y-4',
  }[spacing];

  return (
    <div
      className={`flex ${orientationClass} ${spacingClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};