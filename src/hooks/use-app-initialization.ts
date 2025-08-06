import { useEffect, useRef } from 'react';

import { useInitializeConnection } from '@/stores/connection';

/**
 * Hook para inicializar el estado global de la aplicación
 * Reemplaza la funcionalidad del AppProvider usando Zustand
 */
export const useAppInitialization = () => {
  const { initializeConnection, isInitialized } = useInitializeConnection();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Inicializar la conexión solo una vez usando ref para evitar re-inicializaciones
    if (!isInitialized && !hasInitialized.current) {
      hasInitialized.current = true;
      initializeConnection();
    }
  }, [isInitialized, initializeConnection]); // Incluidas las dependencias necesarias

  return {
    isInitialized,
  };
};
