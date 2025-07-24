import { useState } from 'react';
import { ModernNavItem } from '../types';

export const useModernNavigation = (initialTab: ModernNavItem = 'home') => {
  const [activeTab, setActiveTab] = useState<ModernNavItem>(initialTab);
  const [navigationHistory, setNavigationHistory] = useState<ModernNavItem[]>([initialTab]);

  const navigateTo = (tab: ModernNavItem) => {
    setActiveTab(tab);
    setNavigationHistory(prev => [...prev, tab]);
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = navigationHistory.slice(0, -1);
      setNavigationHistory(newHistory);
      setActiveTab(newHistory[newHistory.length - 1]);
      return true;
    }
    return false;
  };

  const canGoBack = navigationHistory.length > 1;

  return {
    activeTab,
    navigateTo,
    goBack,
    canGoBack,
    navigationHistory
  };
}; 