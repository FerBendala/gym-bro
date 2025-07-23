import { deleteWorkoutRecord, getExercises, getWorkoutRecords } from '@/api/services';
import { useNotification } from '@/context/notification-context';
import { useOnlineStatus } from '@/hooks';
import type { Exercise, WorkoutRecord } from '@/interfaces';
import { useEffect, useState } from 'react';

export const useDashboardData = () => {
  const { showNotification } = useNotification();
  const isOnline = useOnlineStatus();
  const [workoutRecords, setWorkoutRecords] = useState<WorkoutRecord[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!isOnline) {
      showNotification('Sin conexión. Los datos pueden estar desactualizados.', 'warning');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [recordsData, exercisesData] = await Promise.all([
        getWorkoutRecords(),
        getExercises()
      ]);

      // Enriquecer los registros con información del ejercicio
      const enrichedRecords = recordsData.map(record => ({
        ...record,
        exercise: exercisesData.find(ex => ex.id === record.exerciseId)
      }));

      setWorkoutRecords(enrichedRecords);
      setExercises(exercisesData);
    } catch (error: any) {
      showNotification(error.message || 'Error al cargar los datos del dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

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
        prevRecords.filter(record => record.id !== recordId)
      );

      // Mostrar notificación de éxito
      const exerciseName = recordToDelete?.exercise?.name || 'Ejercicio';
      showNotification(`Entrenamiento de ${exerciseName} eliminado exitosamente`, 'success');

    } catch (error: any) {
      console.error('Error eliminando entrenamiento:', error);
      showNotification(error.message || 'Error al eliminar el entrenamiento', 'error');
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, [isOnline]);

  return {
    workoutRecords,
    exercises,
    loading,
    isOnline,
    loadData,
    handleDeleteRecord
  };
}; 