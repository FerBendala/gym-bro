import { useActiveTab, useCanGoBack, useClearHistory, useClearNavigationParams, useGoBack, useNavigateTo, useSetActiveTab } from '@/stores/modern-layout';

export const useModernNavigation = () => {
  const activeTab = useActiveTab();
  const canGoBack = useCanGoBack();
  const setActiveTab = useSetActiveTab();
  const navigateTo = useNavigateTo();
  const goBack = useGoBack();
  const clearHistory = useClearHistory();
  const clearNavigationParams = useClearNavigationParams();

  return {
    activeTab,
    navigateTo,
    goBack,
    canGoBack,
    setActiveTab,
    clearHistory,
    clearNavigationParams,
  };
};
