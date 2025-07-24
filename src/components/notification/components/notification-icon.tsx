import type { NotificationIconProps } from '../types';
import { getNotificationIcon } from '../utils';

/**
 * Componente para mostrar el icono de la notificación
 */
export const NotificationIcon: React.FC<NotificationIconProps> = ({
  type,
  className = "w-5 h-5 mt-0.5"
}) => {
  const Icon = getNotificationIcon(type);

  return (
    <div className="flex-shrink-0">
      <Icon className={className} />
    </div>
  );
}; 