/**
 * Interfaces de estado de la aplicación
 * Tipos relacionados con el estado global y notificaciones
 */

export interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
} 