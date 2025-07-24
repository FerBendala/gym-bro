import { useOnlineStatus } from '@/stores/connection-store';
import { useEffect, useState } from 'react';
import type { SyncEvent } from '../utils/data/indexeddb-types';
import { initializeDB } from '../utils/data/indexeddb-utils';
import {
  addSyncEventListener,
  removeSyncEventListener,
  startSync
} from '../utils/data/sync-manager';

/**
 * Hook especializado para manejar la sincronización offline
 * Proporciona estado de sincronización y manejo de eventos
 */
export const useOfflineSync = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    isSyncing: boolean;
    lastSync?: number;
    pendingOperations: number;
    error?: string;
  }>({
    isSyncing: false,
    pendingOperations: 0
  });

  const isOnline = useOnlineStatus();

  // Inicializar IndexedDB y sincronización
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeDB();
        setIsInitialized(true);

        // Iniciar sincronización automática si estamos online
        if (isOnline) {
          startSync(5); // Cada 5 minutos
        }
      } catch (error) {
        console.error('Error inicializando IndexedDB:', error);
      }
    };

    initialize();
  }, [isOnline]);

  // Listener de eventos de sincronización
  useEffect(() => {
    const handleSyncEvent = (event: SyncEvent) => {
      switch (event.type) {
        case 'sync_started':
          setSyncStatus(prev => ({ ...prev, isSyncing: true, error: undefined }));
          break;
        case 'sync_completed':
          setSyncStatus(prev => ({
            ...prev,
            isSyncing: false,
            lastSync: Date.now(),
            pendingOperations: 0
          }));
          break;
        case 'sync_failed':
          setSyncStatus(prev => ({
            ...prev,
            isSyncing: false,
            error: event.error
          }));
          break;
      }
    };

    addSyncEventListener(handleSyncEvent);
    return () => removeSyncEventListener(handleSyncEvent);
  }, []);

  return {
    isInitialized,
    syncStatus,
    isOnline
  };
}; 