
export type DashboardTab = 'categories' | 'balance' | 'trends' | 'advanced' | 'predictions';

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