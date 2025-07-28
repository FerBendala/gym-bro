import type { ThemeTabSize, ThemeTabVariant } from '@/constants/theme/index.constants';
import { useMemo } from 'react';
import { getTabStyles } from '../utils';

export const useTabNavigation = (size: ThemeTabSize, variant: ThemeTabVariant) => {
  const { variantStyles, sizeStyles } = useMemo(() => {
    return getTabStyles(variant, size);
  }, [variant, size]);

  return {
    variantStyles,
    sizeStyles,
  };
}; 