import { ModernNavItem, NavigationType } from '@/components/layout/types';
import { ModernLayoutStore } from './types';

// Acciones de navegación
export const createModernLayoutNavigationActions = (
  set: (fn: (state: ModernLayoutStore) => Partial<ModernLayoutStore>) => void,
  get: () => ModernLayoutStore
) => ({
  setActiveTab: (tab: ModernNavItem) => {
    set((_state) => ({ activeTab: tab }));
  },

  navigateTo: (tab: ModernNavItem) => {
    const { navigationHistory } = get();
    const newHistory = [...navigationHistory, tab];

    set((_state) => ({
      activeTab: tab,
      navigationHistory: newHistory,
      canGoBack: newHistory.length > 1,
    }));
  },

  goBack: () => {
    const { navigationHistory } = get();

    if (navigationHistory.length > 1) {
      const newHistory = navigationHistory.slice(0, -1);
      const previousTab = newHistory[newHistory.length - 1];

      set((_state) => ({
        activeTab: previousTab,
        navigationHistory: newHistory,
        canGoBack: newHistory.length > 1,
      }));

      return true;
    }

    return false;
  },

  clearHistory: () => {
    const { activeTab } = get();
    set((_state) => ({
      navigationHistory: [activeTab],
      canGoBack: false,
    }));
  },
});

// Acciones de UI
export const createModernLayoutUIActions = (
  set: (fn: (state: ModernLayoutStore) => Partial<ModernLayoutStore>) => void
) => ({
  setNavigationVisible: (visible: boolean) => {
    set((_state) => ({ isNavigationVisible: visible }));
  },

  toggleMoreMenu: () => {
    set((state) => ({ showMoreMenu: !state.showMoreMenu }));
  },

  closeMoreMenu: () => {
    set((_state) => ({ showMoreMenu: false }));
  },
});

// Acciones de configuración
export const createModernLayoutConfigActions = (
  set: (fn: (state: ModernLayoutStore) => Partial<ModernLayoutStore>) => void
) => ({
  setNavigationType: (type: NavigationType) => {
    set((_state) => ({ navigationType: type }));
  },

  setTitle: (title: string) => {
    set((_state) => ({ title }));
  },

  setSubtitle: (subtitle?: string) => {
    set((_state) => ({ subtitle }));
  },

  setShowBackButton: (show: boolean) => {
    set((_state) => ({ showBackButton: show }));
  },
});

// Acciones de utilidad
export const createModernLayoutUtilityActions = (
  set: (fn: (state: ModernLayoutStore) => Partial<ModernLayoutStore>) => void
) => ({
  reset: () => {
    set((_state) => ({
      activeTab: 'home',
      navigationHistory: ['home'],
      navigationType: 'grid',
      isNavigationVisible: true,
      showMoreMenu: false,
      title: 'Gym Tracker',
      subtitle: undefined,
      showBackButton: false,
      canGoBack: false,
    }));
  },
}); 