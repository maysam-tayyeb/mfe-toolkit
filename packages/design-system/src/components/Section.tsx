import React from 'react';
import { cn } from '@mfe/shared';
import { textStyles } from '../patterns';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'default' | 'muted';
}

export const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  children,
  variant = 'default',
  className,
  ...props
}) => {
  const wrapperClass = variant === 'muted' ? 'bg-muted/50 rounded-lg p-6 space-y-6' : 'space-y-6';

  return (
    <section className={cn(wrapperClass, className)} {...props}>
      {(title || subtitle) && (
        <div>
          {title && <h2 className={textStyles.h2}>{title}</h2>}
          {subtitle && <p className={textStyles.subtitle}>{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
};
