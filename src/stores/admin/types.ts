import type { AdminPanelState } from '../types';

import type { DayOfWeek, Exercise, ExerciseAssignment } from '@/interfaces';

// Tipos para el estado del admin
export interface AdminState {
  // Estado de la UI
  adminPanel: AdminPanelState;

  // Estado de carga
  loading: {
    exercises: boolean;
    assignments: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
  };

  // Errores
  errors: {
    exercises: string | null;
    assignments: string | null;
  };

  // Datos
  exercises: Exercise[];
  assignments: ExerciseAssignment[];

  // Filtros y búsqueda
  filters: {
    exerciseCategory: string;
    searchTerm: string;
  };
}

// Acciones del admin
export interface AdminActions {
  // Acciones de UI
  openPanel: () => void;
  closePanel: () => void;
  setTab: (tab: 'exercises' | 'assignments') => void;
  setSelectedDay: (day: DayOfWeek) => void;
  setEditingExercise: (exercise: Exercise | null) => void;
  setPreviewUrl: (url: string | null) => void;

  // Acciones de carga
  setLoading: (key: keyof AdminState['loading'], value: boolean) => void;
  setError: (key: keyof AdminState['errors'], error: string | null) => void;

  // Acciones de datos
  setExercises: (exercises: Exercise[]) => void;
  setAssignments: (assignments: ExerciseAssignment[]) => void;

  // Acciones auxiliares para CRUD
  addExercise: (exercise: Exercise) => void;
  updateExerciseInStore: (exerciseId: string, updates: Partial<Exercise>) => void;
  removeExerciseFromStore: (exerciseId: string) => void;
  addAssignment: (assignment: ExerciseAssignment) => void;
  removeAssignmentFromStore: (assignmentId: string) => void;

  // Acciones de filtros
  setExerciseCategory: (category: string) => void;
  setSearchTerm: (term: string) => void;

  // Utilidades
  getFilteredExercises: () => Exercise[];
  getAssignmentsByDay: (day: DayOfWeek) => ExerciseAssignment[];
  resetState: () => void;
}

// Store completo
export type AdminStore = AdminState & AdminActions;
