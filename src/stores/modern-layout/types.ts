import { ModernNavItem, NavigationType } from '@/components/layout/types';

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

  // Parámetros de navegación
  navigationParams: Record<string, any>;

  // Computed values
  canGoBack: boolean;
}

// Acciones del store
export interface ModernLayoutActions {
  // Navegación
  setActiveTab: (tab: ModernNavItem) => void;
  navigateTo: (tab: ModernNavItem, params?: Record<string, any>) => void;
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

  // Parámetros de navegación
  setNavigationParams: (params: Record<string, any>) => void;
  clearNavigationParams: () => void;

  // Utilidades
  reset: () => void;
}

// Store completo
export interface ModernLayoutStore extends ModernLayoutState, ModernLayoutActions { }
