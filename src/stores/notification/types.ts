// Tipos para notificaciones
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationState {
  show: boolean;
  message: string;
  type: NotificationType;
}

export interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: number;
}

// Estado del store
export interface NotificationStoreState {
  // Notificación actual (para el sistema de context)
  current: NotificationState;
  // Lista de notificaciones (para el sistema existente)
  items: NotificationItem[];
}

// Acciones del store
export interface NotificationStoreActions {
  // Sistema de notificación actual (compatible con el context)
  showNotification: (message: string, type: NotificationType) => void;
  hideNotification: () => void;

  // Sistema de lista de notificaciones (existente)
  addNotificationToList: (message: string, type: NotificationType) => void;
  removeNotificationFromList: (id: string) => void;
  clearNotificationsList: () => void;
}

// Store completo
export type NotificationStore = NotificationStoreState & NotificationStoreActions; 