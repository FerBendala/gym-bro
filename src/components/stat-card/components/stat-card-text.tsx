import React from 'react';

import type { StatCardTextProps } from '../types';

import { THEME_STAT_CARD } from '@/constants/theme';
import { cn } from '@/utils';

export const StatCardText: React.FC<StatCardTextProps> = ({
  title,
  value,
  size,
}) => {
  const titleSize = THEME_STAT_CARD.content.title.sizes[size];
  const valueSize = THEME_STAT_CARD.content.value.sizes[size];

  return (
    <div className={THEME_STAT_CARD.content.container}>
      <p className={cn(
        THEME_STAT_CARD.content.title.base,
        titleSize,
      )}>
        {title}
      </p>
      <p
        className={cn(
          THEME_STAT_CARD.content.value.base,
          valueSize,
        )}
        title={value}
      >
        {value}
      </p>
    </div>
  );
};
