import { useCallback, useEffect, useState } from 'react';
import type { Exercise, WorkoutRecord } from '../interfaces';
import { STORES } from '../utils/data/indexeddb-config';
import type {
  DatabaseResult,
  IndexedDBExercise,
  IndexedDBWorkoutRecord,
  QueryOptions,
  SyncEvent
} from '../utils/data/indexeddb-types';
import {
  addItem,
  deleteItem,
  getAllItems,
  getItemsByIndex,
  initializeDB,
  updateItem
} from '../utils/data/indexeddb-utils';
import {
  addSyncEventListener,
  queueSyncOperation,
  removeSyncEventListener,
  startSync
} from '../utils/data/sync-manager';
import { useOnlineStatus } from './use-online-status';
// Función helper para generar IDs únicos
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Hook genérico para manejar datos offline con IndexedDB
 * Proporciona funcionalidad offline-first con sincronización automática
 */
export const useOfflineData = () => {
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

  // Funciones para Exercise
  const addExercise = useCallback(async (exercise: Omit<Exercise, 'id'>): Promise<DatabaseResult<IndexedDBExercise>> => {
    if (!isInitialized) {
      return { success: false, error: 'Base de datos no inicializada', timestamp: Date.now() };
    }

    const now = Date.now();
    const newExercise: IndexedDBExercise = {
      ...exercise,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      _needsSync: true,
      _isLocalOnly: !isOnline
    };

    try {
      const result = await addItem(STORES.EXERCISES, newExercise);

      // Agregar a cola de sincronización
      if (result.success) {
        await queueSyncOperation('exercise', newExercise.id, 'CREATE', newExercise, 'HIGH');
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: Date.now()
      };
    }
  }, [isInitialized, isOnline]);

  const updateExercise = useCallback(async (exercise: IndexedDBExercise): Promise<DatabaseResult<IndexedDBExercise>> => {
    if (!isInitialized) {
      return { success: false, error: 'Base de datos no inicializada', timestamp: Date.now() };
    }

    const updatedExercise: IndexedDBExercise = {
      ...exercise,
      updatedAt: Date.now(),
      _needsSync: true
    };

    try {
      const result = await updateItem(STORES.EXERCISES, updatedExercise);

      if (result.success) {
        await queueSyncOperation('exercise', exercise.id, 'UPDATE', updatedExercise, 'MEDIUM');
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: Date.now()
      };
    }
  }, [isInitialized]);

  const deleteExercise = useCallback(async (exerciseId: string): Promise<DatabaseResult<boolean>> => {
    if (!isInitialized) {
      return { success: false, error: 'Base de datos no inicializada', timestamp: Date.now() };
    }

    try {
      const result = await deleteItem(STORES.EXERCISES, exerciseId);

      if (result.success) {
        await queueSyncOperation('exercise', exerciseId, 'DELETE', { id: exerciseId }, 'MEDIUM');
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: Date.now()
      };
    }
  }, [isInitialized]);

  const getExercises = useCallback(async (options?: QueryOptions): Promise<DatabaseResult<IndexedDBExercise[]>> => {
    if (!isInitialized) {
      return { success: false, error: 'Base de datos no inicializada', timestamp: Date.now() };
    }

    return getAllItems<IndexedDBExercise>(STORES.EXERCISES, options);
  }, [isInitialized]);

  const getExercisesByCategory = useCallback(async (category: string): Promise<DatabaseResult<IndexedDBExercise[]>> => {
    if (!isInitialized) {
      return { success: false, error: 'Base de datos no inicializada', timestamp: Date.now() };
    }

    return getItemsByIndex<IndexedDBExercise>(STORES.EXERCISES, 'by_category', category);
  }, [isInitialized]);

  // Funciones para WorkoutRecord
  const addWorkoutRecord = useCallback(async (record: Omit<WorkoutRecord, 'id'>): Promise<DatabaseResult<IndexedDBWorkoutRecord>> => {
    if (!isInitialized) {
      return { success: false, error: 'Base de datos no inicializada', timestamp: Date.now() };
    }

    const now = Date.now();
    const newRecord: IndexedDBWorkoutRecord = {
      ...record,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      _needsSync: true,
      _isLocalOnly: !isOnline
    };

    try {
      const result = await addItem(STORES.WORKOUT_RECORDS, newRecord);

      if (result.success) {
        await queueSyncOperation('workoutRecord', newRecord.id, 'CREATE', newRecord, 'HIGH');
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: Date.now()
      };
    }
  }, [isInitialized, isOnline]);

  const updateWorkoutRecord = useCallback(async (record: IndexedDBWorkoutRecord): Promise<DatabaseResult<IndexedDBWorkoutRecord>> => {
    if (!isInitialized) {
      return { success: false, error: 'Base de datos no inicializada', timestamp: Date.now() };
    }

    const updatedRecord: IndexedDBWorkoutRecord = {
      ...record,
      updatedAt: Date.now(),
      _needsSync: true
    };

    try {
      const result = await updateItem(STORES.WORKOUT_RECORDS, updatedRecord);

      if (result.success) {
        await queueSyncOperation('workoutRecord', record.id, 'UPDATE', updatedRecord, 'MEDIUM');
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: Date.now()
      };
    }
  }, [isInitialized]);

  const deleteWorkoutRecord = useCallback(async (recordId: string): Promise<DatabaseResult<boolean>> => {
    if (!isInitialized) {
      return { success: false, error: 'Base de datos no inicializada', timestamp: Date.now() };
    }

    try {
      const result = await deleteItem(STORES.WORKOUT_RECORDS, recordId);

      if (result.success) {
        await queueSyncOperation('workoutRecord', recordId, 'DELETE', { id: recordId }, 'MEDIUM');
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: Date.now()
      };
    }
  }, [isInitialized]);

  const getWorkoutRecords = useCallback(async (options?: QueryOptions): Promise<DatabaseResult<IndexedDBWorkoutRecord[]>> => {
    if (!isInitialized) {
      return { success: false, error: 'Base de datos no inicializada', timestamp: Date.now() };
    }

    return getAllItems<IndexedDBWorkoutRecord>(STORES.WORKOUT_RECORDS, options);
  }, [isInitialized]);

  const getWorkoutRecordsByExercise = useCallback(async (exerciseId: string): Promise<DatabaseResult<IndexedDBWorkoutRecord[]>> => {
    if (!isInitialized) {
      return { success: false, error: 'Base de datos no inicializada', timestamp: Date.now() };
    }

    return getItemsByIndex<IndexedDBWorkoutRecord>(STORES.WORKOUT_RECORDS, 'by_exercise_id', exerciseId);
  }, [isInitialized]);

  const getWorkoutRecordsByDate = useCallback(async (date: Date): Promise<DatabaseResult<IndexedDBWorkoutRecord[]>> => {
    if (!isInitialized) {
      return { success: false, error: 'Base de datos no inicializada', timestamp: Date.now() };
    }

    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return getItemsByIndex<IndexedDBWorkoutRecord>(STORES.WORKOUT_RECORDS, 'by_date', dateKey);
  }, [isInitialized]);

  return {
    // Estado
    isInitialized,
    syncStatus,
    isOnline,

    // Exercises
    addExercise,
    updateExercise,
    deleteExercise,
    getExercises,
    getExercisesByCategory,

    // Workout Records
    addWorkoutRecord,
    updateWorkoutRecord,
    deleteWorkoutRecord,
    getWorkoutRecords,
    getWorkoutRecordsByExercise,
    getWorkoutRecordsByDate
  };
}; 