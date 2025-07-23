import { useConnectionStore } from '@/stores/connection-store';
import { useNotification } from '@/stores/notification-store';
import React, { useEffect } from 'react';

interface AppProviderProps {
  children: React.ReactNode;
}

/**
 * Provider para inicializar el estado global de la aplicación
 * Maneja el estado de conexión y otros estados globales
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { setOnlineStatus } = useConnectionStore();
  const { showNotification } = useNotification();

  useEffect(() => {
    // Función para actualizar el estado de conexión
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine;
      setOnlineStatus(isOnline);

      // Mostrar notificaciones de cambio de estado
      if (isOnline) {
        showNotification('Conexión restaurada', 'success');
      } else {
        showNotification('Sin conexión a internet', 'warning');
      }
    };

    // Establecer estado inicial
    updateOnlineStatus();

    // Escuchar cambios de conexión
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Cleanup
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [setOnlineStatus, showNotification]);

  return <>{children}</>;
}; 