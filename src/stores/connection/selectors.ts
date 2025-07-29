import { useConnectionStore } from './store';

// Selectores optimizados
export const useOnlineStatus = () => useConnectionStore((state) => state.isOnline);
export const useConnectionInitialized = () => useConnectionStore((state) => state.isInitialized);

// Hook para inicializar la conexión
export const useInitializeConnection = () => {
  const { initializeConnection, cleanupConnection, isInitialized } = useConnectionStore();

  return {
    initializeConnection,
    cleanupConnection,
    isInitialized,
  };
};
