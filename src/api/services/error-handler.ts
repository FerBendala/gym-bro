/**
 * Manejador centralizado de errores de Firebase
 * Proporciona mensajes de error amigables para el usuario
 */

export const handleFirebaseError = (error: any, operation: string) => {
  console.error(`Error in ${operation}:`, error);

  // Errores específicos de Firebase
  if (error.code) {
    switch (error.code) {
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
        throw new Error(`Error de Firebase: ${error.message || 'Error desconocido'}`);
    }
  }

  // Errores de red
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    throw new Error('Error de conexión. Verifica tu internet e intenta nuevamente.');
  }

  // Error genérico
  throw new Error(`Error en ${operation}: ${error.message || 'Error desconocido'}`);
}; 