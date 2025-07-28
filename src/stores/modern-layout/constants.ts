import { ModernNavItem, NavigationType } from '@/components/layout/types';

// Estado inicial
export const INITIAL_STATE = {
  // Navegación
  activeTab: 'home' as ModernNavItem,
  navigationHistory: ['home'] as ModernNavItem[],
  navigationType: 'grid' as NavigationType,

  // UI
  isNavigationVisible: true,
  showMoreMenu: false,

  // Configuración
  title: 'Gym Tracker',
  subtitle: undefined,
  showBackButton: false,

  // Computed values
  canGoBack: false,
} as const;

// Configuración de persistencia
export const PERSISTENCE_CONFIG = {
  name: 'modern-layout-store',
  partialize: (state: Record<string, unknown>) => ({
    activeTab: state.activeTab,
    navigationHistory: state.navigationHistory,
    navigationType: state.navigationType,
    title: state.title,
    subtitle: state.subtitle,
  }),
} as const; 