import { useOnlineStatus } from '@/stores/connection';
import { useCallback } from 'react';
import type { WorkoutRecord } from '../interfaces';
import { STORES } from '../utils/data/indexeddb-config';
import type {
  DatabaseResult,
  IndexedDBWorkoutRecord,
  QueryOptions
} from '../utils/data/indexeddb-types';
import {
  addItem,
  deleteItem,
  getAllItems,
  getItemsByIndex,
  updateItem
} from '../utils/data/indexeddb-utils';
import { queueSyncOperation } from '../utils/data/sync-manager';

// Función helper para generar IDs únicos
const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

/**
 * Hook especializado para manejar registros de entrenamiento offline
 * Proporciona operaciones CRUD para workout records con sincronización automática
 */
export const useOfflineWorkoutRecords = (isInitialized: boolean) => {
  const isOnline = useOnlineStatus();

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
    addWorkoutRecord,
    updateWorkoutRecord,
    deleteWorkoutRecord,
    getWorkoutRecords,
    getWorkoutRecordsByExercise,
    getWorkoutRecordsByDate
  };
}; 