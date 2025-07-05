import React from 'react';
import type { ModernCardVariant } from '../../constants/modern-theme';
import { MODERN_THEME } from '../../constants/modern-theme';
import { cn } from '../../utils/functions/style-utils';

interface ModernCardProps {
  variant?: ModernCardVariant;
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isClickable?: boolean;
  isActive?: boolean;
}

interface ModernCardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

interface ModernCardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface ModernCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

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
      className={cn(
        MODERN_THEME.components.card.base,
        MODERN_THEME.components.card.variants[variant],
        MODERN_THEME.components.card.padding[padding],
        MODERN_THEME.animations.transition.normal,
        MODERN_THEME.accessibility.motion.reduce,
        (onClick || isClickable) && [
          'cursor-pointer',
          MODERN_THEME.touch.tap,
          MODERN_THEME.accessibility.focusRing,
          'hover:scale-[1.02]'
        ],
        isActive && 'ring-2 ring-blue-500/50',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * Header de la tarjeta con título y acciones
 */
export const ModernCardHeader: React.FC<ModernCardHeaderProps> = ({
  title,
  subtitle,
  actions,
  className
}) => {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)}>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-semibold text-white leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center space-x-2 ml-4">
          {actions}
        </div>
      )}
    </div>
  );
};

/**
 * Contenido principal de la tarjeta
 */
export const ModernCardContent: React.FC<ModernCardContentProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  );
};

/**
 * Footer de la tarjeta con acciones
 */
export const ModernCardFooter: React.FC<ModernCardFooterProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn(
      'flex items-center justify-between pt-4 mt-4 border-t border-gray-700/50',
      className
    )}>
      {children}
    </div>
  );
};

// Variantes específicas para casos comunes
interface ModernStatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const ModernStatsCard: React.FC<ModernStatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  className
}) => {
  return (
    <ModernCard
      variant="default"
      padding="md"
      className={cn('text-center', className)}
    >
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
    </ModernCard>
  );
};

interface ModernExerciseCardProps {
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
}

export const ModernExerciseCard: React.FC<ModernExerciseCardProps> = ({
  title,
  category,
  description,
  lastWorkout,
  isCompleted = false,
  onStart,
  onViewDetails,
  className
}) => {
  return (
    <ModernCard
      variant={isCompleted ? 'success' : 'default'}
      padding="md"
      className={className}
    >
      <ModernCardHeader
        title={title}
        subtitle={category}
        actions={
          <div className="flex items-center space-x-2">
            {isCompleted && (
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        }
      />

      <ModernCardContent>
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
      </ModernCardContent>

      <ModernCardFooter>
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
      </ModernCardFooter>
    </ModernCard>
  );
}; 