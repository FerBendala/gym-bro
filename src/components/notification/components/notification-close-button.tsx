import { X } from 'lucide-react';

import type { NotificationCloseButtonProps } from '../types';

import { cn } from '@/utils';

/**
 * Componente para el botón de cerrar notificación
 */
export const NotificationCloseButton: React.FC<NotificationCloseButtonProps> = ({
  onClose,
  className,
}) => {
  return (
    <button
      onClick={onClose}
      className={cn(
        'ml-auto flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors duration-200',
        className,
      )}
    >
      <X className="w-4 h-4 text-white/70 hover:text-white" />
    </button>
  );
};
