import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { THEME_NOTIFICATION, type ThemeNotificationType } from '../../constants/theme';

/**
 * Utilidades genéricas para el manejo de notificaciones
 * Reutilizable en Notification, Toast, Alert, etc.
 */

/**
 * Mapeo de iconos para cada tipo de notificación
 */
export const NOTIFICATION_ICONS: Record<ThemeNotificationType, LucideIcon> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
} as const;

/**
 * Obtiene el icono correspondiente a un tipo de notificación
 */
export const getNotificationIcon = (type: ThemeNotificationType): LucideIcon => {
  return NOTIFICATION_ICONS[type];
};

/**
 * Obtiene la duración de auto-hide para un tipo de notificación
 */
export const getNotificationDuration = (type: ThemeNotificationType): number => {
  return THEME_NOTIFICATION.types[type].duration;
};

/**
 * Obtiene los estilos de fondo para un tipo de notificación
 */
export const getNotificationBackground = (type: ThemeNotificationType): string => {
  return THEME_NOTIFICATION.types[type].background;
};

/**
 * Determina si un tipo de notificación debe mostrar texto de ayuda adicional
 */
export const shouldShowHelperText = (type: ThemeNotificationType): boolean => {
  return type === 'error';
};

/**
 * Obtiene el texto de ayuda para un tipo de notificación
 */
export const getHelperText = (type: ThemeNotificationType): string | null => {
  if (type === 'error') {
    return 'Si el problema persiste, verifica tu conexión a internet.';
  }
  return null;
};

/**
 * Valida si un tipo de notificación es válido
 */
export const isValidNotificationType = (type: string): type is ThemeNotificationType => {
  return ['success', 'error', 'warning', 'info'].includes(type);
};

/**
 * Normaliza un tipo de notificación con fallback
 */
export const normalizeNotificationType = (
  type: string | undefined,
  fallback: ThemeNotificationType = 'info'
): ThemeNotificationType => {
  if (!type || !isValidNotificationType(type)) {
    return fallback;
  }
  return type;
}; 