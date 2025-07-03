import { clsx } from 'clsx';
import React from 'react';
import { THEME_CONTAINERS, THEME_SPACING } from '../../../constants';
import type { CardHeaderProps } from '../types';

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  size = 'md'
}) => {
  return (
    <div className={clsx(
      THEME_SPACING.padding[size],
      `border-b ${THEME_CONTAINERS.divider}`,
      className
    )}>
      {children}
    </div>
  );
}; 