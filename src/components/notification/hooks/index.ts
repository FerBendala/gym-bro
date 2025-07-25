import { useNotification } from '@/stores/notification';
import { useEffect, useState } from 'react';
import { EXIT_ANIMATION_DELAY } from '../constants';
import type { NotificationAnimationState } from '../types';
import { getNotificationDuration } from '../utils';

/**
 * Hook para manejar el estado de animación y auto-hide de las notificaciones
 */
export const useNotificationAnimation = () => {
  const { notification, hideNotification } = useNotification();
  const [animationState, setAnimationState] = useState<NotificationAnimationState>({
    isVisible: false,
    isExiting: false,
  });

  useEffect(() => {
    if (notification.show) {
      setAnimationState({ isVisible: true, isExiting: false });

      const duration = getNotificationDuration(notification.type);
      const timer = setTimeout(() => {
        setAnimationState(prev => ({ ...prev, isExiting: true }));

        setTimeout(() => {
          hideNotification();
          setAnimationState({ isVisible: false, isExiting: false });
        }, EXIT_ANIMATION_DELAY);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setAnimationState({ isVisible: false, isExiting: false });
    }
  }, [notification.show, notification.message, notification.type, hideNotification]);

  const handleClose = () => {
    setAnimationState(prev => ({ ...prev, isExiting: true }));
    setTimeout(() => {
      hideNotification();
      setAnimationState({ isVisible: false, isExiting: false });
    }, EXIT_ANIMATION_DELAY);
  };

  return {
    notification,
    animationState,
    handleClose,
  };
}; 