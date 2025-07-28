
/**
 * Interfaz para errores de Firebase con propiedades específicas
 */
interface FirebaseError {
  code?: string;
  message?: string;
  name?: string;
  stack?: string;
}

/**
 * Tipo unión para diferentes tipos de errores que pueden ocurrir
 */
type AppError = FirebaseError | Error | { message?: string; code?: string } | unknown;

/**
 * Maneja errores de Firebase de manera centralizada
 * @param {AppError} error - Error de Firebase u otro error de la aplicación
 * @param {string} operation - Operación en la que se produjo el error
 * @throws {Error} Error con mensaje para el usuario
 */
export const handleFirebaseError = (error: AppError, operation: string) => {
  console.error(`Error in ${operation}:`, error);

  // Normalizar el error para extraer propiedades comunes
  const errorObj = error as FirebaseError;
  const errorCode = errorObj.code;
  const errorMessage = errorObj.message || 'Error desconocido';

  // Errores específicos de Firebase
  if (errorCode) {
    switch (errorCode) {
      case 'unavailable':
        throw new Error('Base de datos no disponible. Verifica tu conexión a internet.');
      case 'permission-denied':
        throw new Error('No tienes permisos para realizar esta operación.');
      case 'not-found':
        throw new Error('El documento solicitado no existe.');
      case 'already-exists':
        throw new Error('El documento ya existe.');
      case 'resource-exhausted':
        throw new Error('Se ha excedido el límite de operaciones. Intenta más tarde.');
      case 'deadline-exceeded':
        throw new Error('La operación tardó demasiado tiempo. Intenta nuevamente.');
      case 'cancelled':
        throw new Error('La operación fue cancelada.');
      case 'internal':
        throw new Error('Error interno del servidor. Intenta más tarde.');
      case 'unauthenticated':
        throw new Error('No estás autenticado. Inicia sesión nuevamente.');
      default:
        throw new Error(`Error de Firebase: ${errorMessage}`);
    }
  }

  // Errores de red
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    throw new Error('Error de conexión. Verifica tu internet e intenta nuevamente.');
  }

  // Error genérico
  throw new Error(`Error en ${operation}: ${errorMessage}`);
}; 