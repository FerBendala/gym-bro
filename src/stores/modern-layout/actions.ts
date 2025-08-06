import { ModernLayoutStore } from './types';

import { ModernNavItem, NavigationType } from '@/components/layout/types';

// Acciones de navegación
export const createModernLayoutNavigationActions = (
  set: (fn: (state: ModernLayoutStore) => Partial<ModernLayoutStore>) => void,
  get: () => ModernLayoutStore,
) => ({
  setActiveTab: (tab: ModernNavItem) => {
    set(() => ({ activeTab: tab }));
  },

  navigateTo: (tab: ModernNavItem, params?: Record<string, any>) => {
    const { navigationHistory } = get();
    const newHistory = [...navigationHistory, tab];

    set(() => ({
      activeTab: tab,
      navigationHistory: newHistory,
      canGoBack: newHistory.length > 1,
      navigationParams: params || {},
    }));
  },

  goBack: () => {
    const { navigationHistory } = get();

    if (navigationHistory.length > 1) {
      const newHistory = navigationHistory.slice(0, -1);
      const previousTab = newHistory[newHistory.length - 1];

      set(() => ({
        activeTab: previousTab,
        navigationHistory: newHistory,
        canGoBack: newHistory.length > 1,
        navigationParams: {},
      }));

      return true;
    }

    return false;
  },

  clearHistory: () => {
    const { activeTab } = get();
    set(() => ({
      navigationHistory: [activeTab],
      canGoBack: false,
      navigationParams: {},
    }));
  },
});

// Acciones de UI
export const createModernLayoutUIActions = (
  set: (fn: (state: ModernLayoutStore) => Partial<ModernLayoutStore>) => void,
) => ({
  setNavigationVisible: (visible: boolean) => {
    set(() => ({ isNavigationVisible: visible }));
  },

  toggleMoreMenu: () => {
    set((state) => ({ showMoreMenu: !state.showMoreMenu }));
  },

  closeMoreMenu: () => {
    set(() => ({ showMoreMenu: false }));
  },
});

// Acciones de configuración
export const createModernLayoutConfigActions = (
  set: (fn: (state: ModernLayoutStore) => Partial<ModernLayoutStore>) => void,
) => ({
  setNavigationType: (type: NavigationType) => {
    set(() => ({ navigationType: type }));
  },

  setTitle: (title: string) => {
    set(() => ({ title }));
  },

  setSubtitle: (subtitle?: string) => {
    set(() => ({ subtitle }));
  },

  setShowBackButton: (show: boolean) => {
    set(() => ({ showBackButton: show }));
  },
});

// Acciones de utilidad
export const createModernLayoutUtilityActions = (
  set: (fn: (state: ModernLayoutStore) => Partial<ModernLayoutStore>) => void,
) => ({
  setNavigationParams: (params: Record<string, any>) => {
    set(() => ({ navigationParams: params }));
  },

  clearNavigationParams: () => {
    set(() => ({ navigationParams: {} }));
  },

  reset: () => {
    set(() => ({
      activeTab: 'home',
      navigationHistory: ['home'],
      navigationType: 'grid',
      isNavigationVisible: true,
      showMoreMenu: false,
      title: 'Gym Tracker',
      subtitle: undefined,
      showBackButton: false,
      canGoBack: false,
      navigationParams: {},
    }));
  },
});
