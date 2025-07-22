import type { ThemeNotificationType } from '../../constants/theme';

/**
 * Utilidades para toast/notificaciones
 * Funciones helper genéricas para facilitar el uso del sistema de notificaciones
 */

/**
 * Tipos de notificación disponibles
 */
export const TOAST_TYPES = {
  SUCCESS: 'success' as const,
  ERROR: 'error' as const,
  WARNING: 'warning' as const,
  INFO: 'info' as const
} as const;

/**
 * Función helper para mostrar notificaciones de éxito
 */
export const showSuccessToast = (
  showNotification: (message: string, type: ThemeNotificationType) => void,
  message: string
) => {
  showNotification(message, TOAST_TYPES.SUCCESS);
};

/**
 * Función helper para mostrar notificaciones de error
 */
export const showErrorToast = (
  showNotification: (message: string, type: ThemeNotificationType) => void,
  message: string
) => {
  showNotification(message, TOAST_TYPES.ERROR);
};

/**
 * Función helper para mostrar notificaciones de advertencia
 */
export const showWarningToast = (
  showNotification: (message: string, type: ThemeNotificationType) => void,
  message: string
) => {
  showNotification(message, TOAST_TYPES.WARNING);
};

/**
 * Función helper para mostrar notificaciones de información
 */
export const showInfoToast = (
  showNotification: (message: string, type: ThemeNotificationType) => void,
  message: string
) => {
  showNotification(message, TOAST_TYPES.INFO);
}; 