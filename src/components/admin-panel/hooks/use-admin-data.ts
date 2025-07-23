import {
  createExercise,
  createExerciseAssignment,
  deleteExercise,
  deleteExerciseAssignment,
  getAssignmentsByDay,
  getExercises,
  updateExercise
} from '@/api/services';
import { useNotification } from '@/context/notification-context';
import type { DayOfWeek, Exercise, ExerciseAssignment } from '@/interfaces';
import { useCallback, useEffect, useState } from 'react';
import type { ExerciseFormData } from '../types';

// Evento personalizado para notificar cambios en datos
const DATA_CHANGE_EVENT = 'followgym-data-change';

const emitDataChange = (type: 'exercises' | 'assignments', data?: any) => {
  window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT, {
    detail: { type, data, timestamp: Date.now() }
  }));
};

export const useAdminData = (selectedDay: DayOfWeek, isOnline: boolean) => {
  const { showNotification } = useNotification();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [assignments, setAssignments] = useState<ExerciseAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  const loadExercises = useCallback(async () => {
    if (!isOnline) {
      showNotification('Sin conexión. Los datos pueden estar desactualizados.', 'warning');
      return;
    }

    try {
      const exercisesData = await getExercises();
      setExercises(exercisesData);
    } catch (error: any) {
      showNotification(error.message || 'Error al cargar los ejercicios', 'error');
    }
  }, [isOnline, showNotification]);

  const loadAssignments = useCallback(async () => {
    if (!isOnline) return;

    try {
      const assignmentsData = await getAssignmentsByDay(selectedDay);
      const assignmentsWithExercises = assignmentsData.map((assignment: ExerciseAssignment) => ({
        ...assignment,
        exercise: exercises.find(ex => ex.id === assignment.exerciseId)
      }));
      setAssignments(assignmentsWithExercises);
    } catch (error: any) {
      showNotification(error.message || 'Error al cargar las asignaciones', 'error');
    }
  }, [selectedDay, exercises, isOnline, showNotification]);

  const loadData = useCallback(async () => {
    await loadExercises();
    await loadAssignments();
  }, [loadExercises, loadAssignments]);

  // Exercise CRUD operations
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

      const newExercise = await createExercise(exerciseData);
      showNotification(`Ejercicio "${data.name}" creado exitosamente`, 'success');

      // Notificar cambio a otros componentes
      emitDataChange('exercises', newExercise);

      await loadData();
      return true;
    } catch (error: any) {
      showNotification(error.message || 'Error al crear el ejercicio', 'error');
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

      await loadData();
      return true;
    } catch (error: any) {
      showNotification(error.message || 'Error al actualizar el ejercicio', 'error');
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
      const exercise = exercises.find(ex => ex.id === exerciseId);
      await deleteExercise(exerciseId);
      showNotification(`Ejercicio "${exercise?.name}" eliminado exitosamente`, 'success');

      // Notificar cambio a otros componentes
      emitDataChange('exercises', { deleted: exerciseId });

      await loadData();
      return true;
    } catch (error: any) {
      showNotification(error.message || 'Error al eliminar el ejercicio', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Assignment CRUD operations
  const handleCreateAssignment = async (exerciseId: string, dayOfWeek: DayOfWeek): Promise<boolean> => {
    if (!isOnline) {
      showNotification('Sin conexión. No se puede asignar el ejercicio.', 'error');
      return false;
    }

    setLoading(true);
    try {
      const exercise = exercises.find(ex => ex.id === exerciseId);
      const newAssignment = await createExerciseAssignment({
        exerciseId,
        dayOfWeek
      });

      showNotification(
        `"${exercise?.name}" asignado al ${dayOfWeek}`,
        'success'
      );

      // Notificar cambio a otros componentes
      emitDataChange('assignments', newAssignment);

      await loadAssignments();
      return true;
    } catch (error: any) {
      showNotification(error.message || 'Error al asignar el ejercicio', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string): Promise<boolean> => {
    if (!isOnline) {
      showNotification('Sin conexión. No se puede eliminar la asignación.', 'error');
      return false;
    }

    setLoading(true);
    try {
      await deleteExerciseAssignment(assignmentId);
      showNotification('Asignación eliminada exitosamente', 'success');

      // Notificar cambio a otros componentes
      emitDataChange('assignments', { deleted: assignmentId });

      await loadAssignments();
      return true;
    } catch (error: any) {
      showNotification(error.message || 'Error al eliminar la asignación', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isOnline]);

  useEffect(() => {
    loadAssignments();
  }, [selectedDay, exercises]);

  return {
    exercises,
    assignments,
    loading,
    handleCreateExercise,
    handleUpdateExercise,
    handleDeleteExercise,
    handleCreateAssignment,
    handleDeleteAssignment,
    loadData
  };
}; 