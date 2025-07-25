import type { DataState } from './types';

// Estado inicial
export const getInitialState = (): DataState => ({
  exercises: {
    items: [],
    loading: false,
    error: null,
  },
  assignments: {
    items: [],
    loading: false,
    error: null,
  },
});

// Configuración de persistencia
export const persistenceConfig = {
  name: 'gymbro-data',
  partialize: (state: DataState) => ({
    // Persistir solo los datos, no los estados de carga/error
    exercises: { items: state.exercises.items },
    assignments: { items: state.assignments.items },
  }),
}; 