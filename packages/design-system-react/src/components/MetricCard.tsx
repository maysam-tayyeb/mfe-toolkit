import React from 'react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ label, value, trend, icon, className = '' }: MetricCardProps) {
  const trendClass =
    trend?.direction === 'up'
      ? 'ds-metric-trend-up'
      : trend?.direction === 'down'
        ? 'ds-metric-trend-down'
        : '';

  return (
    <div className={`ds-metric-card ${className}`}>
      <div className="ds-flex ds-items-center ds-justify-between ds-mb-sm">
        <span className="ds-metric-label">{label}</span>
        {icon && <div className="ds-icon-muted">{icon}</div>}
      </div>
      <div className="ds-metric-value">{value}</div>
      {trend && (
        <div className={`ds-metric-trend ${trendClass}`}>
          {trend.direction === 'up' && '↑'}
          {trend.direction === 'down' && '↓'}
          {trend.direction === 'neutral' && '→'} {trend.value}
        </div>
      )}
    </div>
  );
}
