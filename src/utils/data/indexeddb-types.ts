import type { Exercise, WorkoutRecord } from '../../interfaces';
import type { SyncOperation, SyncPriority, SyncStatus } from './indexeddb-config';

/**
 * Tipos de datos para IndexedDB con metadatos de sincronización
 */

/**
 * Exercise con metadatos de sincronización
 */
export interface IndexedDBExercise extends Exercise {
  // Metadatos de sincronización
  _localId?: string;
  _isLocalOnly?: boolean;
  _needsSync?: boolean;
  _lastSyncAt?: number;
  _conflictData?: Partial<Exercise>;

  // Timestamps
  createdAt: number;
  updatedAt: number;
}

/**
 * WorkoutRecord con metadatos de sincronización
 */
export interface IndexedDBWorkoutRecord extends WorkoutRecord {
  // Metadatos de sincronización
  _localId?: string;
  _isLocalOnly?: boolean;
  _needsSync?: boolean;
  _lastSyncAt?: number;
  _conflictData?: Partial<WorkoutRecord>;

  // Timestamps
  createdAt: number;
  updatedAt: number;
}

/**
 * Elemento en la cola de sincronización
 */
export interface SyncQueueItem {
  id?: number; // Auto-increment
  entityType: 'exercise' | 'workoutRecord';
  entityId: string;
  operation: SyncOperation;
  status: SyncStatus;
  priority: SyncPriority;
  data: any; // Los datos a sincronizar
  error?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  updatedAt: number;
  scheduledFor?: number; // Para retrasos de reintentos
}

/**
 * Metadata del sistema
 */
export interface SystemMetadata {
  key: string;
  value: any;
  updatedAt: number;
}

/**
 * Configuración de usuario almacenada localmente
 */
export interface UserSettings extends SystemMetadata {
  key: 'userSettings';
  value: {
    theme?: 'light' | 'dark';
    language?: string;
    autoSync?: boolean;
    syncInterval?: number; // minutos
    maxCacheSize?: number; // MB
    // Configuración personalizada de volumen por grupo muscular
    customVolumeDistribution?: Record<string, number>;
  };
}

/**
 * Estado de sincronización general
 */
export interface SyncState extends SystemMetadata {
  key: 'syncState';
  value: {
    lastFullSync?: number;
    isOnline: boolean;
    isSyncing: boolean;
    pendingOperations: number;
    lastError?: string;
    nextScheduledSync?: number;
  };
}

/**
 * Estadísticas de uso de la base de datos
 */
export interface DatabaseStats extends SystemMetadata {
  key: 'databaseStats';
  value: {
    totalExercises: number;
    totalWorkoutRecords: number;
    totalSize: number; // bytes estimados
    lastCleanup?: number;
    cacheHitRate?: number;
  };
}

/**
 * Opciones para operaciones de base de datos
 */
export interface DatabaseOptions {
  forceSync?: boolean;
  priority?: SyncPriority;
  timeout?: number;
  retries?: number;
}

/**
 * Resultado de operaciones de base de datos
 */
export interface DatabaseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fromCache?: boolean;
  needsSync?: boolean;
  timestamp: number;
}

/**
 * Filtros para consultas
 */
export interface QueryFilter {
  field: string;
  operator: 'equals' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in';
  value: any;
}

/**
 * Opciones de consulta
 */
export interface QueryOptions {
  filters?: QueryFilter[];
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  limit?: number;
  offset?: number;
  includeDeleted?: boolean;
}

/**
 * Conflicto de sincronización
 */
export interface SyncConflict<T = any> {
  entityType: string;
  entityId: string;
  localData: T;
  remoteData: T;
  conflictFields: string[];
  resolvedData?: T;
  resolution?: 'local' | 'remote' | 'merge' | 'manual';
  timestamp: number;
}

/**
 * Eventos del sistema de sincronización
 */
export type SyncEvent =
  | { type: 'sync_started'; timestamp: number }
  | { type: 'sync_progress'; completed: number; total: number }
  | { type: 'sync_completed'; duration: number; itemsProcessed: number }
  | { type: 'sync_failed'; error: string; retryIn?: number }
  | { type: 'conflict_detected'; conflict: SyncConflict }
  | { type: 'offline_mode'; enabled: boolean }
  | { type: 'storage_quota_warning'; usagePercent: number };

/**
 * Configuración de la base de datos
 */
export interface DatabaseConfig {
  name: string;
  version: number;
  stores: Record<string, any>;
  syncEnabled: boolean;
  offlineMode: boolean;
  conflictResolution: 'local' | 'remote' | 'timestamp' | 'manual';
} 