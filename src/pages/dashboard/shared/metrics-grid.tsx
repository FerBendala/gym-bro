import React from 'react';

interface MetricsGridProps {
  children: React.ReactNode;
  className?: string;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4 ${className}`}>
      {children}
    </div>
  );
}; 