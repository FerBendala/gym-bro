import { useEffect, useState } from 'react';
import { useNotification } from '../context/notification-context';

/**
 * Hook genérico para gestionar el estado de conexión online/offline
 * Maneja automáticamente los eventos de conexión y muestra notificaciones
 * 
 * @returns boolean - true si está online, false si está offline
 */
export const useOnlineStatus = () => {
  const { showNotification } = useNotification();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showNotification('Conexión restaurada', 'success');
    };

    const handleOffline = () => {
      setIsOnline(false);
      showNotification('Sin conexión a internet', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showNotification]);

  return isOnline;
}; 