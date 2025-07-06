import type { LucideIcon } from 'lucide-react';
import React from 'react';
import { THEME_STAT_CARD, type ThemeStatCardSize, type ThemeStatCardVariant } from '../../constants/theme';
import { cn } from '../../utils/functions';
import { Card, CardContent } from '../card';
import { Tooltip } from '../tooltip';

export interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant?: ThemeStatCardVariant;
  size?: ThemeStatCardSize;
  className?: string;
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Componente genérico para mostrar tarjetas de estadísticas
 * Integrado completamente con THEME_STAT_CARD y utilidades genéricas
 * Reutilizable en ExerciseStats, Dashboard, Analytics, etc.
 * Incluye tooltips explicativos opcionales
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  variant = 'primary',
  size = 'md',
  className,
  tooltip,
  tooltipPosition = 'top'
}) => {
  // Obtener estilos del sistema de tema
  const variantStyles = THEME_STAT_CARD.variants[variant];
  const iconSize = THEME_STAT_CARD.icon.sizes[size];
  const titleSize = THEME_STAT_CARD.content.title.sizes[size];
  const valueSize = THEME_STAT_CARD.content.value.sizes[size];
  const padding = THEME_STAT_CARD.padding[size];

  const cardContent = (
    <Card className={cn(padding, className)}>
      <CardContent className="p-0">
        <div className={THEME_STAT_CARD.container.base}>
          <div className={cn(
            THEME_STAT_CARD.icon.container,
            variantStyles.background
          )}>
            <Icon className={cn(
              iconSize,
              variantStyles.icon
            )} />
          </div>
          <div className={THEME_STAT_CARD.content.container}>
            <p className={cn(
              THEME_STAT_CARD.content.title.base,
              titleSize
            )}>
              {title}
            </p>
            <p
              className={cn(
                THEME_STAT_CARD.content.value.base,
                valueSize
              )}
              title={value}
            >
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Si hay tooltip, envolver en el componente Tooltip
  if (tooltip) {
    return (
      <Tooltip
        content={tooltip}
        position={tooltipPosition}
        trigger="hover"
        className="block"
      >
        {cardContent}
      </Tooltip>
    );
  }

  return cardContent;
}; 