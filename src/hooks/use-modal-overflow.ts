import { useEffect } from 'react';

/**
 * Hook para manejar el overflow del body cuando hay modales abiertos
 * Previene el scroll del fondo cuando un modal está activo
 */
export const useModalOverflow = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      // Guardar el overflow original
      const originalOverflow = document.body.style.overflow;

      // Aplicar overflow hidden
      document.body.style.overflow = 'hidden';

      // Cleanup: restaurar el overflow original cuando el modal se cierre
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);
}; 