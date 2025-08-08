export interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  subtext?: string;
  className?: string;
}

export function LoadingState({
  size = 'md',
  text,
  subtext,
  className = ''
}: LoadingStateProps) {
  const spinnerClass = size === 'sm' ? 'ds-spinner-sm' : 
                       size === 'lg' ? 'ds-spinner-lg' : 
                       'ds-spinner-md';
  
  return (
    <div className={`ds-loading-state ${className}`}>
      <div className={spinnerClass}></div>
      {text && (
        <p className="ds-loading-text">{text}</p>
      )}
      {subtext && (
        <p className="ds-loading-subtext">{subtext}</p>
      )}
    </div>
  );
}