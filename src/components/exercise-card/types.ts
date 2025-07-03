import type { UseFormReturn } from 'react-hook-form';
import type { ExerciseAssignment, WorkoutFormData, WorkoutFormDataAdvanced } from '../../interfaces';

/**
 * Props principales del ExerciseCard
 */
export interface ExerciseCardProps {
  assignment: ExerciseAssignment;
  onRecord: (assignmentId: string, data: WorkoutFormData | WorkoutFormDataAdvanced) => Promise<void>;
  disabled?: boolean;
  isTrainedToday?: boolean;
}

/**
 * Props para el header del ExerciseCard
 */
export interface ExerciseCardHeaderProps {
  assignment: ExerciseAssignment;
  disabled: boolean;
  showForm: boolean;
  onToggleForm: () => void;
  onShowPreview: () => void;
}

/**
 * Estado del hook use-exercise-card
 */
export interface ExerciseCardState {
  showForm: boolean;
  loading: boolean;
  showPreview: boolean;
}

/**
 * Return type del hook use-exercise-card
 */
export interface UseExerciseCardReturn extends ExerciseCardState {
  toggleForm: () => void;
  setShowPreview: (show: boolean) => void;
  handleSubmit: (assignmentId: string, data: WorkoutFormData | WorkoutFormDataAdvanced, onRecord: ExerciseCardProps['onRecord']) => Promise<void>;
  resetForm: () => void;
  formMethods: UseFormReturn<WorkoutFormData>;
  advancedFormMethods: UseFormReturn<WorkoutFormDataAdvanced>;
} 