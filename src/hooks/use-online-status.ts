import { useOnlineStatus as useConnectionStatus } from '@/stores/connection-store';

/**
 * Hook genérico para gestionar el estado de conexión online/offline
 * Solo maneja el estado local, las notificaciones las maneja el AppProvider
 * 
 * @returns boolean - true si está online, false si está offline
 */
export const useOnlineStatus = () => {
  return useConnectionStatus();
}; 