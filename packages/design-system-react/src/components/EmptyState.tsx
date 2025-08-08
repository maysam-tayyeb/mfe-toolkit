import React from 'react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'No data available',
  description = 'Start by adding your first item',
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`ds-empty-state ${className}`}>
      {icon && <div className="ds-empty-illustration">{icon}</div>}
      <h3 className="ds-empty-title">{title}</h3>
      {description && <p className="ds-empty-description">{description}</p>}
      {action && <div className="ds-mt-md">{action}</div>}
    </div>
  );
}
