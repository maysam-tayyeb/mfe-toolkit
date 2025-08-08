import React from 'react';

export interface HeroProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  gradient?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function Hero({
  title,
  description,
  actions,
  gradient = false,
  className = '',
  children
}: HeroProps) {
  const heroClass = gradient ? 'ds-hero ds-hero-gradient' : 'ds-hero';
  
  return (
    <div className={`${heroClass} ${className}`}>
      <div>
        <h1 className="ds-hero-title">{title}</h1>
        {description && (
          <p className="ds-hero-description">{description}</p>
        )}
        {actions && (
          <div className="ds-mt-lg ds-flex ds-gap-sm">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}