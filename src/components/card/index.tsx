import React from 'react';
import { THEME_CONTAINERS, THEME_RESPONSIVE } from '../../constants/theme';
import type { UISize, UIVariant } from '../../interfaces';
import { cn } from '../../utils/functions/style-utils';
import { CardContent, CardHeader } from './components';

export interface CardProps {
  children: React.ReactNode;
  variant?: UIVariant;
  size?: UISize;
  className?: string;
  header?: React.ReactNode;
}

/**
 * Componente Card genérico usando sistema de tema
 * Estructura modular con CardHeader y CardContent opcionales
 * Responsive design con padding y spacing adaptativos
 */
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  header
}) => {
  const cardClasses = cn(
    THEME_CONTAINERS.card.base,
    THEME_CONTAINERS.card.variants[variant],
    THEME_RESPONSIVE.card.container,
    THEME_RESPONSIVE.card.padding,
    className
  );

  if (header) {
    return (
      <div className={cardClasses}>
        <CardHeader size={size}>
          {header}
        </CardHeader>
        <CardContent size={size}>
          {children}
        </CardContent>
      </div>
    );
  }

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
};

// Re-export components for convenience
export { CardContent, CardHeader };
