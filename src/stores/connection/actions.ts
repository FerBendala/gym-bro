import type { ConnectionStore } from './types';

// Función para manejar eventos de conexión
const handleConnectionChange = (isOnline: boolean, setOnlineStatus: (status: boolean) => void) => {
  setOnlineStatus(isOnline);

  // Mostrar notificaciones de cambio de estado usando importación dinámica para evitar circular imports
  import('../notification').then(({ useNotificationStore }) => {
    const { showNotification } = useNotificationStore.getState();
    if (isOnline) {
      showNotification('Conexión restaurada', 'success');
    } else {
      showNotification('Sin conexión a internet', 'warning');
    }
  });
};

// Acciones de conexión
export const createConnectionActions = (set: any, get: () => ConnectionStore) => ({
  setOnlineStatus: (isOnline: boolean) => set({ isOnline }),

  initializeConnection: () => {
    const { setOnlineStatus, isInitialized } = get();

    // Evitar inicialización múltiple
    if (isInitialized) return;

    // Función para actualizar el estado de conexión
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine;
      handleConnectionChange(isOnline, setOnlineStatus);
    };

    // Establecer estado inicial
    updateOnlineStatus();

    // Escuchar cambios de conexión
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    set({ isInitialized: true });
  },

  cleanupConnection: () => {
    // Solo marcar como no inicializado, los event listeners se limpian automáticamente
    set({ isInitialized: false });
  },
}); 