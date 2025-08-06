import type { LucideIcon } from 'lucide-react';

import { NOTIFICATION_BACKGROUNDS, NOTIFICATION_DURATIONS, NOTIFICATION_ICONS } from '../constants';

import type { NotificationType } from '@/stores/types';

/**
 * Obtiene el icono correspondiente al tipo de notificación
 */
export const getNotificationIcon = (type: NotificationType): LucideIcon => {
  return NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.info;
};

/**
 * Obtiene la duración de auto-hide para un tipo de notificación
 */
export const getNotificationDuration = (type: NotificationType): number => {
  return NOTIFICATION_DURATIONS[type] || NOTIFICATION_DURATIONS.info;
};

/**
 * Obtiene los estilos de fondo para un tipo de notificación
 */
export const getNotificationBackground = (type: NotificationType): string => {
  return NOTIFICATION_BACKGROUNDS[type] || NOTIFICATION_BACKGROUNDS.info;
};
