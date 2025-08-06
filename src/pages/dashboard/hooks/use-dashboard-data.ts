import { useCallback, useEffect, useState } from 'react';

import { deleteWorkoutRecord, getExercises, getWorkoutRecords } from '@/api/services';
import type { Exercise, WorkoutRecord } from '@/interfaces';
import { useOnlineStatus } from '@/stores/connection';
import { useNotification } from '@/stores/notification';
import { logger } from '@/utils';

export const useDashboardData = () => {
  const { showNotification } = useNotification();
  const isOnline = useOnlineStatus();
  const [workoutRecords, setWorkoutRecords] = useState<WorkoutRecord[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!isOnline) {
      showNotification('Sin conexión. Los datos pueden estar desactualizados.', 'warning');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [recordsData, exercisesData] = await Promise.all([
        getWorkoutRecords(),
        getExercises(),
      ]);

      // Enriquecer los registros con información del ejercicio
      const enrichedRecords = recordsData.map((record: WorkoutRecord) => {
        const exercise = exercisesData.find((ex: Exercise) => ex.id === record.exerciseId);

        if (!exercise) {
          logger.warn(`Ejercicio no encontrado para record ${record.id} con exerciseId: ${record.exerciseId}`, { recordId: record.id, exerciseId: record.exerciseId }, 'DASHBOARD');
        }

        return {
          ...record,
          exercise,
        };
      });

      setWorkoutRecords(enrichedRecords);
      setExercises(exercisesData);
    } catch (error: unknown) {
      logger.error('Error cargando datos del dashboard:', error as Error, undefined, 'DASHBOARD');
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar los datos del dashboard';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [isOnline, showNotification]);

  const handleDeleteRecord = async (recordId: string): Promise<void> => {
    if (!isOnline) {
      showNotification('Sin conexión. No se puede eliminar el entrenamiento.', 'error');
      throw new Error('Sin conexión');
    }

    try {
      // Encontrar el registro para mostrar información en la notificación
      const recordToDelete = workoutRecords.find(record => record.id === recordId);

      // Eliminar de la base de datos
      await deleteWorkoutRecord(recordId);

      // Actualizar el estado local inmediatamente
      setWorkoutRecords(prevRecords =>
        prevRecords.filter(record => record.id !== recordId),
      );

      // Mostrar notificación de éxito
      const exerciseName = recordToDelete?.exercise?.name || 'Ejercicio';
      showNotification(`Entrenamiento de ${exerciseName} eliminado exitosamente`, 'success');

    } catch (error: unknown) {
      logger.error('Error eliminando entrenamiento:', error as Error, { recordId }, 'DASHBOARD');
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el entrenamiento';
      showNotification(errorMessage, 'error');
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    workoutRecords,
    exercises,
    loading,
    isOnline,
    loadData,
    handleDeleteRecord,
  };
};
