import type { NotificationContentProps } from '../types';
import { getNotificationBackground } from '../utils';

import { NotificationCloseButton } from './notification-close-button';
import { NotificationIcon } from './notification-icon';

import { cn } from '@/utils';

/**
 * Componente para el contenido principal de la notificación
 */
export const NotificationContent: React.FC<NotificationContentProps> = ({
  message,
  type,
  onClose,
}) => {
  const backgroundStyles = getNotificationBackground(type);

  return (
    <div className={cn(
      'min-w-80 max-w-sm rounded-xl shadow-xl backdrop-blur-sm border animate-fade-in-scale',
      backgroundStyles,
    )}>
      <div className="flex items-start space-x-3 p-4">
        <NotificationIcon type={type} />

        <div className="flex-1 min-w-0">
          <p className="text-sm text-white leading-relaxed">
            {message}
          </p>
        </div>

        <NotificationCloseButton onClose={onClose} />
      </div>
    </div>
  );
};
