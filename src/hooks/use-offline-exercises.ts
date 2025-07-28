import { useOnlineStatus } from '@/stores/connection';
import { useCallback } from 'react';
import type { Exercise } from '../interfaces';
import { STORES } from '../utils/data/indexeddb-config';
import type {
  DatabaseResult,
  IndexedDBExercise,
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
 * Hook especializado para manejar ejercicios offline
 * Proporciona operaciones CRUD para ejercicios con sincronización automática
 */
export const useOfflineExercises = (isInitialized: boolean) => {
  const isOnline = useOnlineStatus();

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

  return {
    addExercise,
    updateExercise,
    deleteExercise,
    getExercises,
    getExercisesByCategory
  };
}; 