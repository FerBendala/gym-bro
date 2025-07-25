import { useInitializeConnection } from '@/stores/connection-store';
import { useEffect, useRef } from 'react';

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
  }, []); // Sin dependencias para ejecutar solo una vez

  return {
    isInitialized
  };
}; 