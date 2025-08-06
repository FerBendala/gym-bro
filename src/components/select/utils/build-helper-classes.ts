import { THEME_FORM } from '@/constants/theme';
import { cn } from '@/utils';
import { SelectSize } from '../types';

export const buildHelperClasses = (size: SelectSize): string => {
  return cn(
    THEME_FORM.helper.base,
    THEME_FORM.helper.sizes[size],
  );
};
