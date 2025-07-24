import React from 'react';
import { THEME_COLORS, THEME_RESPONSIVE } from '../../constants/theme';
import type { UISize, UIVariant } from '../../interfaces';
import { cn } from '../../utils/functions/style-utils';
import { LoadingSpinner } from '../loading-spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: UIVariant;
  size?: UISize;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium rounded-lg',
    THEME_COLORS.transition,
    THEME_COLORS.focus,
    THEME_COLORS.disabled,
    // Touch targets responsive
    size === 'sm' ? cn(
      THEME_RESPONSIVE.touch.button.mobile,
      THEME_RESPONSIVE.touch.button.tablet
    ) : THEME_COLORS.sizes[size]
  );

  return (
    <button
      className={cn(
        baseClasses,
        THEME_COLORS.variants[variant],
        size !== 'sm' && THEME_COLORS.sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <LoadingSpinner size="sm" className="-ml-1 mr-2" />
      )}
      {children}
    </button>
  );
};