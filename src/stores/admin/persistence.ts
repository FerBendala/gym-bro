import type { AdminStore } from './types';
import { getCurrentDay } from './utils';

// Configuración de persistencia
export const persistenceConfig = {
  name: 'gymbro-admin',
  partialize: (state: AdminStore) => ({
    // Persistir solo los datos que no cambian frecuentemente
    // NO persistir selectedDay para evitar problemas de inicialización
    exercises: state.exercises,
    assignments: state.assignments,
    filters: state.filters,
  }),
  // Función para restaurar el estado con valores por defecto válidos
  onRehydrateStorage: () => (state: AdminStore | null) => {
    if (state) {
      if (!state.adminPanel) {
        state.adminPanel = {
          isOpen: false,
          activeTab: 'exercises',
          selectedDay: getCurrentDay(),
          editingExercise: null,
          previewUrl: null,
        };
      } else {
        // Refuerzo: si activeTab es undefined o no es válido, pon 'exercises'
        const validTabs = ['exercises', 'assignments'];
        if (!state.adminPanel.activeTab || !validTabs.includes(state.adminPanel.activeTab)) {
          state.adminPanel.activeTab = 'exercises';
        }
        // Refuerzo: si selectedDay es undefined o no es válido, pon el día actual
        const validDays = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
        if (!state.adminPanel.selectedDay || !validDays.includes(state.adminPanel.selectedDay)) {
          state.adminPanel.selectedDay = getCurrentDay();
        }
      }
    }
  },
};
