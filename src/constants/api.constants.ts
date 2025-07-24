/**
 * Constantes relacionadas con APIs y servicios
 * URLs, endpoints, timeouts, headers, etc.
 */

// Configuración de Firebase
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
} as const;

// Timeouts de API
export const API_TIMEOUTS = {
  default: 30000,      // 30 segundos
  short: 10000,        // 10 segundos
  long: 60000,         // 1 minuto
  upload: 120000       // 2 minutos para uploads
} as const;

// Headers por defecto
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
} as const;

// Estados de conexión
export const CONNECTION_STATUS = {
  online: 'online',
  offline: 'offline',
  connecting: 'connecting',
  error: 'error'
} as const;

// Códigos de error comunes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR'
} as const;

// Tipos de operación
export const OPERATION_TYPES = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  SYNC: 'sync'
} as const;

// Configuración de IndexedDB
export const INDEXEDDB_CONFIG = {
  name: 'FollowGymDB',
  version: 1,
  stores: {
    exercises: 'exercises',
    workouts: 'workouts',
    metadata: 'metadata',
    settings: 'settings'
  }
} as const;

// Tipos TypeScript
export type ConnectionStatus = typeof CONNECTION_STATUS[keyof typeof CONNECTION_STATUS];
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export type OperationType = typeof OPERATION_TYPES[keyof typeof OPERATION_TYPES];
export type ApiTimeout = keyof typeof API_TIMEOUTS; 