// Exportar el store principal
export { useDataStore } from './store';

// Exportar tipos
export type { AssignmentsState, DataActions, DataState, DataStore, ExercisesState } from './types';

// Exportar utilidades
export { getInitialState, persistenceConfig } from './utils';

// Exportar acciones (para testing o uso directo)
export { createAssignmentActions, createExerciseActions } from './actions';

// Exportar selectores optimizados
export {
  useAssignments, useAssignmentsError, useAssignmentsItems,
  useAssignmentsLoading, useExercises, useExercisesError, useExercisesItems,
  useExercisesLoading
} from './selectors';
