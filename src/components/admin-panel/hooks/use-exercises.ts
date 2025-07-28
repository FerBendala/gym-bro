import {
  createExercise,
  deleteExercise,
  getExercises,
  updateExercise
} from '@/api/services';
import type { Exercise } from '@/interfaces';
import { useNotification } from '@/stores/notification';
import { useCallback, useState } from 'react';
import type { ExerciseDataChangeEventDetail, ExerciseFormData } from '../types';

// Evento personalizado para notificar cambios en datos
const DATA_CHANGE_EVENT = 'followgym-data-change';

/**
 * Emite un evento personalizado para notificar cambios en datos
 * @param type Tipo de dato que cambió
 * @param data Datos adicionales del cambio
 */
const emitDataChange = (type: 'exercises', data?: Exercise | Partial<Exercise> | { deleted: string }) => {
  const eventDetail: ExerciseDataChangeEventDetail = {
    type,
    data,
    timestamp: Date.now()
  };

  window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT, {
    detail: eventDetail
  }));
};

/**
 * Hook para manejar los ejercicios
 * @param isOnline Indica si hay conexión a internet
 * @returns Un objeto con los ejercicios
 */
export const useExercises = (isOnline: boolean) => {
  const { showNotification } = useNotification();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  const loadExercises = useCallback(async () => {
    if (!isOnline) {
      showNotification('Sin conexión. Los datos pueden estar desactualizados.', 'warning');
      return;
    }

    try {
      const exercisesData = await getExercises();
      setExercises(exercisesData);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al cargar los ejercicios';
      showNotification(message, 'error');
    }
  }, [isOnline, showNotification]);

  const handleCreateExercise = async (data: ExerciseFormData): Promise<boolean> => {
    if (!isOnline) {
      showNotification('Sin conexión. No se puede crear el ejercicio.', 'error');
      return false;
    }

    setLoading(true);
    try {
      const exerciseData = {
        name: data.name,
        categories: data.categories,
        description: data.description || undefined,
        url: data.url || undefined
      };

      const newExerciseId = await createExercise(exerciseData);

      // Crear el objeto Exercise completo para el evento
      const newExercise: Exercise = {
        id: newExerciseId,
        name: data.name,
        categories: data.categories,
        description: data.description,
        url: data.url
      };

      showNotification(`Ejercicio "${data.name}" creado exitosamente`, 'success');

      // Notificar cambio a otros componentes
      emitDataChange('exercises', newExercise);

      await loadExercises();
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al crear el ejercicio';
      showNotification(message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExercise = async (exerciseId: string, data: ExerciseFormData): Promise<boolean> => {
    if (!isOnline) {
      showNotification('Sin conexión. No se puede actualizar el ejercicio.', 'error');
      return false;
    }

    setLoading(true);
    try {
      const exerciseData = {
        name: data.name,
        categories: data.categories,
        description: data.description || undefined,
        url: data.url || undefined
      };

      await updateExercise(exerciseId, exerciseData);
      showNotification(`Ejercicio "${data.name}" actualizado exitosamente`, 'success');

      // Notificar cambio a otros componentes
      emitDataChange('exercises', { id: exerciseId, ...exerciseData });

      await loadExercises();
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al actualizar el ejercicio';
      showNotification(message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExercise = async (exerciseId: string): Promise<boolean> => {
    if (!isOnline) {
      showNotification('Sin conexión. No se puede eliminar el ejercicio.', 'error');
      return false;
    }

    setLoading(true);
    try {
      const exercise = exercises.find((ex: Exercise) => ex.id === exerciseId);
      await deleteExercise(exerciseId);
      showNotification(`Ejercicio "${exercise?.name}" eliminado exitosamente`, 'success');

      // Notificar cambio a otros componentes
      emitDataChange('exercises', { deleted: exerciseId });

      await loadExercises();
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al eliminar el ejercicio';
      showNotification(message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    exercises,
    loading,
    loadExercises,
    handleCreateExercise,
    handleUpdateExercise,
    handleDeleteExercise
  };
}; 