import React from 'react';
import { THEME_COLORS, THEME_RESPONSIVE } from '../../constants/theme';
import type { UISize, UIVariant } from '../../interfaces';
import { cn } from '../../utils/functions/style-utils';
import { LoadingSpinner } from '../loading-spinner';

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
    'inline-flex items-center justify-center font-medium rounded-lg',
    THEME_COLORS.transition,
    THEME_COLORS.focus,
    THEME_COLORS.disabled,
    // Touch targets responsive
    size === 'sm' ? cn(
      THEME_RESPONSIVE.touch.button.mobile,
      THEME_RESPONSIVE.touch.button.tablet
    ) : THEME_COLORS.sizes[size],
    fullWidth && 'w-full',
    isDisabled && 'opacity-50 cursor-not-allowed'
  );

  return (
    <button
      className={cn(
        baseClasses,
        THEME_COLORS.variants[variant],
        size !== 'sm' && THEME_COLORS.sizes[size],
        className
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
      className
    )}
    {...props}
  >
    {icon}
  </Button>
);