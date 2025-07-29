import { clsx } from 'clsx';
import React from 'react';

import type { CardHeaderProps } from '../types';

import { THEME_CONTAINERS, THEME_SPACING } from '@/constants';

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  size = 'md',
}) => {
  return (
    <div className={clsx(
      THEME_SPACING.padding[size],
      `border-b mb-4 ${THEME_CONTAINERS.divider}`,
      className,
    )}>
      {children}
    </div>
  );
};
