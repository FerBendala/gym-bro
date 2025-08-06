import type { ThemeTabSize, ThemeTabVariant } from '@/constants/theme';
import { THEME_RESPONSIVE, THEME_TABS } from '@/constants/theme';
import { cn } from '@/utils';

export const getTabStyles = (variant: ThemeTabVariant, size: ThemeTabSize) => {
  const variantStyles = THEME_TABS.variants[variant];
  const sizeStyles = THEME_TABS.sizes[size];

  return { variantStyles, sizeStyles };
};

export const getMobileContainerClasses = () => {
  return cn(
    THEME_RESPONSIVE.navigation.mobile.container,
    'sm:hidden',
  );
};

export const getDesktopContainerClasses = () => {
  return cn(
    THEME_RESPONSIVE.navigation.desktop.container,
    'hidden sm:block',
  );
};

export const getTabButtonClasses = (
  isActive: boolean,
  variantStyles: { active: string; inactive: string },
  sizeStyles: string,
  isMobile: boolean,
) => {
  const baseClasses = [
    THEME_TABS.tab.base,
    isActive ? variantStyles.active : variantStyles.inactive,
  ];

  if (isMobile) {
    baseClasses.push(
      THEME_RESPONSIVE.touch.tab.mobile,
      THEME_RESPONSIVE.touch.minTarget,
      THEME_RESPONSIVE.navigation.mobile.item,
    );
  } else {
    baseClasses.push(
      sizeStyles,
      THEME_RESPONSIVE.touch.tab.tablet,
    );
  }

  return cn(...baseClasses);
};
