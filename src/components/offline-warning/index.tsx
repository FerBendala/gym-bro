import type { LucideIcon } from 'lucide-react';
import { Clock } from 'lucide-react';
import React from 'react';
import { THEME_CONTAINERS, type ThemeAlertVariant } from '../../constants/theme';

interface OfflineWarningProps {
  message?: string;
  className?: string;
  variant?: ThemeAlertVariant;
  icon?: LucideIcon;
  iconClassName?: string;
}

/**
 * Componente genérico para mostrar advertencias y alertas de estado
 * Reutilizable en Dashboard, AdminPanel, ExerciseCard y otros componentes
 */
export const OfflineWarning: React.FC<OfflineWarningProps> = ({
  message = 'Sin conexión. Los datos mostrados pueden estar desactualizados.',
  className = '',
  variant = 'warning',
  icon: Icon = Clock,
  iconClassName = ''
}) => {
  const alertStyles = `${THEME_CONTAINERS.alert.base} ${THEME_CONTAINERS.alert.variants[variant]}`;

  return (
    <div className={`${alertStyles} ${className}`}>
      <div className="flex items-center space-x-2">
        <Icon className={`w-4 h-4 text-yellow-400 ${iconClassName}`} />
        <p className="text-yellow-400 text-sm">{message}</p>
      </div>
    </div>
  );
}; 