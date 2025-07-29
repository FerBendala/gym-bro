import React from 'react';

import { LoadingSpinner } from '@/components/loading-spinner';
import { COLOR_VARIANTS, COMPONENT_SIZES, THEME_RESPONSIVE } from '@/constants/theme';
import type { UISize, UIVariant } from '@/interfaces';
import { cn } from '@/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: UIVariant;
  size?: UISize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed',
    // Touch targets responsive
    size === 'sm' ? THEME_RESPONSIVE.touch.minTarget : COMPONENT_SIZES[size],
    fullWidth && 'w-full',
    isDisabled && 'opacity-50 cursor-not-allowed',
  );

  return (
    <button
      className={cn(
        baseClasses,
        COLOR_VARIANTS[variant],
        size !== 'sm' && COMPONENT_SIZES[size],
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <LoadingSpinner size="sm" className="-ml-1 mr-2" />
      )}

      {leftIcon && !loading && (
        <span className="mr-2 flex-shrink-0">
          {leftIcon}
        </span>
      )}

      <span className="truncate">
        {children}
      </span>

      {rightIcon && (
        <span className="ml-2 flex-shrink-0">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

// Variantes específicas para casos comunes
export const IconButton: React.FC<Omit<ButtonProps, 'children'> & { icon: React.ReactNode; 'aria-label': string }> = ({
  icon,
  className,
  ...props
}) => (
  <Button
    className={`p-2 min-w-0 ${className || ''}`}
    {...props}
  >
    {icon}
  </Button>
);

export const FloatingButton: React.FC<Omit<ButtonProps, 'children'> & { icon: React.ReactNode; 'aria-label': string }> = ({
  icon,
  className,
  ...props
}) => (
  <Button
    className={cn(
      'fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-2xl z-30',
      'hover:scale-110 active:scale-95',
      className,
    )}
    {...props}
  >
    {icon}
  </Button>
);
