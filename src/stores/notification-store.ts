import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { NotificationItem, NotificationState, NotificationType } from './types';

interface NotificationStoreState {
  // Notificación actual (para el sistema de context)
  current: NotificationState;
  // Lista de notificaciones (para el sistema existente)
  items: NotificationItem[];
}

interface NotificationStoreActions {
  // Sistema de notificación actual (compatible con el context)
  showNotification: (message: string, type: NotificationType) => void;
  hideNotification: () => void;

  // Sistema de lista de notificaciones (existente)
  addNotificationToList: (message: string, type: NotificationType) => void;
  removeNotificationFromList: (id: string) => void;
  clearNotificationsList: () => void;
}

type NotificationStore = NotificationStoreState & NotificationStoreActions;

const initialState: NotificationStoreState = {
  current: {
    show: false,
    message: '',
    type: 'info'
  },
  items: [],
};

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        showNotification: (message, type) => set((state) => {
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

        hideNotification: () => set((state) => ({
          current: { ...state.current, show: false }
        })),

        addNotificationToList: (message, type) => set((state) => ({
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

        removeNotificationFromList: (id) => set((state) => ({
          items: state.items.filter(notification => notification.id !== id)
        })),

        clearNotificationsList: () => set(() => ({
          items: []
        })),
      }),
      {
        name: 'follow-gym-notifications',
        partialize: (state) => ({
          // Solo persistir la lista de notificaciones, no la actual
          items: state.items,
        }),
      }
    ),
    {
      name: 'notification-store',
    }
  )
);

// Selectores optimizados
export const useCurrentNotification = () => useNotificationStore((state) => state.current);
export const useNotificationsList = () => useNotificationStore((state) => state.items);

// Hook compatible con el sistema anterior
export const useNotification = () => {
  const { showNotification, hideNotification } = useNotificationStore();
  const notification = useCurrentNotification();

  return {
    notification,
    showNotification,
    hideNotification
  };
}; 