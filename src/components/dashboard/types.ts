import type { Exercise } from '../../interfaces';

export type DashboardTab = 'categories' | 'trends' | 'advanced';
export type TimeFilter = 'week' | 'month' | 'all';
export type FilterType = 'all' | 'exercise' | 'muscle-group';

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

export interface DashboardFiltersProps {
  selectedExercise: string;
  selectedMuscleGroup: string;
  filterType: FilterType;
  timeFilter: TimeFilter;
  exercises: Exercise[];
  isOnline: boolean;
  onExerciseChange: (exerciseId: string) => void;
  onMuscleGroupChange: (muscleGroupId: string) => void;
  onFilterTypeChange: (filterType: FilterType) => void;
  onTimeFilterChange: (filter: TimeFilter) => void;
}

export interface DashboardEmptyStateProps {
  isOnline: boolean;
} 