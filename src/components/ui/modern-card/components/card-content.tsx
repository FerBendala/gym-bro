import React from 'react';
import type { ModernCardContentProps } from '../types';
import { getCardContentClasses } from '../utils';

export const CardContent: React.FC<ModernCardContentProps> = ({
  children,
  className
}) => {
  return (
    <div className={getCardContentClasses(className)}>
      {children}
    </div>
  );
}; 