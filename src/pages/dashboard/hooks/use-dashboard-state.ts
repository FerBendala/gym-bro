import { useState } from 'react';
import { DEFAULT_DASHBOARD_TAB } from '../constants';
import type { DashboardTab } from '../types';

export const useDashboardState = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>(DEFAULT_DASHBOARD_TAB);

  return {
    activeTab,
    setActiveTab
  };
}; 