import { cn } from '@/utils';
import React from 'react';
import { NotificationContent } from './components';
import { useNotificationAnimation } from './hooks';
import type { NotificationProps } from './types';

/**
 * Componente de notificación unificado para toda la aplicación
 * Diseño moderno y consistente con animaciones suaves
 */
export const Notification: React.FC<NotificationProps> = ({ className }) => {
  const { notification, animationState, handleClose } = useNotificationAnimation();

  if (!notification.show && !animationState.isVisible) return null;

  return (
    <div className={cn(
      "fixed top-4 right-4 z-[99999] transform transition-all duration-300 ease-in-out",
      animationState.isExiting
        ? "translate-x-full opacity-0"
        : "translate-x-0 opacity-100",
      className
    )}>
      <NotificationContent
        message={notification.message}
        type={notification.type}
        onClose={handleClose}
      />
    </div>
  );
}; 