import React from 'react';

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
  className = '',
  ...props
}) => {
  // Use ds-* grid classes from the container's CSS
  const gridClass = {
    1: 'grid grid-cols-1',
    2: 'ds-grid-2',
    3: 'ds-grid-3',
    4: 'ds-grid-4',
  }[columns];

  return (
    <div className={`ds-card bg-muted/50 ${className}`.trim()} {...props}>
      <h3 className="ds-card-title mb-3">{title}</h3>
      <div className={`${gridClass} gap-4 text-sm`}>
        {sections.map((section, index) => (
          <div key={index}>
            <span className="ds-text-muted">{section.label}:</span>
            <p className={`font-medium ${section.highlight ? 'text-primary' : ''}`.trim()}>
              {section.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};