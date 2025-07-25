import {
  getAssignmentsByDay,
  getExercises
} from '@/api/services';
import type { Exercise, ExerciseAssignment } from '@/interfaces';
import { useAdminStore } from '@/stores/admin';
import { useOnlineStatus } from '@/stores/connection';
import { useNotification } from '@/stores/notification';
import { useCallback, useEffect } from 'react';

/**
 * Hook para cargar datos iniciales del admin panel
 * Usa Zustand para manejar el estado global
 */
export const useAdminDataLoader = () => {
  const isOnline = useOnlineStatus();
  const { showNotification } = useNotification();

  const {
    adminPanel: { selectedDay },
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
    } catch (error: unknown) {
      console.error('❌ loadExercises - Error:', error);
      const message = error instanceof Error ? error.message : 'Error al cargar los ejercicios';
      setError('exercises', message);
      showNotification(message, 'error');
    } finally {
      setLoading('exercises', false);
    }
  }, [isOnline, showNotification, setExercises, setLoading, setError]);

  // Cargar asignaciones
  const loadAssignments = useCallback(async () => {
    if (!isOnline) return;

    // Validar que selectedDay sea válido antes de hacer la consulta
    if (!selectedDay) {
      console.warn('⚠️ selectedDay es undefined, saltando carga de asignaciones');
      return;
    }

    // Validación adicional: asegurar que selectedDay sea un día válido
    const validDays = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'] as const;
    if (!validDays.includes(selectedDay as typeof validDays[number])) {
      console.warn('⚠️ selectedDay no es un día válido:', selectedDay);
      return;
    }

    setLoading('assignments', true);
    setError('assignments', null);

    try {
      const assignmentsData = await getAssignmentsByDay(selectedDay);

      // Enriquecer con datos de ejercicios
      const exercises = useAdminStore.getState().exercises;
      const assignmentsWithExercises: ExerciseAssignment[] = assignmentsData.map((assignment) => ({
        ...assignment,
        exercise: exercises.find((exercise: Exercise) => exercise.id === assignment.exerciseId)
      }));

      setAssignments(assignmentsWithExercises);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al cargar las asignaciones';
      setError('assignments', message);
      showNotification(message, 'error');
    } finally {
      setLoading('assignments', false);
    }
  }, [isOnline, selectedDay, showNotification, setAssignments, setLoading, setError]);

  // Cargar datos iniciales
  useEffect(() => {
    loadExercises();
  }, [isOnline, loadExercises]);

  useEffect(() => {
    // Solo cargar asignaciones si el store está listo y selectedDay está definido
    if (selectedDay) {
      loadAssignments();
    }
  }, [isOnline, selectedDay, loadAssignments]);

  return {
    loadExercises,
    loadAssignments
  };
}; 