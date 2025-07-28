// Exportar el store principal
export { useConnectionStore } from './store';

// Exportar tipos
export type { ConnectionActions, ConnectionState, ConnectionStore } from './types';

// Exportar utilidades
export { getInitialState } from './utils';

// Exportar acciones (para testing o uso directo)
export { createConnectionActions } from './actions';

// Exportar selectores optimizados
export {
  useConnectionInitialized,
  useInitializeConnection, useOnlineStatus
} from './selectors';
