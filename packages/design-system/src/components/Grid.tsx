import React from 'react';
import { cn } from '@mfe/shared';
import { gridStyles } from '../patterns/styles';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: 2 | 3 | 4 | 'responsive';
}

export const Grid: React.FC<GridProps> = ({ 
  children,
  cols = 2,
  className,
  ...props 
}) => {
  const gridClass = cols === 'responsive' 
    ? gridStyles.responsive 
    : gridStyles[`cols${cols}` as keyof typeof gridStyles];

  return (
    <div 
      className={cn(gridClass, className)}
      {...props}
    >
      {children}
    </div>
  );
};