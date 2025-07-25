import type { NotificationStoreState } from './types';

// Estado inicial
export const getInitialState = (): NotificationStoreState => ({
  current: {
    show: false,
    message: '',
    type: 'info'
  },
  items: [],
});

// Configuración de persistencia
export const persistenceConfig = {
  name: 'gymbro-notifications',
  partialize: (state: NotificationStoreState) => ({
    // Solo persistir la lista de notificaciones, no la actual
    items: state.items,
  }),
}; 