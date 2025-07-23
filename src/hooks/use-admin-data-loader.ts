import {
  getAssignmentsByDay,
  getExercises
} from '@/api/services';
import { useAdminStore } from '@/stores/admin-store';
import { useNotification } from '@/stores/notification-store';
import { useCallback, useEffect } from 'react';
import { useOnlineStatus } from './use-online-status';

/**
 * Hook para cargar datos iniciales del admin panel
 * Usa Zustand para manejar el estado global
 */
export const useAdminDataLoader = () => {
  const isOnline = useOnlineStatus();
  const { showNotification } = useNotification();

  const {
    selectedDay,
    setExercises,
    setAssignments,
    setLoading,
    setError
  } = useAdminStore();

  // Cargar ejercicios
  const loadExercises = useCallback(async () => {
    if (!isOnline) {
      showNotification('Sin conexión. Los datos pueden estar desactualizados.', 'warning');
      return;
    }

    setLoading('exercises', true);
    setError('exercises', null);

    try {
      const exercisesData = await getExercises();
      setExercises(exercisesData);
    } catch (error: any) {
      const message = error.message || 'Error al cargar los ejercicios';
      setError('exercises', message);
      showNotification(message, 'error');
    } finally {
      setLoading('exercises', false);
    }
  }, [isOnline, showNotification, setExercises, setLoading, setError]);

  // Cargar asignaciones
  const loadAssignments = useCallback(async () => {
    if (!isOnline) return;

    setLoading('assignments', true);
    setError('assignments', null);

    try {
      const assignmentsData = await getAssignmentsByDay(selectedDay);

      // Enriquecer con datos de ejercicios
      const exercises = useAdminStore.getState().exercises;
      const assignmentsWithExercises = assignmentsData.map((assignment) => ({
        ...assignment,
        exercise: exercises.find(ex => ex.id === assignment.exerciseId)
      }));

      setAssignments(assignmentsWithExercises);
    } catch (error: any) {
      const message = error.message || 'Error al cargar las asignaciones';
      setError('assignments', message);
      showNotification(message, 'error');
    } finally {
      setLoading('assignments', false);
    }
  }, [isOnline, selectedDay, showNotification, setAssignments, setLoading, setError]);

  // Cargar datos iniciales
  useEffect(() => {
    loadExercises();
  }, [isOnline]);

  useEffect(() => {
    loadAssignments();
  }, [isOnline, selectedDay]);

  return {
    loadExercises,
    loadAssignments
  };
}; 