import { logger } from '@/utils';

/**
 * Maneja errores de Firebase de forma centralizada
 * @param error Error de Firebase
 * @param operation Operación que falló
 * @throws {Error} Error con mensaje para el usuario
 */
export const handleFirebaseError = (error: unknown, operation: string): void => {
  logger.error(`Error in ${operation}:`, error as Error, { operation }, 'API');
};
