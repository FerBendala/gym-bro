import type { ThemeStatCardSize, ThemeStatCardVariant } from '@/constants/theme';
import { useMemo } from 'react';
import { getStatCardStyles } from '../utils';

export const useStatCard = (
  variant: ThemeStatCardVariant,
  size: ThemeStatCardSize
) => {
  const styles = useMemo(() => {
    return getStatCardStyles(variant, size);
  }, [variant, size]);

  return {
    styles,
  };
}; 