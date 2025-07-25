import {
  DB_NAME,
  DB_VERSION,
  STORE_CONFIG,
  type StoreName
} from './indexeddb-config';
import type {
  DatabaseResult,
  QueryFilter,
  QueryOptions
} from './indexeddb-types';

/**
 * Utilidades genéricas para IndexedDB
 * Sistema robusto con manejo de errores y transacciones
 */

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Inicializa y abre la base de datos IndexedDB
 */
export const initializeDB = (): Promise<IDBDatabase> => {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB no está soportado en este navegador'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(`Error al abrir la base de datos: ${request.error?.message}`));
    };

    request.onsuccess = () => {
      dbInstance = request.result;

      // Manejar cierres inesperados
      dbInstance.onclose = () => {
        console.warn('Base de datos cerrada inesperadamente');
        dbInstance = null;
        dbPromise = null;
      };

      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      createStores(db);
    };
  });

  return dbPromise;
};

/**
 * Crea los stores y sus índices
 */
const createStores = (db: IDBDatabase) => {
  Object.entries(STORE_CONFIG).forEach(([storeName, config]) => {
    if (db.objectStoreNames.contains(storeName)) {
      // Si el store existe, necesitamos recrearlo si cambió la configuración
      db.deleteObjectStore(storeName);
    }

    const store = db.createObjectStore(storeName, {
      keyPath: config.keyPath,
      autoIncrement: config.autoIncrement
    });

    // Crear índices
    config.indexes.forEach(index => {
      store.createIndex(index.name, index.keyPath, { unique: index.unique });
    });
  });
};

/**
 * Obtiene la instancia de la base de datos
 */
export const getDB = async (): Promise<IDBDatabase> => {
  if (dbInstance) {
    return dbInstance;
  }
  return await initializeDB();
};

/**
 * Ejecuta una operación en una transacción
 */
export const executeTransaction = async <T>(
  storeNames: StoreName | StoreName[],
  mode: IDBTransactionMode,
  operation: (stores: IDBObjectStore | IDBObjectStore[]) => Promise<T> | T
): Promise<DatabaseResult<T>> => {
  try {
    const db = await getDB();
    const storeNameArray = Array.isArray(storeNames) ? storeNames : [storeNames];

    const transaction = db.transaction(storeNameArray, mode);
    const stores = storeNameArray.length === 1
      ? transaction.objectStore(storeNameArray[0])
      : storeNameArray.map(name => transaction.objectStore(name));

    const result = await operation(stores);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        resolve({
          success: true,
          data: result,
          fromCache: true,
          timestamp: Date.now()
        });
      };

      transaction.onerror = () => {
        reject({
          success: false,
          error: `Error en transacción: ${transaction.error?.message}`,
          timestamp: Date.now()
        });
      };

      transaction.onabort = () => {
        reject({
          success: false,
          error: 'Transacción abortada',
          timestamp: Date.now()
        });
      };
    });
  } catch (error) {
    return {
      success: false,
      error: `Error ejecutando transacción: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      timestamp: Date.now()
    };
  }
};

/**
 * Agrega un elemento a un store
 */
export const addItem = async <T>(
  storeName: StoreName,
  data: T
): Promise<DatabaseResult<T>> => {
  return executeTransaction(storeName, 'readwrite', async (store) => {
    const request = (store as IDBObjectStore).add(data);
    return new Promise<T>((resolve, reject) => {
      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(new Error(`Error agregando item: ${request.error?.message}`));
    });
  });
};

/**
 * Actualiza un elemento en un store
 */
export const updateItem = async <T>(
  storeName: StoreName,
  data: T
): Promise<DatabaseResult<T>> => {
  return executeTransaction(storeName, 'readwrite', async (store) => {
    const request = (store as IDBObjectStore).put(data);
    return new Promise<T>((resolve, reject) => {
      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(new Error(`Error actualizando item: ${request.error?.message}`));
    });
  });
};

/**
 * Obtiene un elemento por ID
 */
export const getItem = async <T>(
  storeName: StoreName,
  id: string
): Promise<DatabaseResult<T>> => {
  return executeTransaction(storeName, 'readonly', async (store) => {
    const request = (store as IDBObjectStore).get(id);
    return new Promise<T>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Error obteniendo item: ${request.error?.message}`));
    });
  });
};

/**
 * Elimina un elemento por ID
 */
export const deleteItem = async (
  storeName: StoreName,
  id: string
): Promise<DatabaseResult<boolean>> => {
  return executeTransaction(storeName, 'readwrite', async (store) => {
    const request = (store as IDBObjectStore).delete(id);
    return new Promise<boolean>((resolve, reject) => {
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(new Error(`Error eliminando item: ${request.error?.message}`));
    });
  });
};

/**
 * Obtiene todos los elementos de un store
 */
export const getAllItems = async <T>(
  storeName: StoreName,
  options?: QueryOptions
): Promise<DatabaseResult<T[]>> => {
  return executeTransaction(storeName, 'readonly', async (store) => {
    const request = (store as IDBObjectStore).getAll();
    return new Promise<T[]>((resolve, reject) => {
      request.onsuccess = () => {
        let results = request.result;

        // Aplicar filtros si existen
        if (options?.filters) {
          results = applyFilters(results, options.filters);
        }

        // Aplicar ordenamiento
        if (options?.orderBy) {
          results = applySorting(results, options.orderBy);
        }

        // Aplicar limit y offset
        if (options?.offset || options?.limit) {
          const start = options.offset || 0;
          const end = options.limit ? start + options.limit : undefined;
          results = results.slice(start, end);
        }

        resolve(results);
      };
      request.onerror = () => reject(new Error(`Error obteniendo items: ${request.error?.message}`));
    });
  });
};

/**
 * Busca elementos usando un índice
 */
export const getItemsByIndex = async <T>(
  storeName: StoreName,
  indexName: string,
  value: unknown,
  options?: QueryOptions
): Promise<DatabaseResult<T[]>> => {
  return executeTransaction(storeName, 'readonly', async (store) => {
    const index = (store as IDBObjectStore).index(indexName);
    const request = index.getAll(value);

    return new Promise<T[]>((resolve, reject) => {
      request.onsuccess = () => {
        let results = request.result;

        if (options?.filters) {
          results = applyFilters(results, options.filters);
        }

        if (options?.orderBy) {
          results = applySorting(results, options.orderBy);
        }

        if (options?.offset || options?.limit) {
          const start = options.offset || 0;
          const end = options.limit ? start + options.limit : undefined;
          results = results.slice(start, end);
        }

        resolve(results);
      };
      request.onerror = () => reject(new Error(`Error buscando por índice: ${request.error?.message}`));
    });
  });
};

/**
 * Cuenta elementos en un store
 */
export const countItems = async (
  storeName: StoreName
): Promise<DatabaseResult<number>> => {
  return executeTransaction(storeName, 'readonly', async (store) => {
    const request = (store as IDBObjectStore).count();
    return new Promise<number>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Error contando items: ${request.error?.message}`));
    });
  });
};

/**
 * Limpia todos los elementos de un store
 */
export const clearStore = async (storeName: StoreName): Promise<DatabaseResult<boolean>> => {
  return executeTransaction(storeName, 'readwrite', async (store) => {
    const request = (store as IDBObjectStore).clear();
    return new Promise<boolean>((resolve, reject) => {
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(new Error(`Error limpiando store: ${request.error?.message}`));
    });
  });
};

/**
 * Aplica filtros a los resultados
 */
const applyFilters = <T>(items: T[], filters: QueryFilter[]): T[] => {
  return items.filter(item => {
    return filters.every(filter => {
      const fieldValue = getNestedValue(item, filter.field);

      switch (filter.operator) {
        case 'equals':
          return fieldValue === filter.value;
        case 'gt':
          return fieldValue > filter.value;
        case 'gte':
          return fieldValue >= filter.value;
        case 'lt':
          return fieldValue < filter.value;
        case 'lte':
          return fieldValue <= filter.value;
        case 'between':
          return fieldValue >= filter.value[0] && fieldValue <= filter.value[1];
        case 'in':
          return Array.isArray(filter.value) && filter.value.includes(fieldValue);
        default:
          return true;
      }
    });
  });
};

/**
 * Aplica ordenamiento a los resultados
 */
const applySorting = <T>(items: T[], orderBy: { field: string; direction: 'asc' | 'desc' }): T[] => {
  return items.sort((a, b) => {
    const aValue = getNestedValue(a, orderBy.field);
    const bValue = getNestedValue(b, orderBy.field);

    let comparison = 0;
    if (aValue > bValue) comparison = 1;
    if (aValue < bValue) comparison = -1;

    return orderBy.direction === 'desc' ? -comparison : comparison;
  });
};

/**
 * Obtiene un valor anidado de un objeto usando notación de punto
 */
const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * Verifica si IndexedDB está disponible
 */
export const isIndexedDBSupported = (): boolean => {
  return typeof window !== 'undefined' && !!window.indexedDB;
};

/**
 * Obtiene información sobre el uso de la base de datos
 */
export const getDatabaseInfo = async (): Promise<{
  name: string;
  version: number;
  stores: string[];
  size?: number;
}> => {
  const db = await getDB();
  return {
    name: db.name,
    version: db.version,
    stores: Array.from(db.objectStoreNames),
    // size se calcularía con estimateUsage en navegadores compatibles
  };
};

/**
 * Cierra la conexión a la base de datos
 */
export const closeDB = (): void => {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    dbPromise = null;
  }
}; 