import { useNavigationActions, useNavigationState } from '@/stores/modern-layout';
import { ModernNavItem } from '../types';

export const useModernNavigation = (initialTab?: ModernNavItem) => {
  const { activeTab, navigationHistory, canGoBack } = useNavigationState();
  const { setActiveTab, navigateTo, goBack, clearHistory } = useNavigationActions();

  // Si se proporciona un initialTab, establecerlo (útil para inicialización)
  if (initialTab && initialTab !== activeTab) {
    setActiveTab(initialTab);
  }

  return {
    activeTab,
    navigateTo,
    goBack,
    canGoBack,
    navigationHistory,
    setActiveTab,
    clearHistory,
  };
}; 