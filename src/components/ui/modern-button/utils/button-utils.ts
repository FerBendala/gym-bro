import { cn } from '@/utils/functions/style-utils';
import { BUTTON_BASE_CLASSES, BUTTON_SIZES, BUTTON_VARIANTS, LOADING_SPINNER_CLASSES } from '../constants';
import type { ModernButtonSize, ModernButtonVariant } from '../types';

/**
 * Genera las clases CSS para el botón base
 */
export const getButtonClasses = (
  variant: ModernButtonVariant,
  size: ModernButtonSize,
  fullWidth: boolean,
  isDisabled: boolean,
  className?: string
): string => {
  return cn(
    BUTTON_BASE_CLASSES,
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    fullWidth && 'w-full',
    isDisabled && 'opacity-50 cursor-not-allowed',
    className
  );
};

/**
 * Genera las clases CSS para el spinner de carga
 */
export const getLoadingSpinnerClasses = (size: ModernButtonSize): string => {
  const spinnerSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  return cn(
    LOADING_SPINNER_CLASSES,
    spinnerSizes[size],
    'mr-2'
  );
};

/**
 * Genera las clases CSS para el botón flotante
 */
export const getFloatingButtonClasses = (className?: string): string => {
  return cn(
    'fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-2xl z-30',
    'hover:scale-110 active:scale-95',
    className
  );
}; 