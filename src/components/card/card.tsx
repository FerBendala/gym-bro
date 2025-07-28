import { THEME_CONTAINERS, THEME_RESPONSIVE } from '@/constants/theme';
import type { UISize, UIVariant } from '@/interfaces';
import { cn } from '@/utils';
import React from 'react';
import { CardContent, CardHeader } from './components';

export interface CardProps {
  children: React.ReactNode;
  variant?: UIVariant;
  size?: UISize;
  className?: string;
  header?: React.ReactNode;
  onClick?: () => void;
  isClickable?: boolean;
  isActive?: boolean;
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
  header,
  onClick,
  isClickable = false,
  isActive = false
}) => {
  const Component = onClick || isClickable ? 'button' : 'div';

  const cardClasses = cn(
    THEME_CONTAINERS.card.base,
    THEME_CONTAINERS.card.variants[variant as keyof typeof THEME_CONTAINERS.card.variants],
    THEME_RESPONSIVE.card.container,
    THEME_RESPONSIVE.card.padding,
    (onClick || isClickable) && [
      'cursor-pointer',
      'hover:scale-[1.02]',
      'active:scale-95'
    ],
    isActive && 'ring-2 ring-blue-500/50',
    className
  );

  if (header) {
    return (
      <Component className={cardClasses} onClick={onClick}>
        <CardHeader size={size}>
          {header}
        </CardHeader>
        <CardContent size={size}>
          {children}
        </CardContent>
      </Component>
    );
  }

  return (
    <Component className={cardClasses} onClick={onClick}>
      {children}
    </Component>
  );
};

// Componentes específicos para casos comunes
export const StatsCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}> = ({ title, value, icon, trend, className }) => {
  return (
    <Card
      variant="default"
      className={cn('text-center', className)}
    >
      <CardContent>
        <div className="flex flex-col items-center space-y-3">
          <div className="p-3 bg-blue-600/20 rounded-full">
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {value}
            </p>
            <p className="text-sm text-gray-400">
              {title}
            </p>
            {trend && (
              <p className={cn(
                'text-xs mt-1',
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              )}>
                {trend.isPositive ? '↗' : '↘'} {trend.value}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ExerciseCard: React.FC<{
  title: string;
  category: string;
  description?: string;
  lastWorkout?: {
    weight: number;
    reps: number;
    date: string;
  };
  isCompleted?: boolean;
  onStart?: () => void;
  onViewDetails?: () => void;
  className?: string;
}> = ({ title, category, description, lastWorkout, isCompleted = false, onStart, onViewDetails, className }) => {
  return (
    <Card
      variant={isCompleted ? 'success' : 'default'}
      className={className}
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-white leading-tight">
              {title}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {category}
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {isCompleted && (
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {description && (
          <p className="text-sm text-gray-400">
            {description}
          </p>
        )}

        {lastWorkout && (
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Último entrenamiento</p>
            <p className="text-sm text-white">
              {lastWorkout.weight}kg × {lastWorkout.reps} reps
            </p>
            <p className="text-xs text-gray-500">
              {lastWorkout.date}
            </p>
          </div>
        )}
      </CardContent>

      <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-700/50">
        <button
          onClick={onViewDetails}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          Ver detalles
        </button>
        <button
          onClick={onStart}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium',
            isCompleted
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          {isCompleted ? 'Completado' : 'Empezar'}
        </button>
      </div>
    </Card>
  );
};

// Re-export components for convenience
export { CardContent, CardHeader };
