import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'compact' | 'elevated' | 'interactive' | 'bordered';
  padding?: 'none' | 'compact' | 'normal' | 'large';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'normal',
  className = '',
  children,
  ...props
}) => {
  // Use ds-* classes from the container's CSS
  let classes = 'ds-card';
  
  // Add variant classes
  if (variant === 'elevated') {
    classes += ' ds-card-elevated';
  } else if (variant === 'interactive') {
    classes += ' ds-card-interactive';
  } else if (variant === 'bordered') {
    classes += ' ds-card-bordered';
  }
  
  // Add padding classes
  if (padding === 'compact') {
    classes += ' ds-card-compact';
  } else if (padding === 'large') {
    classes += ' ds-card-padded';
  }
  
  // Add custom className if provided
  if (className) {
    classes += ' ' + className;
  }

  return (
    <div className={classes} {...props}>
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
  className = '', 
  children, 
  ...props 
}) => {
  if (!title && !description && !children) return null;

  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children || (
        <>
          {title && <h3 className="ds-card-title">{title}</h3>}
          {description && <p className="ds-text-muted ds-text-small mt-1">{description}</p>}
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
  className = '', 
  children, 
  ...props 
}) => {
  let spacingClass = '';
  if (spacingProp === 'compact') {
    spacingClass = 'ds-stack-sm';
  } else if (spacingProp === 'normal') {
    spacingClass = 'ds-stack';
  } else if (spacingProp === 'large') {
    spacingClass = 'ds-stack-lg';
  }

  return (
    <div className={`${spacingClass} ${className}`.trim()} {...props}>
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
  className = '', 
  children, 
  ...props 
}) => {
  const alignClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  }[align];

  return (
    <div 
      className={`flex items-center pt-4 border-t ${alignClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};