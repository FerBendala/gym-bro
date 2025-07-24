import { Card, CardContent } from '@/components/card';
import { THEME_STAT_CARD } from '@/constants/theme';
import { cn } from '@/utils/functions';
import React from 'react';
import type { StatCardContentProps } from '../types';
import { StatCardIcon } from './stat-card-icon';
import { StatCardText } from './stat-card-text';

export const StatCardContent: React.FC<StatCardContentProps> = ({
  title,
  value,
  icon,
  variant,
  size,
  className
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
const getStatCardStyles = (variant: string, size: string) => {
  const padding = THEME_STAT_CARD.padding[size as keyof typeof THEME_STAT_CARD.padding];
  return { padding };
}; 