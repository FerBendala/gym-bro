import type { ThemeStatCardSize, ThemeStatCardVariant } from '@/constants/theme/index.constants';
import { THEME_STAT_CARD } from '@/constants/theme/index.constants';

export const getStatCardStyles = (variant: ThemeStatCardVariant, size: ThemeStatCardSize) => {
  const variantStyles = THEME_STAT_CARD.variants[variant];
  const iconSize = THEME_STAT_CARD.icon.sizes[size];
  const titleSize = THEME_STAT_CARD.content.title.sizes[size];
  const valueSize = THEME_STAT_CARD.content.value.sizes[size];
  const padding = THEME_STAT_CARD.padding[size];

  return {
    variantStyles,
    iconSize,
    titleSize,
    valueSize,
    padding,
  };
}; 