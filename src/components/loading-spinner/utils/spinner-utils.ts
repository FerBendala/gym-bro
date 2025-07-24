import { THEME_SPINNER } from '@/constants/theme';
import { cn, validateSize, validateVariant } from '@/utils/functions';
import { DEFAULT_SPINNER_PROPS, SPINNER_COLORS, SPINNER_SIZES, SPINNER_VARIANTS } from '../constants';
import type { LoadingSpinnerProps } from '../types';

/**
 * Utilidades específicas para el componente LoadingSpinner
 */

/**
 * Valida y normaliza las props del spinner
 */
export const validateSpinnerProps = (props: LoadingSpinnerProps) => {
  const validSize = validateSize(
    props.size,
    SPINNER_SIZES,
    DEFAULT_SPINNER_PROPS.size
  );

  const validColor = validateVariant(
    props.color,
    SPINNER_COLORS,
    DEFAULT_SPINNER_PROPS.color
  );

  const validVariant = validateVariant(
    props.variant,
    SPINNER_VARIANTS,
    DEFAULT_SPINNER_PROPS.variant
  );

  return { validSize, validColor, validVariant };
};

/**
 * Construye las clases CSS del spinner
 */
export const buildSpinnerClasses = (
  size: string,
  color: string,
  variant: string,
  className?: string
): string => {
  return cn(
    THEME_SPINNER.base,
    THEME_SPINNER.sizes[size as keyof typeof THEME_SPINNER.sizes],
    THEME_SPINNER.colors[color as keyof typeof THEME_SPINNER.colors],
    THEME_SPINNER.variants[variant as keyof typeof THEME_SPINNER.variants],
    className
  );
}; 