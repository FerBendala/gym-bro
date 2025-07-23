import { createExerciseAssignment, deleteExerciseAssignment, getAssignmentsByDay } from '@/api/services';
import type { DayOfWeek, Exercise, ExerciseAssignment } from '@/interfaces';
import { useNotification } from '@/stores/notification-store';
import { useCallback, useState } from 'react';

// Evento personalizado para notificar cambios en datos
const DATA_CHANGE_EVENT = 'followgym-data-change';

/**
 * Emite un evento personalizado para notificar cambios en datos
 * @param type Tipo de dato que cambi
 * @param data Datos adicionales del cambio
 */
const emitDataChange = (type: 'assignments', data?: any) => {
  window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT, {
    detail: { type, data, timestamp: Date.now() }
  }));
};

/**
 * Hook para manejar las asignaciones de ejercicios
 * @param selectedDay D a de la semana seleccionado
 * @param exercises Lista de ejercicios disponibles
 * @param isOnline Indica si hay conexi n a internet
 * @returns Un objeto con las asignaciones de ejercicios
 */
export const useAssignments = (selectedDay: DayOfWeek, exercises: Exercise[], isOnline: boolean) => {
  const { showNotification } = useNotification();
  const [assignments, setAssignments] = useState<ExerciseAssignment[]>([]);
  const [loading, setLoading] = useState(false);

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

  return {
    assignments,
    loading,
    loadAssignments,
    handleCreateAssignment,
    handleDeleteAssignment
  };
}; 