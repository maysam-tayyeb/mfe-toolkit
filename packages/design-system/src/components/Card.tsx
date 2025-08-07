import React from 'react';
import { cn } from '@mfe/shared';
import { spacing, typography } from '../tokens';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'compact' | 'elevated' | 'interactive' | 'bordered';
  padding?: 'none' | 'compact' | 'normal' | 'large';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'normal',
  className,
  children,
  ...props
}) => {
  const baseStyles = 'rounded-lg bg-card text-card-foreground';
  
  const variantStyles = {
    default: 'border shadow-sm',
    compact: 'border',
    elevated: 'border shadow-md',
    interactive: 'border shadow-sm hover:shadow-md transition-shadow cursor-pointer',
    bordered: 'border-2',
  };

  const paddingStyles = {
    none: '',
    compact: spacing.cardCompact,
    normal: spacing.card,
    large: spacing.cardLarge,
  };

  return (
    <div 
      className={cn(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  title,
  description,
  className, 
  children, 
  ...props 
}) => {
  if (!title && !description && !children) return null;

  return (
    <div className={cn('space-y-1.5', className)} {...props}>
      {children || (
        <>
          {title && <h3 className={typography.cardTitle}>{title}</h3>}
          {description && <p className={typography.cardDescription}>{description}</p>}
        </>
      )}
    </div>
  );
};

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'none' | 'compact' | 'normal' | 'large';
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({ 
  spacing: spacingProp = 'normal',
  className, 
  children, 
  ...props 
}) => {
  const spacingStyles = {
    none: '',
    compact: spacing.stack.sm,
    normal: spacing.stack.md,
    large: spacing.stack.lg,
  };

  return (
    <div className={cn(spacingStyles[spacingProp], className)} {...props}>
      {children}
    </div>
  );
};

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'between';
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({ 
  align = 'left',
  className, 
  children, 
  ...props 
}) => {
  const alignStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div 
      className={cn(
        'flex items-center pt-4 border-t',
        alignStyles[align],
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};
