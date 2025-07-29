import React from 'react';

import { TabButton, TabContainer } from './components';
import { TAB_NAVIGATION_CONSTANTS } from './constants';
import { useTabNavigation } from './hooks';
import type { TabNavigationProps } from './types';

import { THEME_TABS } from '@/constants/theme';

/**
 * Componente de navegación por tabs responsive
 * Optimizado para móvil con touch targets y scroll horizontal
 * Se adapta a desktop con centrado y mejor spacing
 */
export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeDay,
  onDayChange,
  size = TAB_NAVIGATION_CONSTANTS.DEFAULT_SIZE,
  variant = TAB_NAVIGATION_CONSTANTS.DEFAULT_VARIANT,
}) => {
  const { variantStyles, sizeStyles } = useTabNavigation(size, variant);

  const renderTabButtons = (isMobile: boolean) => {
    return TAB_NAVIGATION_CONSTANTS.DAYS.map((day) => {
      const isActive = activeDay === day;

      return (
        <TabButton
          key={day}
          day={day}
          isActive={isActive}
          onClick={onDayChange}
          size={sizeStyles}
          variant={variantStyles}
          isMobile={isMobile}
        />
      );
    });
  };

  return (
    <div className={THEME_TABS.container.base}>
      {/* Contenedor móvil con scroll horizontal */}
      <TabContainer isMobile={true}>
        {renderTabButtons(true)}
      </TabContainer>

      {/* Contenedor desktop centrado */}
      <TabContainer isMobile={false}>
        {renderTabButtons(false)}
      </TabContainer>
    </div>
  );
};
