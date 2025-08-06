import React from 'react';

import { StatCardContent } from './components';
import { STAT_CARD_DEFAULTS, STAT_CARD_TOOLTIP_CONFIG } from './constants';
import type { StatCardProps } from './types';

import { Tooltip } from '@/components/tooltip';

/**
 * Componente genérico para mostrar tarjetas de estadísticas
 * Integrado completamente con THEME_STAT_CARD y utilidades genéricas
 * Reutilizable en ExerciseStats, Dashboard, Analytics, etc.
 * Incluye tooltips explicativos opcionales
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  variant = STAT_CARD_DEFAULTS.variant,
  size = STAT_CARD_DEFAULTS.size,
  className,
  tooltip,
  tooltipPosition = STAT_CARD_DEFAULTS.tooltipPosition,
}) => {
  const cardContent = (
    <StatCardContent
      title={title}
      value={value}
      icon={icon}
      variant={variant}
      size={size}
      className={className}
    />
  );

  // Si hay tooltip, envolver en el componente Tooltip
  if (tooltip) {
    return (
      <Tooltip
        content={tooltip}
        position={tooltipPosition}
        trigger={STAT_CARD_TOOLTIP_CONFIG.trigger}
        className={STAT_CARD_TOOLTIP_CONFIG.className}
      >
        {cardContent}
      </Tooltip>
    );
  }

  return cardContent;
};
