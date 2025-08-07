import React from 'react';

import { BottomNavigation } from './components/bottom-navigation';
import { TopNavigation } from './components/top-navigation';
import { LayoutProps } from './types';

import { MODERN_THEME } from '@/constants/theme';
import { useSubtitle, useTitle } from '@/stores/modern-layout';
import { cn } from '@/utils';

/**
 * Layout moderno con navegación bottom-sheet
 * Optimizado para móvil con soporte completo para desktop
 * Usa Zustand para el estado global
 */
export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  title,
  subtitle,
  headerActions,
  showBackButton = false,
  onBackClick,
  isNavigationVisible = true,
  onChatMessage,
  isChatLoading = false,
  isChatConnected = true,
}) => {
  const storeTitle = useTitle();
  const storeSubtitle = useSubtitle();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 relative flex flex-col">
      {/* Top Navigation */}
      <TopNavigation
        title={title ?? storeTitle}
        subtitle={subtitle ?? storeSubtitle}
        headerActions={headerActions}
        showBackButton={showBackButton}
        onBackClick={onBackClick}
      />

      {/* Main Content */}
      <main className={cn(
        'min-h-max py-8 grow', // Espaciado ajustado para menú sticky
        MODERN_THEME.layout.container.base,
        MODERN_THEME.layout.section.padding.mobile,
      )}>
        <div className={cn(
          MODERN_THEME.animations.fade.in,
          MODERN_THEME.animations.slide.up,
        )}>
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
        isNavigationVisible={isNavigationVisible}
        onChatMessage={onChatMessage}
        isChatLoading={isChatLoading}
        isChatConnected={isChatConnected}
      />

      {/* Overlay para modales */}
      <div id="modal-root" />
    </div>
  );
};
