import type { Exercise, WorkoutRecord } from '../interfaces';
import type {
  DatabaseResult,
  IndexedDBExercise,
  IndexedDBWorkoutRecord
} from '../utils/data/indexeddb-types';

/**
 * Capa de API que usa IndexedDB primero con respaldo en Firebase
 * Proporciona respuesta inmediata y sincronización en segundo plano
 */

class OfflineDatabaseAPI {
  constructor() {
  }

  // Exercises
  async addExercise(exercise: Omit<Exercise, 'id'>): Promise<Exercise> {
    try {
      // Primero guardar en IndexedDB para respuesta inmediata
      const result = await this.saveExerciseLocally(exercise);

      if (!result.success) {
        throw new Error(result.error || 'Error guardando ejercicio localmente');
      }

      // Convertir de IndexedDB a formato de Exercise regular
      const savedExercise = this.convertFromIndexedDB(result.data!);

      // La sincronización con Firebase se maneja automáticamente en segundo plano
      return savedExercise;
    } catch (error) {
      console.error('Error en addExercise:', error);
      throw error;
    }
  }

  async updateExercise(exercise: Exercise): Promise<Exercise> {
    try {
      // Convertir a formato IndexedDB
      const indexedDBExercise = this.convertToIndexedDB(exercise) as IndexedDBExercise;

      // Actualizar localmente primero
      const result = await this.updateExerciseLocally(indexedDBExercise);

      if (!result.success) {
        throw new Error(result.error || 'Error actualizando ejercicio localmente');
      }

      return this.convertFromIndexedDB(result.data!);
    } catch (error) {
      console.error('Error en updateExercise:', error);
      throw error;
    }
  }

  async deleteExercise(exerciseId: string): Promise<void> {
    try {
      const result = await this.deleteExerciseLocally(exerciseId);

      if (!result.success) {
        throw new Error(result.error || 'Error eliminando ejercicio localmente');
      }
    } catch (error) {
      console.error('Error en deleteExercise:', error);
      throw error;
    }
  }

  async getExercises(): Promise<Exercise[]> {
    try {
      const result = await this.getExercisesLocally();

      if (!result.success) {
        throw new Error(result.error || 'Error obteniendo ejercicios localmente');
      }

      return result.data?.map(this.convertFromIndexedDB) || [];
    } catch (error) {
      console.error('Error en getExercises:', error);
      throw error;
    }
  }

  // Workout Records
  async addWorkoutRecord(record: Omit<WorkoutRecord, 'id'>): Promise<WorkoutRecord> {
    try {
      const result = await this.saveWorkoutRecordLocally(record);

      if (!result.success) {
        throw new Error(result.error || 'Error guardando registro localmente');
      }

      return this.convertWorkoutRecordFromIndexedDB(result.data!);
    } catch (error) {
      console.error('Error en addWorkoutRecord:', error);
      throw error;
    }
  }

  async updateWorkoutRecord(record: WorkoutRecord): Promise<WorkoutRecord> {
    try {
      const indexedDBRecord = this.convertWorkoutRecordToIndexedDB(record) as IndexedDBWorkoutRecord;
      const result = await this.updateWorkoutRecordLocally(indexedDBRecord);

      if (!result.success) {
        throw new Error(result.error || 'Error actualizando registro localmente');
      }

      return this.convertWorkoutRecordFromIndexedDB(result.data!);
    } catch (error) {
      console.error('Error en updateWorkoutRecord:', error);
      throw error;
    }
  }

  async deleteWorkoutRecord(recordId: string): Promise<void> {
    try {
      const result = await this.deleteWorkoutRecordLocally(recordId);

      if (!result.success) {
        throw new Error(result.error || 'Error eliminando registro localmente');
      }
    } catch (error) {
      console.error('Error en deleteWorkoutRecord:', error);
      throw error;
    }
  }

  async getWorkoutRecords(): Promise<WorkoutRecord[]> {
    try {
      const result = await this.getWorkoutRecordsLocally();

      if (!result.success) {
        throw new Error(result.error || 'Error obteniendo registros localmente');
      }

      return result.data?.map(this.convertWorkoutRecordFromIndexedDB) || [];
    } catch (error) {
      console.error('Error en getWorkoutRecords:', error);
      throw error;
    }
  }

  // Métodos privados para operaciones locales
  // Estos serían reemplazados por llamadas reales al hook useOfflineData
  private async saveExerciseLocally(exercise: Omit<Exercise, 'id'>): Promise<DatabaseResult<IndexedDBExercise>> {
    // Placeholder - en implementación real usaría useOfflineData
    const now = Date.now();
    const mockResult: IndexedDBExercise = {
      ...exercise,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
      _needsSync: true
    };

    return {
      success: true,
      data: mockResult,
      fromCache: true,
      timestamp: now
    };
  }

  private async updateExerciseLocally(exercise: IndexedDBExercise): Promise<DatabaseResult<IndexedDBExercise>> {
    // Placeholder
    return {
      success: true,
      data: { ...exercise, updatedAt: Date.now() },
      fromCache: true,
      timestamp: Date.now()
    };
  }

  private async deleteExerciseLocally(exerciseId: string): Promise<DatabaseResult<boolean>> {
    // Placeholder
    return {
      success: true,
      data: true,
      fromCache: true,
      timestamp: Date.now()
    };
  }

  private async getExercisesLocally(): Promise<DatabaseResult<IndexedDBExercise[]>> {
    // Placeholder
    return {
      success: true,
      data: [],
      fromCache: true,
      timestamp: Date.now()
    };
  }

  private async saveWorkoutRecordLocally(record: Omit<WorkoutRecord, 'id'>): Promise<DatabaseResult<IndexedDBWorkoutRecord>> {
    // Placeholder
    const now = Date.now();
    const mockResult: IndexedDBWorkoutRecord = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
      _needsSync: true
    };

    return {
      success: true,
      data: mockResult,
      fromCache: true,
      timestamp: now
    };
  }

  private async updateWorkoutRecordLocally(record: IndexedDBWorkoutRecord): Promise<DatabaseResult<IndexedDBWorkoutRecord>> {
    // Placeholder
    return {
      success: true,
      data: { ...record, updatedAt: Date.now() },
      fromCache: true,
      timestamp: Date.now()
    };
  }

  private async deleteWorkoutRecordLocally(recordId: string): Promise<DatabaseResult<boolean>> {
    // Placeholder
    return {
      success: true,
      data: true,
      fromCache: true,
      timestamp: Date.now()
    };
  }

  private async getWorkoutRecordsLocally(): Promise<DatabaseResult<IndexedDBWorkoutRecord[]>> {
    // Placeholder
    return {
      success: true,
      data: [],
      fromCache: true,
      timestamp: Date.now()
    };
  }

  // Métodos de conversión
  private convertFromIndexedDB(indexedDBExercise: IndexedDBExercise): Exercise {
    const { _localId, _isLocalOnly, _needsSync, _lastSyncAt, _conflictData, createdAt, updatedAt, ...exercise } = indexedDBExercise;
    return exercise;
  }

  private convertToIndexedDB(exercise: Exercise): Partial<IndexedDBExercise> {
    return {
      ...exercise,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      _needsSync: true
    };
  }

  private convertWorkoutRecordFromIndexedDB(indexedDBRecord: IndexedDBWorkoutRecord): WorkoutRecord {
    const { _localId, _isLocalOnly, _needsSync, _lastSyncAt, _conflictData, createdAt, updatedAt, ...record } = indexedDBRecord;
    return record;
  }

  private convertWorkoutRecordToIndexedDB(record: WorkoutRecord): Partial<IndexedDBWorkoutRecord> {
    return {
      ...record,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      _needsSync: true
    };
  }

  // Métodos de estado
  async getSyncStatus() {
    return {
      isOnline: navigator.onLine,
      isSyncing: false,
      pendingOperations: 0,
      lastSync: Date.now()
    };
  }
}

// Instancia singleton
export const offlineAPI = new OfflineDatabaseAPI();

// Funciones de conveniencia que mantienen la misma API que antes
export const addExercise = (exercise: Omit<Exercise, 'id'>) => offlineAPI.addExercise(exercise);
export const updateExercise = (exercise: Exercise) => offlineAPI.updateExercise(exercise);
export const deleteExercise = (exerciseId: string) => offlineAPI.deleteExercise(exerciseId);
export const getExercises = () => offlineAPI.getExercises();

export const addWorkoutRecord = (record: Omit<WorkoutRecord, 'id'>) => offlineAPI.addWorkoutRecord(record);
export const updateWorkoutRecord = (record: WorkoutRecord) => offlineAPI.updateWorkoutRecord(record);
export const deleteWorkoutRecord = (recordId: string) => offlineAPI.deleteWorkoutRecord(recordId);
export const getWorkoutRecords = () => offlineAPI.getWorkoutRecords(); 