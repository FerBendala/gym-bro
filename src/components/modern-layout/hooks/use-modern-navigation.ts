import { useActiveTab, useCanGoBack, useNavigationActions, useNavigationHistory } from '@/stores/modern-layout';

export const useModernNavigation = () => {
  const activeTab = useActiveTab();
  const navigationHistory = useNavigationHistory();
  const canGoBack = useCanGoBack();
  const { setActiveTab, navigateTo, goBack, clearHistory } = useNavigationActions();

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