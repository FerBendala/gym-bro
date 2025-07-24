import { useNavigationActions, useNavigationState } from '@/stores/modern-layout';
import { useEffect } from 'react';
import { ModernNavItem } from '../types';

export const useModernNavigation = (initialTab?: ModernNavItem) => {
  const { activeTab, navigationHistory, canGoBack } = useNavigationState();
  const { setActiveTab, navigateTo, goBack, clearHistory } = useNavigationActions();

  // Si se proporciona un initialTab, establecerlo (útil para inicialización)
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, activeTab]); // Removidas las funciones del store de las dependencias

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