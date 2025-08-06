import { useCallback } from 'react';

import { useModernLayoutStore } from './store';

// Selectores para navegación - usando selectores individuales para evitar objetos
export const useActiveTab = () => useModernLayoutStore((state) => state.activeTab);
export const useNavigationHistory = () => useModernLayoutStore((state) => state.navigationHistory);
export const useCanGoBack = () => useModernLayoutStore((state) => state.canGoBack);
export const useNavigationParams = () => useModernLayoutStore((state) => state.navigationParams);

// Selectores para UI - usando selectores individuales
export const useIsNavigationVisible = () => useModernLayoutStore((state) => state.isNavigationVisible);
export const useShowMoreMenu = () => useModernLayoutStore((state) => state.showMoreMenu);

// Selectores para configuración - usando selectores individuales
export const useNavigationType = () => useModernLayoutStore((state) => state.navigationType);
export const useTitle = () => useModernLayoutStore((state) => state.title);
export const useSubtitle = () => useModernLayoutStore((state) => state.subtitle);
export const useShowBackButton = () => useModernLayoutStore((state) => state.showBackButton);

// Acciones individuales - más estables
export const useSetActiveTab = () => useModernLayoutStore((state) => state.setActiveTab);
export const useNavigateTo = () => useModernLayoutStore((state) => state.navigateTo);
export const useGoBack = () => useModernLayoutStore((state) => state.goBack);
export const useClearHistory = () => useModernLayoutStore((state) => state.clearHistory);
export const useSetNavigationParams = () => useModernLayoutStore((state) => state.setNavigationParams);
export const useClearNavigationParams = () => useModernLayoutStore((state) => state.clearNavigationParams);

export const useSetNavigationVisible = () => useModernLayoutStore((state) => state.setNavigationVisible);
export const useToggleMoreMenu = () => useModernLayoutStore((state) => state.toggleMoreMenu);
export const useCloseMoreMenu = () => useModernLayoutStore((state) => state.closeMoreMenu);

export const useSetNavigationType = () => useModernLayoutStore((state) => state.setNavigationType);
export const useSetTitle = () => useModernLayoutStore((state) => state.setTitle);
export const useSetSubtitle = () => useModernLayoutStore((state) => state.setSubtitle);
export const useSetShowBackButton = () => useModernLayoutStore((state) => state.setShowBackButton);

// Acciones agrupadas con useCallback para estabilidad
export const useNavigationActions = () => {
  const setActiveTab = useSetActiveTab();
  const navigateTo = useNavigateTo();
  const goBack = useGoBack();
  const clearHistory = useClearHistory();
  const setNavigationParams = useSetNavigationParams();
  const clearNavigationParams = useClearNavigationParams();

  return useCallback(() => ({
    setActiveTab,
    navigateTo,
    goBack,
    clearHistory,
    setNavigationParams,
    clearNavigationParams,
  }), [setActiveTab, navigateTo, goBack, clearHistory, setNavigationParams, clearNavigationParams])();
};

export const useUIActions = () => {
  const setNavigationVisible = useSetNavigationVisible();
  const toggleMoreMenu = useToggleMoreMenu();
  const closeMoreMenu = useCloseMoreMenu();

  return useCallback(() => ({
    setNavigationVisible,
    toggleMoreMenu,
    closeMoreMenu,
  }), [setNavigationVisible, toggleMoreMenu, closeMoreMenu])();
};

export const useConfigActions = () => {
  const setNavigationType = useSetNavigationType();
  const setTitle = useSetTitle();
  const setSubtitle = useSetSubtitle();
  const setShowBackButton = useSetShowBackButton();

  return useCallback(() => ({
    setNavigationType,
    setTitle,
    setSubtitle,
    setShowBackButton,
  }), [setNavigationType, setTitle, setSubtitle, setShowBackButton])();
};

// Selectores compuestos para compatibilidad (solo si es necesario)
export const useNavigationState = () => ({
  activeTab: useActiveTab(),
  navigationHistory: useNavigationHistory(),
  canGoBack: useCanGoBack(),
  navigationParams: useNavigationParams(),
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
