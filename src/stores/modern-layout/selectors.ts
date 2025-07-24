import { useModernLayoutStore } from './store';

// Selectores para navegación
export const useNavigationState = () => useModernLayoutStore((state) => ({
  activeTab: state.activeTab,
  navigationHistory: state.navigationHistory,
  canGoBack: state.canGoBack,
}));

export const useNavigationActions = () => useModernLayoutStore((state) => ({
  setActiveTab: state.setActiveTab,
  navigateTo: state.navigateTo,
  goBack: state.goBack,
  clearHistory: state.clearHistory,
}));

// Selectores para UI
export const useUIState = () => useModernLayoutStore((state) => ({
  isNavigationVisible: state.isNavigationVisible,
  showMoreMenu: state.showMoreMenu,
}));

export const useUIActions = () => useModernLayoutStore((state) => ({
  setNavigationVisible: state.setNavigationVisible,
  toggleMoreMenu: state.toggleMoreMenu,
  closeMoreMenu: state.closeMoreMenu,
}));

// Selectores para configuración
export const useConfigState = () => useModernLayoutStore((state) => ({
  navigationType: state.navigationType,
  title: state.title,
  subtitle: state.subtitle,
  showBackButton: state.showBackButton,
}));

export const useConfigActions = () => useModernLayoutStore((state) => ({
  setNavigationType: state.setNavigationType,
  setTitle: state.setTitle,
  setSubtitle: state.setSubtitle,
  setShowBackButton: state.setShowBackButton,
}));

// Selectores específicos
export const useActiveTab = () => useModernLayoutStore((state) => state.activeTab);
export const useNavigationType = () => useModernLayoutStore((state) => state.navigationType);
export const useShowMoreMenu = () => useModernLayoutStore((state) => state.showMoreMenu);
export const useIsNavigationVisible = () => useModernLayoutStore((state) => state.isNavigationVisible);
export const useCanGoBack = () => useModernLayoutStore((state) => state.canGoBack); 