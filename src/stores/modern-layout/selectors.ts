import { useModernLayoutStore } from './store';

// Selectores para navegación - usando selectores individuales para evitar objetos
export const useActiveTab = () => useModernLayoutStore((state) => state.activeTab);
export const useNavigationHistory = () => useModernLayoutStore((state) => state.navigationHistory);
export const useCanGoBack = () => useModernLayoutStore((state) => state.canGoBack);

// Selectores para UI - usando selectores individuales
export const useIsNavigationVisible = () => useModernLayoutStore((state) => state.isNavigationVisible);
export const useShowMoreMenu = () => useModernLayoutStore((state) => state.showMoreMenu);

// Selectores para configuración - usando selectores individuales
export const useNavigationType = () => useModernLayoutStore((state) => state.navigationType);
export const useTitle = () => useModernLayoutStore((state) => state.title);
export const useSubtitle = () => useModernLayoutStore((state) => state.subtitle);
export const useShowBackButton = () => useModernLayoutStore((state) => state.showBackButton);

// Acciones - estas son estables y no causan re-renders
export const useNavigationActions = () => useModernLayoutStore((state) => ({
  setActiveTab: state.setActiveTab,
  navigateTo: state.navigateTo,
  goBack: state.goBack,
  clearHistory: state.clearHistory,
}));

export const useUIActions = () => useModernLayoutStore((state) => ({
  setNavigationVisible: state.setNavigationVisible,
  toggleMoreMenu: state.toggleMoreMenu,
  closeMoreMenu: state.closeMoreMenu,
}));

export const useConfigActions = () => useModernLayoutStore((state) => ({
  setNavigationType: state.setNavigationType,
  setTitle: state.setTitle,
  setSubtitle: state.setSubtitle,
  setShowBackButton: state.setShowBackButton,
}));

// Selectores compuestos para compatibilidad (solo si es necesario)
export const useNavigationState = () => ({
  activeTab: useActiveTab(),
  navigationHistory: useNavigationHistory(),
  canGoBack: useCanGoBack(),
});

export const useUIState = () => ({
  isNavigationVisible: useIsNavigationVisible(),
  showMoreMenu: useShowMoreMenu(),
});

export const useConfigState = () => ({
  navigationType: useNavigationType(),
  title: useTitle(),
  subtitle: useSubtitle(),
  showBackButton: useShowBackButton(),
}); 