import { Wifi, WifiOff } from 'lucide-react';
import React from 'react';

interface ConnectionIndicatorProps {
  isOnline: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Componente genérico para mostrar el estado de conexión
 * Reutilizable en ExerciseList, Header, Dashboard, etc.
 */
export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  isOnline,
  showLabel = true,
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSize = sizeClasses[size];
  const textSize = textSizeClasses[size];

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {isOnline ? (
        <Wifi className={`${iconSize} text-green-500`} />
      ) : (
        <WifiOff className={`${iconSize} text-red-500`} />
      )}
      {showLabel && (
        <span className={`${textSize} ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
          {isOnline ? 'En línea' : 'Sin conexión'}
        </span>
      )}
    </div>
  );
};
