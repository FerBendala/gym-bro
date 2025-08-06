import { THEME_FORM } from '@/constants/theme';
import { cn } from '@/utils';
import { SelectSize } from '../types';

export const buildErrorClasses = (size: SelectSize): string => {
  return cn(
    THEME_FORM.error.base,
    THEME_FORM.error.sizes[size],
  );
};
