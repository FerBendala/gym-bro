import type { DayOfWeek, ExerciseAssignment, WorkoutFormData, WorkoutFormDataAdvanced, WorkoutRecord } from '@/interfaces';

/**
 * Props principales del ExerciseList
 */
export interface ExerciseListProps {
  dayOfWeek: DayOfWeek;
  onOpenAdmin: () => void;
  onGoToHistory?: (exerciseId: string, exerciseName: string) => void;
}

/**
 * Props para el header del ExerciseList
 */
export interface ExerciseListHeaderProps {
  dayOfWeek: DayOfWeek;
  isOnline: boolean;
  onOpenAdmin: () => void;
  hasExercises?: boolean;
  isDragModeActive?: boolean;
  onToggleDragMode?: () => void;
}

/**
 * Props para el estado vacío del ExerciseList
 */
export interface ExerciseListEmptyStateProps {
  dayOfWeek: DayOfWeek;
  isOnline: boolean;
  onOpenAdmin: () => void;
}

/**
 * Props para la lista de contenido del ExerciseList
 */
export interface ExerciseListContentProps {
  assignments: ExerciseAssignment[];
  isOnline: boolean;
  onRecord: (assignmentId: string, data: WorkoutFormData | WorkoutFormDataAdvanced) => Promise<void>;
  onReorder?: (assignments: ExerciseAssignment[]) => Promise<void>;
  exercisesTrainedToday: string[];
  workoutRecords: WorkoutRecord[];
  isDragModeActive?: boolean;
  onGoToHistory?: (exerciseId: string, exerciseName: string) => void;
}

/**
 * Estado del hook use-exercise-list
 */
export interface ExerciseListState {
  assignments: ExerciseAssignment[];
  loading: boolean;
}

/**
 * Return type del hook use-exercise-list
 */
export interface UseExerciseListReturn extends ExerciseListState {
  handleRecordWorkout: (assignmentId: string, data: WorkoutFormData | WorkoutFormDataAdvanced) => Promise<void>;
  loadAssignments: () => Promise<void>;
  handleReorderAssignments: (assignments: ExerciseAssignment[]) => Promise<void>;
  exercisesTrainedToday: string[];
  workoutRecords: WorkoutRecord[];
} 