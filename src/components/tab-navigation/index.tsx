import React from 'react';
import { DAYS } from '../../constants';
import { THEME_RESPONSIVE, THEME_TABS, type ThemeTabSize, type ThemeTabVariant } from '../../constants/theme';
import type { DayOfWeek } from '../../interfaces';
import { cn, formatDayLabel } from '../../utils/functions';

export interface TabNavigationProps {
  activeDay: DayOfWeek;
  onDayChange: (day: DayOfWeek) => void;
  size?: ThemeTabSize;
  variant?: ThemeTabVariant;
}

/**
 * Componente de navegación por tabs responsive
 * Optimizado para móvil con touch targets y scroll horizontal
 * Se adapta a desktop con centrado y mejor spacing
 */
export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeDay,
  onDayChange,
  size = 'md',
  variant = 'default'
}) => {
  const variantStyles = THEME_TABS.variants[variant];
  const sizeStyles = THEME_TABS.sizes[size];

  return (
    <div className={THEME_TABS.container.base}>
      {/* Contenedor móvil con scroll horizontal */}
      <div className={cn(
        THEME_RESPONSIVE.navigation.mobile.container,
        'sm:hidden'
      )}>
        <div className={THEME_RESPONSIVE.navigation.mobile.inner}>
          {DAYS.map((day) => {
            const isActive = activeDay === day;

            return (
              <button
                key={day}
                onClick={() => onDayChange(day)}
                className={cn(
                  THEME_TABS.tab.base,
                  THEME_RESPONSIVE.touch.tab.mobile,
                  THEME_RESPONSIVE.touch.minTarget,
                  THEME_RESPONSIVE.navigation.mobile.item,
                  isActive ? variantStyles.active : variantStyles.inactive
                )}
              >
                {formatDayLabel(day)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenedor desktop centrado */}
      <div className={cn(
        THEME_RESPONSIVE.navigation.desktop.container,
        'hidden sm:block'
      )}>
        <div className={THEME_RESPONSIVE.navigation.desktop.inner}>
          {DAYS.map((day) => {
            const isActive = activeDay === day;

            return (
              <button
                key={day}
                onClick={() => onDayChange(day)}
                className={cn(
                  THEME_TABS.tab.base,
                  sizeStyles,
                  THEME_RESPONSIVE.touch.tab.tablet,
                  isActive ? variantStyles.active : variantStyles.inactive
                )}
              >
                {formatDayLabel(day)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};