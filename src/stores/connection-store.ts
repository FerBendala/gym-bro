import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ConnectionState {
  isOnline: boolean;
  isInitialized: boolean;
}

interface ConnectionActions {
  setOnlineStatus: (isOnline: boolean) => void;
  initializeConnection: () => void;
  cleanupConnection: () => void;
}

type ConnectionStore = ConnectionState & ConnectionActions;

const initialState: ConnectionState = {
  isOnline: navigator.onLine,
  isInitialized: false,
};

// Función para manejar eventos de conexión
const handleConnectionChange = (isOnline: boolean, setOnlineStatus: (status: boolean) => void) => {
  setOnlineStatus(isOnline);

  // Mostrar notificaciones de cambio de estado usando importación dinámica para evitar circular imports
  import('./notification-store').then(({ useNotificationStore }) => {
    const { showNotification } = useNotificationStore.getState();
    if (isOnline) {
      showNotification('Conexión restaurada', 'success');
    } else {
      showNotification('Sin conexión a internet', 'warning');
    }
  });
};

export const useConnectionStore = create<ConnectionStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setOnlineStatus: (isOnline) => set({ isOnline }),

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
    }),
    {
      name: 'connection-store',
    }
  )
);

// Selector optimizado
export const useOnlineStatus = () => useConnectionStore((state) => state.isOnline);

// Hook para inicializar la conexión
export const useInitializeConnection = () => {
  const { initializeConnection, cleanupConnection, isInitialized } = useConnectionStore();

  return {
    initializeConnection,
    cleanupConnection,
    isInitialized
  };
}; 