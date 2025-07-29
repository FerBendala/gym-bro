// Exportar el store principal
export { useAdminStore } from './store';

// Exportar tipos
export type { AdminActions, AdminState, AdminStore } from './types';

// Exportar utilidades
export { getCurrentDay, getInitialState } from './utils';

// Exportar acciones (para testing o uso directo)
export {
  createCRUDActions, createDataActions, createFilterActions, createLoadingActions, createUIActions, createUtilityActions,
} from './actions';

// Exportar configuración de persistencia
export { persistenceConfig } from './persistence';

// Exportar selectores optimizados
export {
  useAdminAssignments, useAdminErrors, useAdminExercises, useAdminFilters, useAdminLoading, useAdminUI,
} from './selectors';
