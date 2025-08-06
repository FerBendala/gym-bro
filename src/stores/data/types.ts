import type { Exercise, ExerciseAssignment } from '@/interfaces';

// Tipos para ejercicios
export interface ExercisesState {
  items: Exercise[];
  loading: boolean;
  error: string | null;
}

// Tipos para asignaciones
export interface AssignmentsState {
  items: ExerciseAssignment[];
  loading: boolean;
  error: string | null;
}

// Estado del store
export interface DataState {
  exercises: ExercisesState;
  assignments: AssignmentsState;
}

// Acciones del store
export interface DataActions {
  // Acciones de ejercicios
  setExercises: (exercises: Exercise[]) => void;
  addExercise: (exercise: Exercise) => void;
  updateExercise: (exerciseId: string, updates: Partial<Exercise>) => void;
  removeExercise: (exerciseId: string) => void;
  setExercisesLoading: (loading: boolean) => void;
  setExercisesError: (error: string | null) => void;

  // Acciones de asignaciones
  setAssignments: (assignments: ExerciseAssignment[]) => void;
  addAssignment: (assignment: ExerciseAssignment) => void;
  removeAssignment: (assignmentId: string) => void;
  setAssignmentsLoading: (loading: boolean) => void;
  setAssignmentsError: (error: string | null) => void;
}

// Store completo
export type DataStore = DataState & DataActions;
