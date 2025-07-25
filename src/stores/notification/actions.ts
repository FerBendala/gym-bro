import type { NotificationType } from './types';

// Acciones de notificaciones
export const createNotificationActions = (set: any) => ({
  showNotification: (message: string, type: NotificationType) => set((state: any) => {
    // Validar que el tipo sea válido
    const validTypes: NotificationType[] = ['success', 'error', 'warning', 'info'];
    const validType = validTypes.includes(type) ? type : 'info';

    return {
      current: {
        show: true,
        message: message.trim(),
        type: validType
      }
    };
  }),

  hideNotification: () => set((state: any) => ({
    current: { ...state.current, show: false }
  })),

  addNotificationToList: (message: string, type: NotificationType) => set((state: any) => ({
    items: [
      ...state.items,
      {
        id: Date.now().toString(),
        message,
        type,
        timestamp: Date.now(),
      }
    ]
  })),

  removeNotificationFromList: (id: string) => set((state: any) => ({
    items: state.items.filter((notification: any) => notification.id !== id)
  })),

  clearNotificationsList: () => set(() => ({
    items: []
  })),
}); 