import { MODERN_THEME } from '@/constants/modern-theme';
import { cn } from '@/utils/functions/style-utils';
import React, { useState } from 'react';
import { BottomNavigation } from './components/bottom-navigation';
import { TopNavigation } from './components/top-navigation';
import { DEFAULT_NAVIGATION_TYPE, DEFAULT_TITLE } from './constants';
import { ModernLayoutProps } from './types';

/**
 * Layout moderno con navegación bottom-sheet
 * Optimizado para móvil con soporte completo para desktop
 */
export const ModernLayout: React.FC<ModernLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  title = DEFAULT_TITLE,
  subtitle,
  headerActions,
  showBackButton = false,
  onBackClick,
  navigationType = DEFAULT_NAVIGATION_TYPE
}) => {
  const [isNavigationVisible] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 relative flex flex-col">
      {/* Top Navigation */}
      <TopNavigation
        title={title}
        subtitle={subtitle}
        headerActions={headerActions}
        showBackButton={showBackButton}
        onBackClick={onBackClick}
      />

      {/* Main Content */}
      <main className={cn(
        'min-h-max py-8 grow', // Espaciado ajustado para menú sticky
        MODERN_THEME.layout.container.base,
        MODERN_THEME.responsive.spacing.section
      )}>
        <div className={cn(
          MODERN_THEME.animations.fade.in,
          MODERN_THEME.animations.slide.up
        )}>
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
        navigationType={navigationType}
        isNavigationVisible={isNavigationVisible}
      />

      {/* Overlay para modales */}
      <div id="modal-root" />
    </div>
  );
}; 