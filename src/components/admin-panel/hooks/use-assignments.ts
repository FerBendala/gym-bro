import { createExerciseAssignment, deleteExerciseAssignment, getAssignmentsByDay } from '@/api/services';
import type { DayOfWeek, Exercise, ExerciseAssignment } from '@/interfaces';
import { useNotification } from '@/stores/notification';
import { useCallback, useState } from 'react';
import { DataChangeEventDetail } from '../types';

// Evento personalizado para notificar cambios en datos
const DATA_CHANGE_EVENT = 'followgym-data-change';

/**
 * Emite un evento personalizado para notificar cambios en datos
 * @param type Tipo de dato que cambió
 * @param data Datos adicionales del cambio
 */
const emitDataChange = (type: 'assignments', data?: ExerciseAssignment | { deleted: string }) => {
  const eventDetail: DataChangeEventDetail = {
    type,
    data,
    timestamp: Date.now()
  };

  window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT, {
    detail: eventDetail
  }));
};

/**
 * Hook para manejar las asignaciones de ejercicios
 * @param selectedDay Día de la semana seleccionado
 * @param exercises Lista de ejercicios disponibles
 * @param isOnline Indica si hay conexión a internet
 * @returns Un objeto con las asignaciones de ejercicios
 */
export const useAssignments = (selectedDay: DayOfWeek, exercises: Exercise[], isOnline: boolean) => {
  const { showNotification } = useNotification();
  const [assignments, setAssignments] = useState<ExerciseAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAssignments = useCallback(async () => {
    if (!isOnline) return;

    // Validar que selectedDay sea válido antes de hacer la consulta
    if (!selectedDay) {
      console.warn('⚠️ selectedDay es undefined en useAssignments, saltando carga');
      return;
    }

    try {
      const assignmentsData = await getAssignmentsByDay(selectedDay);
      const assignmentsWithExercises: ExerciseAssignment[] = assignmentsData.map((assignment: ExerciseAssignment) => ({
        ...assignment,
        exercise: exercises.find((exercise: Exercise) => exercise.id === assignment.exerciseId)
      }));
      setAssignments(assignmentsWithExercises);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al cargar las asignaciones';
      showNotification(message, 'error');
    }
  }, [selectedDay, exercises, isOnline, showNotification]);

  const handleCreateAssignment = async (exerciseId: string, dayOfWeek: DayOfWeek): Promise<boolean> => {
    if (!isOnline) {
      showNotification('Sin conexión. No se puede asignar el ejercicio.', 'error');
      return false;
    }

    setLoading(true);
    try {
      const exercise = exercises.find((ex: Exercise) => ex.id === exerciseId);
      const newAssignmentId = await createExerciseAssignment({
        exerciseId,
        dayOfWeek
      });

      // Crear el objeto ExerciseAssignment completo
      const newAssignment: ExerciseAssignment = {
        id: newAssignmentId,
        exerciseId,
        dayOfWeek,
        exercise
      };

      showNotification(
        `"${exercise?.name}" asignado al ${dayOfWeek}`,
        'success'
      );

      // Notificar cambio a otros componentes
      emitDataChange('assignments', newAssignment);

      await loadAssignments();
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al asignar el ejercicio';
      showNotification(message, 'error');
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al eliminar la asignación';
      showNotification(message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    assignments,
    loading,
    loadAssignments,
    handleCreateAssignment,
    handleDeleteAssignment
  };
}; 