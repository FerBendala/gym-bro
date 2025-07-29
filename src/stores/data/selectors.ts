import { useDataStore } from './store';

// Selectores optimizados
export const useExercises = () => useDataStore((state) => state.exercises);
export const useAssignments = () => useDataStore((state) => state.assignments);

// Selectores específicos para ejercicios
export const useExercisesItems = () => useDataStore((state) => state.exercises.items);
export const useExercisesLoading = () => useDataStore((state) => state.exercises.loading);
export const useExercisesError = () => useDataStore((state) => state.exercises.error);

// Selectores específicos para asignaciones
export const useAssignmentsItems = () => useDataStore((state) => state.assignments.items);
export const useAssignmentsLoading = () => useDataStore((state) => state.assignments.loading);
export const useAssignmentsError = () => useDataStore((state) => state.assignments.error);
