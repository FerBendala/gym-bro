
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

export interface DashboardEmptyStateProps {
  isOnline: boolean;
} 