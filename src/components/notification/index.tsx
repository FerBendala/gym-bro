import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { THEME_NOTIFICATION } from '../../constants/theme';
import { useNotification } from '../../stores/notification-store';
import { cn } from '../../utils/functions';

/**
 * Componente de notificación unificado para toda la aplicación
 * Diseño moderno y consistente con animaciones suaves
 */
export const Notification: React.FC = () => {
  const { notification, hideNotification } = useNotification();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Mapeo de iconos para cada tipo de notificación
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      default: return Info;
    }
  };

  // Obtener la duración de auto-hide para un tipo de notificación
  const getNotificationDuration = (type: string): number => {
    return THEME_NOTIFICATION.types[type as keyof typeof THEME_NOTIFICATION.types]?.duration || 4000;
  };

  // Obtener los estilos de fondo para un tipo de notificación
  const getNotificationBackground = (type: string): string => {
    return THEME_NOTIFICATION.types[type as keyof typeof THEME_NOTIFICATION.types]?.background || THEME_NOTIFICATION.types.info.background;
  };

  useEffect(() => {
    if (notification.show) {
      setIsVisible(true);
      setIsExiting(false);

      const duration = getNotificationDuration(notification.type);
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          hideNotification();
          setIsVisible(false);
        }, 300); // Duración de la animación de salida
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setIsExiting(false);
    }
  }, [notification.show, notification.message, notification.type, hideNotification]);

  if (!notification.show && !isVisible) return null;

  const Icon = getNotificationIcon(notification.type);
  const backgroundStyles = getNotificationBackground(notification.type);

  return (
    <div className={cn(
      "fixed top-4 right-4 z-[99999] transform transition-all duration-300 ease-in-out",
      isExiting
        ? "translate-x-full opacity-0"
        : "translate-x-0 opacity-100"
    )}>
      <div className={cn(
        "min-w-80 max-w-sm rounded-xl shadow-xl backdrop-blur-sm border animate-fade-in-scale",
        backgroundStyles
      )}>
        <div className="flex items-start space-x-3 p-4">
          <div className="flex-shrink-0">
            <Icon className="w-5 h-5 mt-0.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white leading-relaxed">
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => {
              setIsExiting(true);
              setTimeout(() => {
                hideNotification();
                setIsVisible(false);
              }, 300);
            }}
            className={cn(
              "ml-auto flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors duration-200"
            )}
          >
            <X className="w-4 h-4 text-white/70 hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

