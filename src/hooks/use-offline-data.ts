import { useOfflineExercises } from './use-offline-exercises';
import { useOfflineSync } from './use-offline-sync';
import { useOfflineWorkoutRecords } from './use-offline-workout-records';

/**
 * Hook principal para manejar datos offline
 * Combina hooks especializados para proporcionar una API unificada
 */
export const useOfflineData = () => {
  const { isInitialized, syncStatus, isOnline } = useOfflineSync();
  const exercises = useOfflineExercises(isInitialized);
  const workoutRecords = useOfflineWorkoutRecords(isInitialized);

  return {
    // Estado de sincronización
    isInitialized,
    syncStatus,
    isOnline,

    // Operaciones de ejercicios
    ...exercises,

    // Operaciones de registros de entrenamiento
    ...workoutRecords,
  };
};
