import React from 'react';

import type { StatCardContentProps } from '../types';

import { StatCardIcon } from './stat-card-icon';
import { StatCardText } from './stat-card-text';

import { Card, CardContent } from '@/components/card';
import type { ThemeStatCardSize, ThemeStatCardVariant } from '@/constants/theme';
import { THEME_STAT_CARD } from '@/constants/theme';
import { cn } from '@/utils';

export const StatCardContent: React.FC<StatCardContentProps> = ({
  title,
  value,
  icon,
  variant,
  size,
  className,
}) => {
  const { padding } = getStatCardStyles(variant, size);

  return (
    <Card className={cn(padding, className)}>
      <CardContent className="p-0">
        <div className={THEME_STAT_CARD.container.base}>
          <StatCardIcon
            icon={icon}
            variant={variant}
            size={size}
          />
          <StatCardText
            title={title}
            value={value}
            size={size}
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Función auxiliar para obtener estilos
const getStatCardStyles = (variant: ThemeStatCardVariant, size: ThemeStatCardSize) => {
  const padding = THEME_STAT_CARD.padding[size];
  return { padding };
};
