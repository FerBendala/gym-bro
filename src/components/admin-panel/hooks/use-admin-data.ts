import type { DayOfWeek } from '@/interfaces';
import { useEffect } from 'react';
import { useAssignments } from './use-assignments';
import { useExercises } from './use-exercises';

/**
 * Hook para cargar datos del administrador
 * @param selectedDay D a de la semana seleccionado
 * @param isOnline Indica si hay conexi n a internet
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

  const loadData = async () => {
    await loadExercises();
    await loadAssignments();
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
    loading: exercisesLoading || assignmentsLoading,
    handleCreateExercise,
    handleUpdateExercise,
    handleDeleteExercise,
    handleCreateAssignment,
    handleDeleteAssignment,
    loadData
  };
}; 