import { getCurrentDay } from './utils';

// Configuración de persistencia
export const persistenceConfig = {
  name: 'follow-gym-admin',
  partialize: (state: any) => ({
    // Persistir solo los datos que no cambian frecuentemente
    // NO persistir selectedDay para evitar problemas de inicialización
    exercises: state.exercises,
    assignments: state.assignments,
    filters: state.filters,
  }),
  // Función para restaurar el estado con valores por defecto válidos
  onRehydrateStorage: () => (state: any) => {
    if (state) {
      // Asegurar que adminPanel tenga valores válidos después de la rehidratación
      if (!state.adminPanel) {
        state.adminPanel = {
          isOpen: false,
          activeTab: 'exercises',
          selectedDay: getCurrentDay(),
          editingExercise: null,
          previewUrl: null,
        };
      } else {
        // Asegurar que activeTab tenga un valor válido
        if (!state.adminPanel.activeTab) {
          state.adminPanel.activeTab = 'exercises';
        }

        // Asegurar que selectedDay tenga un valor válido
        if (!state.adminPanel.selectedDay) {
          state.adminPanel.selectedDay = getCurrentDay();
        }

        // Validación adicional: asegurar que selectedDay siempre tenga un valor válido
        const validDays = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
        if (!validDays.includes(state.adminPanel.selectedDay)) {
          state.adminPanel.selectedDay = getCurrentDay();
        }
      }
    }
  },
}; 