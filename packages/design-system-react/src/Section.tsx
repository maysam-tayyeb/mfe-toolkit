import React from 'react';

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
  className = '',
  ...props
}) => {
  // Use ds-* classes from the container's CSS
  const wrapperClass = variant === 'muted' 
    ? 'ds-section bg-muted/50 rounded-lg p-6' 
    : 'ds-section';

  return (
    <section className={`${wrapperClass} ${className}`.trim()} {...props}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h2 className="ds-section-title">{title}</h2>}
          {subtitle && <p className="ds-text-muted mt-2">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
};