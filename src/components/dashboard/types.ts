import type { Exercise, WorkoutRecord } from '../../interfaces';

export interface DashboardProps {
  onClose: () => void;
}

export type TimeFilter = 'week' | 'month' | 'all';

// Nuevos tipos para el sistema de tabs
export type DashboardTab = 'overview' | 'performance' | 'categories' | 'trends' | 'advanced';

export interface DashboardTabConfig {
  id: DashboardTab;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}

export interface DashboardHeaderProps {
  timeFilterLabel: string;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onClose: () => void;
}

export interface DashboardFiltersProps {
  selectedExercise: string;
  timeFilter: TimeFilter;
  exercises: Exercise[];
  isOnline: boolean;
  onExerciseChange: (exerciseId: string) => void;
  onTimeFilterChange: (filter: TimeFilter) => void;
}

export interface DashboardEmptyStateProps {
  isOnline: boolean;
}

export interface DashboardContentProps {
  filteredRecords: WorkoutRecord[];
  allRecords: WorkoutRecord[];
  activeTab: DashboardTab;
  onDeleteRecord?: (recordId: string) => Promise<void>;
} 