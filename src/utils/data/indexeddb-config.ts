/**
 * Configuración de IndexedDB para Follow Gym
 * Sistema offline-first con sincronización a Firebase
 */

export const DB_NAME = 'FollowGymDB';
export const DB_VERSION = 1;

/**
 * Esquema de stores de IndexedDB
 */
export const STORES = {
  EXERCISES: 'exercises',
  WORKOUT_RECORDS: 'workoutRecords',
  SYNC_QUEUE: 'syncQueue',
  METADATA: 'metadata',
} as const;

/**
 * Índices para búsquedas eficientes
 */
export const INDEXES = {
  EXERCISES: {
    BY_CATEGORY: 'by_category',
    BY_NAME: 'by_name',
    BY_UPDATED_AT: 'by_updated_at',
  },
  WORKOUT_RECORDS: {
    BY_EXERCISE_ID: 'by_exercise_id',
    BY_DATE: 'by_date',
    BY_UPDATED_AT: 'by_updated_at',
  },
  SYNC_QUEUE: {
    BY_STATUS: 'by_status',
    BY_CREATED_AT: 'by_created_at',
    BY_PRIORITY: 'by_priority',
  },
} as const;

/**
 * Estados de sincronización
 */
export const SYNC_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

/**
 * Tipos de operaciones para sincronización
 */
export const SYNC_OPERATIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

/**
 * Prioridades de sincronización
 */
export const SYNC_PRIORITY = {
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
} as const;

/**
 * Configuración de stores con índices
 */
export const STORE_CONFIG = {
  [STORES.EXERCISES]: {
    keyPath: 'id',
    autoIncrement: false,
    indexes: [
      { name: INDEXES.EXERCISES.BY_CATEGORY, keyPath: 'category', unique: false },
      { name: INDEXES.EXERCISES.BY_NAME, keyPath: 'name', unique: false },
      { name: INDEXES.EXERCISES.BY_UPDATED_AT, keyPath: 'updatedAt', unique: false },
    ],
  },
  [STORES.WORKOUT_RECORDS]: {
    keyPath: 'id',
    autoIncrement: false,
    indexes: [
      { name: INDEXES.WORKOUT_RECORDS.BY_EXERCISE_ID, keyPath: 'exerciseId', unique: false },
      { name: INDEXES.WORKOUT_RECORDS.BY_DATE, keyPath: 'date', unique: false },
      { name: INDEXES.WORKOUT_RECORDS.BY_UPDATED_AT, keyPath: 'updatedAt', unique: false },
    ],
  },
  [STORES.SYNC_QUEUE]: {
    keyPath: 'id',
    autoIncrement: true,
    indexes: [
      { name: INDEXES.SYNC_QUEUE.BY_STATUS, keyPath: 'status', unique: false },
      { name: INDEXES.SYNC_QUEUE.BY_CREATED_AT, keyPath: 'createdAt', unique: false },
      { name: INDEXES.SYNC_QUEUE.BY_PRIORITY, keyPath: 'priority', unique: false },
    ],
  },
  [STORES.METADATA]: {
    keyPath: 'key',
    autoIncrement: false,
    indexes: [],
  },
} as const;

export type SyncStatus = typeof SYNC_STATUS[keyof typeof SYNC_STATUS];
export type SyncOperation = typeof SYNC_OPERATIONS[keyof typeof SYNC_OPERATIONS];
export type SyncPriority = typeof SYNC_PRIORITY[keyof typeof SYNC_PRIORITY];
export type StoreName = typeof STORES[keyof typeof STORES];
