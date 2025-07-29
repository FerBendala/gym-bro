import type { UseFormReturn } from 'react-hook-form';

import type { ExerciseAssignment, WorkoutFormData, WorkoutFormDataAdvanced } from '@/interfaces';

/**
 * Props principales del ExerciseCard
 */
export interface ExerciseCardProps {
  assignment: ExerciseAssignment;
  onRecord: (assignmentId: string, data: WorkoutFormData | WorkoutFormDataAdvanced) => Promise<void>;
  disabled?: boolean;
  isTrainedToday?: boolean;
  onGoToHistory?: (exerciseId: string, exerciseName: string) => void;
}

/**
 * Props para el header del ExerciseCard
 */
export interface ExerciseCardHeaderProps {
  assignment: ExerciseAssignment;
  disabled: boolean;
  onToggleModal: () => void;
  onShowPreview: () => void;
  onGoToHistory?: (exerciseId: string, exerciseName: string) => void;
}

/**
 * Estado del hook use-exercise-card
 */
export interface ExerciseCardState {
  showModal: boolean;
  loading: boolean;
  showPreview: boolean;
}

/**
 * Return type del hook use-exercise-card
 */
export interface UseExerciseCardReturn extends ExerciseCardState {
  toggleModal: () => void;
  setShowPreview: (show: boolean) => void;
  handleSubmit: (assignmentId: string, data: WorkoutFormData | WorkoutFormDataAdvanced, onRecord: ExerciseCardProps['onRecord']) => Promise<void>;
  resetModal: () => void;
  formMethods: UseFormReturn<WorkoutFormData>;
  advancedFormMethods: UseFormReturn<WorkoutFormDataAdvanced>;
}

/**
 * Props para el modal de ejercicios
 */
export interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: ExerciseAssignment;
  loading: boolean;
  onSubmit: (data: WorkoutFormData | WorkoutFormDataAdvanced) => Promise<void>;
  formMethods: UseFormReturn<WorkoutFormData>;
  advancedFormMethods: UseFormReturn<WorkoutFormDataAdvanced>;
  lastRecord?: import('@/interfaces').WorkoutRecord | null;
  lastWorkoutSeries?: import('@/interfaces').WorkoutRecord[];
}
