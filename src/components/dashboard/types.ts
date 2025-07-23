
/**
 * Tabs disponibles en el dashboard
 * Ahora incluye history y exercises junto con los tabs existentes
 */
export type DashboardTab = 'balance' | 'advanced' | 'predictions' | 'history' | 'exercises';

export interface DashboardTabConfig {
  id: DashboardTab;
  label: string;
  icon: any;
  description: string;
}

export interface DashboardProps {
  onClose: () => void;
}

export interface DashboardHeaderProps {
  timeFilterLabel: string;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onClose: () => void;
}

export interface DashboardTabNavigationProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  timeFilterLabel: string;
}

export interface DashboardEmptyStateProps {
  isOnline: boolean;
} 