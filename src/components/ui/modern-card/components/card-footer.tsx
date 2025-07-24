import React from 'react';
import type { ModernCardFooterProps } from '../types';
import { getCardFooterClasses } from '../utils';

export const CardFooter: React.FC<ModernCardFooterProps> = ({
  children,
  className
}) => {
  return (
    <div className={getCardFooterClasses(className)}>
      {children}
    </div>
  );
}; 