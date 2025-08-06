// Estado del store
export interface ConnectionState {
  isOnline: boolean;
  isInitialized: boolean;
}

// Acciones del store
export interface ConnectionActions {
  setOnlineStatus: (isOnline: boolean) => void;
  initializeConnection: () => void;
  cleanupConnection: () => void;
}

// Store completo
export type ConnectionStore = ConnectionState & ConnectionActions;
