import type { ConnectionState } from './types';

// Estado inicial
export const getInitialState = (): ConnectionState => ({
  isOnline: navigator.onLine,
  isInitialized: false,
});
