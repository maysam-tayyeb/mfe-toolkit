import React from 'react';
import { cn } from '@mfe-toolkit/shared';

export interface InfoSection {
  label: string;
  value: string | React.ReactNode;
  highlight?: boolean;
}

export interface InfoBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  sections: InfoSection[];
  columns?: 1 | 2 | 3 | 4;
}

export const InfoBlock: React.FC<InfoBlockProps> = ({
  title,
  sections,
  columns = 3,
  className,
  ...props
}) => {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-4',
  }[columns];

  return (
    <div className={cn('bg-muted/50 rounded-lg p-6', className)} {...props}>
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className={cn('grid gap-4 text-sm', gridClass)}>
        {sections.map((section, index) => (
          <div key={index}>
            <span className="text-muted-foreground">{section.label}:</span>
            <p className={cn('font-medium', section.highlight && 'text-primary')}>
              {section.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
