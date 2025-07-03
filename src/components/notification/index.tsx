import { X } from 'lucide-react';
import React, { useEffect } from 'react';
import { THEME_NOTIFICATION } from '../../constants/theme';
import { useNotification } from '../../context/notification-context';
import {
  cn,
  getHelperText,
  getNotificationBackground,
  getNotificationDuration,
  getNotificationIcon,
  shouldShowHelperText
} from '../../utils/functions';

/**
 * Componente de notificación usando sistema de tema genérico
 * Integrado completamente con THEME_NOTIFICATION y utilidades genéricas
 */
export const Notification: React.FC = () => {
  const { notification, hideNotification } = useNotification();

  useEffect(() => {
    if (notification.show) {
      // Auto-hide usando duración del sistema de tema
      const duration = getNotificationDuration(notification.type);
      const timer = setTimeout(() => {
        hideNotification();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [notification.show, notification.type, hideNotification]);

  if (!notification.show) return null;

  // Obtener datos usando utilidades genéricas
  const Icon = getNotificationIcon(notification.type);
  const backgroundStyles = getNotificationBackground(notification.type);
  const helperText = getHelperText(notification.type);
  const showHelper = shouldShowHelperText(notification.type);
  const duration = getNotificationDuration(notification.type);

  return (
    <div className={THEME_NOTIFICATION.base}>
      <div className={cn(THEME_NOTIFICATION.container, backgroundStyles)}>
        <div className={THEME_NOTIFICATION.content}>
          <Icon className={THEME_NOTIFICATION.icon} />
          <div className="flex-1">
            <p className={THEME_NOTIFICATION.message.base}>
              {notification.message}
            </p>
            {showHelper && helperText && (
              <p className={THEME_NOTIFICATION.message.helper}>
                {helperText}
              </p>
            )}
          </div>
          <button
            onClick={hideNotification}
            className={THEME_NOTIFICATION.closeButton}
            aria-label="Cerrar notificación"
          >
            <X className={THEME_NOTIFICATION.closeIcon} />
          </button>
        </div>

        {/* Barra de progreso usando sistema de tema */}
        <div className={THEME_NOTIFICATION.progressBar.container}>
          <div
            className={THEME_NOTIFICATION.progressBar.bar}
            style={{
              animationDuration: `${duration}ms`
            }}
          />
        </div>
      </div>
    </div>
  );
};