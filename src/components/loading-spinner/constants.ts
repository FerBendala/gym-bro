/**
 * Constantes específicas del componente LoadingSpinner
 */

export const SPINNER_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export const SPINNER_COLORS = ['default', 'primary', 'success', 'warning', 'danger', 'white', 'gray'] as const;
export const SPINNER_VARIANTS = ['default', 'light', 'subtle'] as const;

export const DEFAULT_SPINNER_PROPS = {
  size: 'md',
  color: 'default',
  variant: 'default',
} as const;
