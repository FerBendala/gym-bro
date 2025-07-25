// Exportar el store principal
export { useNotificationStore } from './store';

// Exportar tipos
export type {
  NotificationActions, NotificationItem, NotificationState,
  NotificationStore, NotificationStoreActions, NotificationStoreState, NotificationType
} from './types';

// Exportar utilidades
export { getInitialState, persistenceConfig } from './utils';

// Exportar acciones (para testing o uso directo)
export { createNotificationActions } from './actions';

// Exportar selectores optimizados
export {
  useCurrentNotification, useNotification, useNotificationsList
} from './selectors';
