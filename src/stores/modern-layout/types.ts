import { ModernNavItem, NavigationType } from '@/components/modern-layout/types';

// Estado del store
export interface ModernLayoutState {
  // Navegación
  activeTab: ModernNavItem;
  navigationHistory: ModernNavItem[];
  navigationType: NavigationType;

  // UI
  isNavigationVisible: boolean;
  showMoreMenu: boolean;

  // Configuración
  title: string;
  subtitle?: string;
  showBackButton: boolean;

  // Computed values
  canGoBack: boolean;
}

// Acciones del store
export interface ModernLayoutActions {
  // Navegación
  setActiveTab: (tab: ModernNavItem) => void;
  navigateTo: (tab: ModernNavItem) => void;
  goBack: () => boolean;
  clearHistory: () => void;

  // UI
  setNavigationVisible: (visible: boolean) => void;
  toggleMoreMenu: () => void;
  closeMoreMenu: () => void;

  // Configuración
  setNavigationType: (type: NavigationType) => void;
  setTitle: (title: string) => void;
  setSubtitle: (subtitle?: string) => void;
  setShowBackButton: (show: boolean) => void;

  // Utilidades
  reset: () => void;
}

// Store completo
export interface ModernLayoutStore extends ModernLayoutState, ModernLayoutActions { } 