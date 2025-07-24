import { THEME_RESPONSIVE } from '@/constants/theme';
import React from 'react';
import type { TabContainerProps } from '../types';
import { getDesktopContainerClasses, getMobileContainerClasses } from '../utils';

export const TabContainer: React.FC<TabContainerProps> = ({
  children,
  isMobile = false
}) => {
  const containerClasses = isMobile
    ? getMobileContainerClasses()
    : getDesktopContainerClasses();

  const innerClasses = isMobile
    ? THEME_RESPONSIVE.navigation.mobile.inner
    : THEME_RESPONSIVE.navigation.desktop.inner;

  return (
    <div className={containerClasses}>
      <div className={innerClasses}>
        {children}
      </div>
    </div>
  );
}; 