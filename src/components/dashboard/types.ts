import type { Exercise, WorkoutRecord } from '../../interfaces';

export interface DashboardProps {
  onClose: () => void;
}

export type TimeFilter = 'week' | 'month' | 'all';

export interface DashboardHeaderProps {
  timeFilterLabel: string;
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
  onDeleteRecord?: (recordId: string) => Promise<void>;
} 