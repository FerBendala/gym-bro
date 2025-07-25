import type { Exercise, WorkoutRecord } from '@/interfaces';

export interface WorkoutHistoryProps {
  initialFilter?: {
    exerciseId?: string;
    exerciseName?: string;
  } | null;
}

export interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: Exercise[];
  searchTerm: string;
  selectedExercise: string;
  selectedCategory: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  sortBy: 'date' | 'exercise' | 'weight' | 'volume';
  sortOrder: 'asc' | 'desc';
  onSearchTermChange: (value: string) => void;
  onSelectedExerciseChange: (value: string) => void;
  onSelectedCategoryChange: (value: string) => void;
  onDateFromChange: (value: Date | undefined) => void;
  onDateToChange: (value: Date | undefined) => void;
  onSortByChange: (value: 'date' | 'exercise' | 'weight' | 'volume') => void;
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  onClearFilters: () => void;
}

export interface WorkoutRecordWithExercise extends WorkoutRecord {
  exercise?: Exercise;
}

export interface EditMode {
  mode: 'simple' | 'advanced';
  weight: number;
  reps: number;
  sets: number;
  date: Date;
  individualSets: { weight: number; reps: number }[];
}

export interface FilterState {
  searchTerm: string;
  selectedExercise: string;
  selectedCategory: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  sortBy: 'date' | 'exercise' | 'weight' | 'volume';
  sortOrder: 'asc' | 'desc';
} 