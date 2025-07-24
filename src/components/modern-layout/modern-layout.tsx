import { MODERN_THEME } from '@/constants/modern-theme';
import { useConfigActions, useConfigState } from '@/stores/modern-layout';
import { cn } from '@/utils/functions/style-utils';
import React from 'react';
import { BottomNavigation } from './components/bottom-navigation';
import { TopNavigation } from './components/top-navigation';
import { ModernLayoutProps } from './types';

/**
 * Layout moderno con navegación bottom-sheet
 * Optimizado para móvil con soporte completo para desktop
 * Usa Zustand para el estado global
 */
export const ModernLayout: React.FC<ModernLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  title,
  subtitle,
  headerActions,
  showBackButton = false,
  onBackClick,
  navigationType,
  isNavigationVisible = true
}) => {
  const { title: storeTitle, subtitle: storeSubtitle, navigationType: storeNavigationType } = useConfigState();
  const { setTitle, setSubtitle, setNavigationType, setShowBackButton } = useConfigActions();

  // Sincronizar props con el store
  React.useEffect(() => {
    if (title !== undefined) setTitle(title);
    if (subtitle !== undefined) setSubtitle(subtitle);
    if (navigationType !== undefined) setNavigationType(navigationType);
    if (showBackButton !== undefined) setShowBackButton(showBackButton);
  }, [title, subtitle, navigationType, showBackButton]); // Removidas las funciones del store de las dependencias

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
        navigationType={navigationType ?? storeNavigationType}
        isNavigationVisible={isNavigationVisible}
      />

      {/* Overlay para modales */}
      <div id="modal-root" />
    </div>
  );
}; 