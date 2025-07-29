import { clsx } from 'clsx';
import React from 'react';

import type { CardContentProps } from '../types';

import { THEME_SPACING } from '@/constants';

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
  size = 'none',
}) => {
  return (
    <div className={clsx(
      THEME_SPACING.padding[size],
      className,
    )}>
      {children}
    </div>
  );
};
