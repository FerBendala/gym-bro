import type { DayOfWeek } from '@/interfaces';
import { useCallback, useEffect } from 'react';
import { useAssignments } from './use-assignments';
import { useExercises } from './use-exercises';

/**
 * Hook para cargar datos del administrador
 * @param selectedDay Día de la semana seleccionado
 * @param isOnline Indica si hay conexión a internet
 * @returns Un objeto con los datos del administrador
 */
export const useAdminData = (selectedDay: DayOfWeek, isOnline: boolean) => {
  const {
    exercises,
    loading: exercisesLoading,
    loadExercises,
    handleCreateExercise,
    handleUpdateExercise,
    handleDeleteExercise
  } = useExercises(isOnline);

  const {
    assignments,
    loading: assignmentsLoading,
    loadAssignments,
    handleCreateAssignment,
    handleDeleteAssignment
  } = useAssignments(selectedDay, exercises, isOnline);

  const loadData = useCallback(async () => {
    await loadExercises();
    await loadAssignments();
  }, [loadExercises, loadAssignments]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadAssignments();
  }, [selectedDay, exercises, loadAssignments]);

  return {
    exercises,
    assignments,
    loading: exercisesLoading || assignmentsLoading,
    handleCreateExercise,
    handleUpdateExercise,
    handleDeleteExercise,
    handleCreateAssignment,
    handleDeleteAssignment,
    loadData
  };
}; 