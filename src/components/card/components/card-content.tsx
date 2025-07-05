import { clsx } from 'clsx';
import React from 'react';
import { THEME_SPACING } from '../../../constants';
import type { CardContentProps } from '../types';

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
  size = 'none'
}) => {
  return (
    <div className={clsx(
      THEME_SPACING.padding[size],
      className
    )}>
      {children}
    </div>
  );
}; 