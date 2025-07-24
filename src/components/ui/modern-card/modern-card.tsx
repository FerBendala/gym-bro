import React from 'react';
import { CardContent, CardFooter, CardHeader, ExerciseCard, StatsCard } from './components';
import type {
  ModernCardContentProps,
  ModernCardFooterProps,
  ModernCardHeaderProps,
  ModernCardProps,
  ModernExerciseCardProps,
  ModernStatsCardProps
} from './types';
import { getCardClasses } from './utils';

/**
 * Tarjeta moderna con glassmorphism y efectos visuales
 * Optimizada para mobile-first con touch interactions
 */
export const ModernCard: React.FC<ModernCardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  className,
  onClick,
  isClickable = false,
  isActive = false,
  ...props
}) => {
  const Component = onClick || isClickable ? 'button' : 'div';

  return (
    <Component
      className={getCardClasses(variant, padding, onClick, isClickable, isActive, className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

// Exportar componentes específicos
export { CardContent, CardFooter, CardHeader, ExerciseCard, StatsCard };

// Exportar tipos específicos
export type {
  ModernCardContentProps,
  ModernCardFooterProps, ModernCardHeaderProps, ModernExerciseCardProps, ModernStatsCardProps
};
