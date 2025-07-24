import type { ThemeAlertVariant } from '@/constants/theme';
import { THEME_CONTAINERS } from '@/constants/theme';

export const getAlertStyles = (variant: ThemeAlertVariant, className: string): string => {
  const baseStyles = `${THEME_CONTAINERS.alert.base} ${THEME_CONTAINERS.alert.variants[variant]}`;
  return `${baseStyles} ${className}`.trim();
};

export const getIconClassName = (defaultClassName: string, customClassName: string): string => {
  return `${defaultClassName} ${customClassName}`.trim();
}; 