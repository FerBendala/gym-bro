import React from 'react';
import type { ModernButtonSize, ModernButtonVariant } from '../../constants/modern-theme';
import { MODERN_THEME } from '../../constants/modern-theme';
import { cn } from '../../utils/functions/style-utils';

interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ModernButtonVariant;
  size?: ModernButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

/**
 * Botón moderno con todas las variantes y estados
 * Optimizado para mobile-first con touch targets adecuados
 */
export const ModernButton: React.FC<ModernButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={cn(
        MODERN_THEME.components.button.base,
        MODERN_THEME.components.button.variants[variant],
        MODERN_THEME.components.button.sizes[size],
        MODERN_THEME.touch.tap,
        MODERN_THEME.accessibility.focusRing,
        MODERN_THEME.accessibility.motion.reduce,
        fullWidth && 'w-full',
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <div className={cn(
          MODERN_THEME.loading.spinner.base,
          MODERN_THEME.loading.spinner.sizes.sm,
          'mr-2'
        )} />
      )}

      {leftIcon && !isLoading && (
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
export const ModernIconButton: React.FC<Omit<ModernButtonProps, 'children'> & {
  icon: React.ReactNode;
  'aria-label': string;
}> = ({ icon, className, ...props }) => (
  <ModernButton
    className={cn('p-2 min-w-0', className)}
    {...props}
  >
    {icon}
  </ModernButton>
);

export const ModernFloatingButton: React.FC<Omit<ModernButtonProps, 'children'> & {
  icon: React.ReactNode;
  'aria-label': string;
}> = ({ icon, className, ...props }) => (
  <ModernButton
    className={cn(
      'fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-2xl z-30',
      'hover:scale-110 active:scale-95',
      className
    )}
    {...props}
  >
    {icon}
  </ModernButton>
); 