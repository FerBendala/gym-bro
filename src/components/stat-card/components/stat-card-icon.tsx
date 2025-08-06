import React from 'react';

import type { StatCardIconProps } from '../types';

import { THEME_STAT_CARD } from '@/constants/theme';
import { cn } from '@/utils';

export const StatCardIcon: React.FC<StatCardIconProps> = ({
  icon: Icon,
  variant,
  size,
}) => {
  const variantStyles = THEME_STAT_CARD.variants[variant];
  const iconSize = THEME_STAT_CARD.icon.sizes[size];

  return (
    <div className={cn(
      THEME_STAT_CARD.icon.container,
      variantStyles,
    )}>
      <Icon className={cn(
        iconSize,
      )} />
    </div>
  );
};
