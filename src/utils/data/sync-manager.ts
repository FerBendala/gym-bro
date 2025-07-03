import { STORES, SYNC_OPERATIONS, SYNC_PRIORITY, SYNC_STATUS } from './indexeddb-config';
import type {
  DatabaseResult,
  SyncEvent,
  SyncQueueItem
} from './indexeddb-types';
import {
  addItem,
  deleteItem,
  getItemsByIndex,
  updateItem
} from './indexeddb-utils';

/**
 * Sistema de sincronización entre IndexedDB y Firebase
 * Maneja operaciones offline y sincronización automática
 */

type SyncEventListener = (event: SyncEvent) => void;

class SyncManager {
  private eventListeners: SyncEventListener[] = [];
  private syncInterval: number | null = null;
  private isSyncing = false;
  private retryTimeouts: Map<number, number> = new Map();

  constructor() {
    this.setupOnlineListener();
  }

  /**
   * Configura el listener de estado online
   */
  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      this.emit({ type: 'offline_mode', enabled: false });
      this.startAutoSync();
    });

    window.addEventListener('offline', () => {
      this.emit({ type: 'offline_mode', enabled: true });
      this.stopAutoSync();
    });
  }

  /**
   * Inicia la sincronización automática
   */
  startAutoSync(intervalMinutes: number = 5): void {
    this.stopAutoSync();

    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.processSyncQueue();
      }
    }, intervalMinutes * 60 * 1000) as any;
  }

  /**
   * Detiene la sincronización automática
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Agrega un listener de eventos
   */
  addEventListener(listener: SyncEventListener): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remueve un listener de eventos
   */
  removeEventListener(listener: SyncEventListener): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * Emite un evento a todos los listeners
   */
  private emit(event: SyncEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error en listener de eventos de sync:', error);
      }
    });
  }

  /**
   * Agrega una operación a la cola de sincronización
   */
  async queueOperation(
    entityType: 'exercise' | 'workoutRecord',
    entityId: string,
    operation: keyof typeof SYNC_OPERATIONS,
    data: any,
    priority: keyof typeof SYNC_PRIORITY = 'MEDIUM'
  ): Promise<DatabaseResult<SyncQueueItem>> {
    const queueItem: SyncQueueItem = {
      entityType,
      entityId,
      operation: SYNC_OPERATIONS[operation],
      status: SYNC_STATUS.PENDING,
      priority: SYNC_PRIORITY[priority],
      data,
      retryCount: 0,
      maxRetries: 3,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const result = await addItem(STORES.SYNC_QUEUE, queueItem);

    // Si estamos online, intentar sincronizar inmediatamente
    if (navigator.onLine && !this.isSyncing) {
      setTimeout(() => this.processSyncQueue(), 100);
    }

    return result;
  }

  /**
   * Procesa la cola de sincronización
   */
  async processSyncQueue(): Promise<void> {
    if (this.isSyncing || !navigator.onLine) {
      return;
    }

    this.isSyncing = true;
    this.emit({ type: 'sync_started', timestamp: Date.now() });

    try {
      // Obtener elementos pendientes ordenados por prioridad y fecha
      const pendingResult = await getItemsByIndex<SyncQueueItem>(
        STORES.SYNC_QUEUE,
        'by_status',
        SYNC_STATUS.PENDING,
        {
          orderBy: { field: 'priority', direction: 'asc' },
          limit: 50 // Procesar en lotes
        }
      );

      if (!pendingResult.success || !pendingResult.data) {
        return;
      }

      const pendingItems = pendingResult.data;
      let processed = 0;

      for (const item of pendingItems) {
        try {
          await this.processSyncItem(item);
          processed++;

          this.emit({
            type: 'sync_progress',
            completed: processed,
            total: pendingItems.length
          });
        } catch (error) {
          console.error('Error procesando item de sync:', error);
          await this.handleSyncError(item, error as Error);
        }
      }

      this.emit({
        type: 'sync_completed',
        duration: Date.now(),
        itemsProcessed: processed
      });

    } catch (error) {
      console.error('Error en processSyncQueue:', error);
      this.emit({
        type: 'sync_failed',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Procesa un elemento individual de la cola
   */
  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    // Marcar como en progreso
    const updatedItem = {
      ...item,
      status: SYNC_STATUS.IN_PROGRESS,
      updatedAt: Date.now()
    };
    await updateItem(STORES.SYNC_QUEUE, updatedItem);

    try {
      // Simular llamada a Firebase - aquí iría la lógica real
      await this.syncWithFirebase(item);

      // Marcar como completado
      await updateItem(STORES.SYNC_QUEUE, {
        ...updatedItem,
        status: SYNC_STATUS.COMPLETED,
        updatedAt: Date.now()
      });

      // Opcional: limpiar elementos completados después de un tiempo
      setTimeout(() => {
        this.cleanupCompletedItems();
      }, 60000); // 1 minuto

    } catch (error) {
      throw error;
    }
  }

  /**
   * Sincroniza con Firebase (placeholder - implementar con API real)
   */
  private async syncWithFirebase(item: SyncQueueItem): Promise<void> {
    // Aquí iría la lógica real de sincronización con Firebase
    // Por ahora simulamos la operación

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular éxito/fallo aleatorio para testing
        if (Math.random() > 0.1) { // 90% éxito
          resolve();
        } else {
          reject(new Error('Error simulado de red'));
        }
      }, 1000 + Math.random() * 2000); // 1-3 segundos
    });
  }

  /**
   * Maneja errores de sincronización
   */
  private async handleSyncError(item: SyncQueueItem, error: Error): Promise<void> {
    const retryCount = item.retryCount + 1;

    if (retryCount <= item.maxRetries) {
      // Programar reintento con backoff exponencial
      const delayMs = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
      const scheduledFor = Date.now() + delayMs;

      const updatedItem = {
        ...item,
        status: SYNC_STATUS.PENDING,
        retryCount,
        scheduledFor,
        error: error.message,
        updatedAt: Date.now()
      };

      await updateItem(STORES.SYNC_QUEUE, updatedItem);

      // Programar el reintento
      const timeout = setTimeout(() => {
        this.retryTimeouts.delete(item.id!);
        this.processSyncQueue();
      }, delayMs);

      this.retryTimeouts.set(item.id!, timeout);

      this.emit({
        type: 'sync_failed',
        error: error.message,
        retryIn: delayMs
      });
    } else {
      // Máximo de reintentos alcanzado
      await updateItem(STORES.SYNC_QUEUE, {
        ...item,
        status: SYNC_STATUS.FAILED,
        error: error.message,
        updatedAt: Date.now()
      });

      this.emit({
        type: 'sync_failed',
        error: `Máximo de reintentos alcanzado: ${error.message}`
      });
    }
  }

  /**
   * Limpia elementos completados antiguos
   */
  private async cleanupCompletedItems(): Promise<void> {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 horas

    try {
      const completedResult = await getItemsByIndex<SyncQueueItem>(
        STORES.SYNC_QUEUE,
        'by_status',
        SYNC_STATUS.COMPLETED
      );

      if (completedResult.success && completedResult.data) {
        const oldItems = completedResult.data.filter(
          item => item.updatedAt < cutoffTime
        );

        for (const item of oldItems) {
          await deleteItem(STORES.SYNC_QUEUE, item.id!.toString());
        }
      }
    } catch (error) {
      console.error('Error limpiando elementos completados:', error);
    }
  }

  /**
   * Fuerza la sincronización inmediata
   */
  async forcSync(): Promise<void> {
    if (!navigator.onLine) {
      throw new Error('No hay conexión a internet');
    }

    if (this.isSyncing) {
      throw new Error('Ya hay una sincronización en progreso');
    }

    await this.processSyncQueue();
  }

  /**
   * Obtiene estadísticas de la cola de sincronización
   */
  async getSyncStats(): Promise<{
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
  }> {
    const [pending, inProgress, completed, failed] = await Promise.all([
      getItemsByIndex(STORES.SYNC_QUEUE, 'by_status', SYNC_STATUS.PENDING),
      getItemsByIndex(STORES.SYNC_QUEUE, 'by_status', SYNC_STATUS.IN_PROGRESS),
      getItemsByIndex(STORES.SYNC_QUEUE, 'by_status', SYNC_STATUS.COMPLETED),
      getItemsByIndex(STORES.SYNC_QUEUE, 'by_status', SYNC_STATUS.FAILED)
    ]);

    return {
      pending: pending.data?.length || 0,
      inProgress: inProgress.data?.length || 0,
      completed: completed.data?.length || 0,
      failed: failed.data?.length || 0
    };
  }

  /**
   * Cancela todos los reintentos programados
   */
  cancelAllRetries(): void {
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();
  }

  /**
   * Limpia recursos al destruir el manager
   */
  destroy(): void {
    this.stopAutoSync();
    this.cancelAllRetries();
    this.eventListeners = [];
  }
}

// Instancia singleton
export const syncManager = new SyncManager();

// Funciones de conveniencia
export const startSync = (intervalMinutes?: number) => syncManager.startAutoSync(intervalMinutes);
export const stopSync = () => syncManager.stopAutoSync();
export const forceSync = () => syncManager.forcSync();
export const queueSyncOperation = (
  entityType: 'exercise' | 'workoutRecord',
  entityId: string,
  operation: keyof typeof SYNC_OPERATIONS,
  data: any,
  priority?: keyof typeof SYNC_PRIORITY
) => syncManager.queueOperation(entityType, entityId, operation, data, priority);

export const addSyncEventListener = (listener: SyncEventListener) =>
  syncManager.addEventListener(listener);

export const removeSyncEventListener = (listener: SyncEventListener) =>
  syncManager.removeEventListener(listener); 