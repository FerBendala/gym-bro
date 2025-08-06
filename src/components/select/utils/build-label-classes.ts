import { THEME_FORM } from '@/constants/theme';
import { cn } from '@/utils';
import { SelectSize } from '../types';

export const buildLabelClasses = (
  size: SelectSize,
  hasError: boolean,
): string => {
  return cn(
    THEME_FORM.label.base,
    THEME_FORM.label.sizes[size],
    hasError ? THEME_FORM.label.colors.error : THEME_FORM.label.colors.default,
  );
};
