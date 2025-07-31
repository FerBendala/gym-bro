import { THEME_SELECT } from '@/constants/theme';
import { cn } from '@/utils';
import { SelectSize, SelectValidation, SelectVariant } from '../types';

export const buildSelectClasses = (
  size: SelectSize,
  variant: SelectVariant,
  validation: SelectValidation,
  className?: string,
): string => {
  return cn(
    THEME_SELECT.base,
    THEME_SELECT.sizes[size],
    THEME_SELECT.variants[variant as keyof typeof THEME_SELECT.variants],
    THEME_SELECT.validation[validation],
    className,
  );
}; 