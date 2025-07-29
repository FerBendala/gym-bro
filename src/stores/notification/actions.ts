import type { NotificationType, NotificationStore } from './types';

// Acciones de notificaciones
export const createNotificationActions = (set: (fn: (state: NotificationStore) => Partial<NotificationStore>) => void) => ({
  showNotification: (message: string, type: NotificationType) => set(() => {
    // Validar que el tipo sea válido
    const validTypes: NotificationType[] = ['success', 'error', 'warning', 'info'];
    const validType = validTypes.includes(type) ? type : 'info';

    return {
      current: {
        show: true,
        message: message.trim(),
        type: validType,
      },
    };
  }),

  hideNotification: () => set((state: NotificationStore) => ({
    current: { ...state.current, show: false },
  })),

  addNotificationToList: (message: string, type: NotificationType) => set((state: NotificationStore) => ({
    items: [
      ...state.items,
      {
        id: Date.now().toString(),
        message,
        type,
        timestamp: Date.now(),
      },
    ],
  })),

  removeNotificationFromList: (id: string) => set((state: NotificationStore) => ({
    items: state.items.filter((notification) => notification.id !== id),
  })),

  clearNotificationsList: () => set(() => ({
    items: [],
  })),
});
