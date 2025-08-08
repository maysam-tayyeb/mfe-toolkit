import React from 'react';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: 2 | 3 | 4 | 'responsive';
}

export const Grid: React.FC<GridProps> = ({ 
  children, 
  cols = 2, 
  className = '', 
  ...props 
}) => {
  // Use ds-* classes from the container's CSS
  const gridClass = {
    2: 'ds-grid-2',
    3: 'ds-grid-3',
    4: 'ds-grid-4',
    responsive: 'ds-grid-responsive',
  }[cols];

  return (
    <div className={`${gridClass} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};