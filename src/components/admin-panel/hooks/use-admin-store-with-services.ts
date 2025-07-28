import {
  createExercise,
  createExerciseAssignment,
  deleteExercise,
  deleteExerciseAssignment,
  getAssignmentsByDay,
  getExercises,
  updateExercise
} from '@/api/services';
import type { ExerciseFormData } from '@/components/admin-panel/types';
import type { DayOfWeek, Exercise, ExerciseAssignment } from '@/interfaces';
import { useAdminStore } from '@/stores/admin';
import { useOnlineStatus } from '@/stores/connection';
import { useNotification } from '@/stores/notification';
import { useCallback, useEffect } from 'react';

/**
 * Hook personalizado que integra Zustand con los servicios existentes
 * Mantiene la compatibilidad con el código actual mientras usa Zustand
 */
export const useAdminStoreWithServices = () => {
  const isOnline = useOnlineStatus();
  const { showNotification } = useNotification();

  const {
    // Estado
    exercises,
    assignments,
    loading,
    errors,
    adminPanel: { selectedDay },

    // Acciones de UI
    openPanel,
    closePanel,
    setTab,
    setSelectedDay,
    setEditingExercise,
    setPreviewUrl,

    // Acciones de carga
    setLoading: setLoadingState,
    setError: setErrorState,

    // Acciones de datos
    setExercises,
    setAssignments,

    // Acciones auxiliares
    addExercise,
    updateExerciseInStore,
    removeExerciseFromStore,
    addAssignment,
    removeAssignmentFromStore,

    // Utilidades
    getFilteredExercises,
    getAssignmentsByDay: getAssignmentsByDayFromStore,
    resetState
  } = useAdminStore();

  // Cargar ejercicios
  const loadExercises = useCallback(async () => {
    if (!isOnline) {
      showNotification('Sin conexión. Los datos pueden estar desactualizados.', 'warning');
      return;
    }

    setLoadingState('exercises', true);
    setErrorState('exercises', null);

    try {
      const exercisesData = await getExercises();
      setExercises(exercisesData);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al cargar los ejercicios';
      setErrorState('exercises', message);
      showNotification(message, 'error');
    } finally {
      setLoadingState('exercises', false);
    }
  }, [isOnline, showNotification, setExercises, setLoadingState, setErrorState]);

  // Cargar asignaciones
  const loadAssignments = useCallback(async (day?: DayOfWeek) => {
    if (!isOnline) return;

    setLoadingState('assignments', true);
    setErrorState('assignments', null);

    try {
      const targetDay = day || selectedDay;
      if (!targetDay) {
        console.warn('⚠️ No hay día seleccionado para cargar asignaciones');
        return;
      }

      const assignmentsData = await getAssignmentsByDay(targetDay);

      // Enriquecer con datos de ejercicios
      const assignmentsWithExercises: ExerciseAssignment[] = assignmentsData.map((assignment) => ({
        ...assignment,
        exercise: exercises.find((exercise: Exercise) => exercise.id === assignment.exerciseId)
      }));

      setAssignments(assignmentsWithExercises);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al cargar las asignaciones';
      setErrorState('assignments', message);
      showNotification(message, 'error');
    } finally {
      setLoadingState('assignments', false);
    }
  }, [isOnline, showNotification, selectedDay, exercises, setAssignments, setLoadingState, setErrorState]);

  // Crear ejercicio
  const handleCreateExercise = useCallback(async (data: ExerciseFormData): Promise<boolean> => {
    if (!isOnline) {
      showNotification('Sin conexión. No se puede crear el ejercicio.', 'error');
      return false;
    }

    setLoadingState('creating', true);
    setErrorState('exercises', null);

    try {
      const exerciseData = {
        name: data.name,
        categories: data.categories,
        description: data.description || undefined,
        url: data.url || undefined
      };

      const newExerciseId = await createExercise(exerciseData);

      // Crear el objeto Exercise completo para agregar al store
      const newExercise: Exercise = {
        id: newExerciseId,
        name: data.name,
        categories: data.categories,
        description: data.description,
        url: data.url
      };

      addExercise(newExercise);

      showNotification(`Ejercicio "${data.name}" creado exitosamente`, 'success');
      await loadExercises(); // Recargar para sincronizar

      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al crear el ejercicio';
      setErrorState('exercises', message);
      showNotification(message, 'error');
      return false;
    } finally {
      setLoadingState('creating', false);
    }
  }, [isOnline, showNotification, addExercise, loadExercises, setLoadingState, setErrorState]);

  // Actualizar ejercicio
  const handleUpdateExercise = useCallback(async (exerciseId: string, data: ExerciseFormData): Promise<boolean> => {
    if (!isOnline) {
      showNotification('Sin conexión. No se puede actualizar el ejercicio.', 'error');
      return false;
    }

    setLoadingState('updating', true);
    setErrorState('exercises', null);

    try {
      const exerciseData = {
        name: data.name,
        categories: data.categories,
        description: data.description || undefined,
        url: data.url || undefined
      };

      await updateExercise(exerciseId, exerciseData);
      updateExerciseInStore(exerciseId, exerciseData);

      showNotification(`Ejercicio "${data.name}" actualizado exitosamente`, 'success');
      await loadExercises(); // Recargar para sincronizar

      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al actualizar el ejercicio';
      setErrorState('exercises', message);
      showNotification(message, 'error');
      return false;
    } finally {
      setLoadingState('updating', false);
    }
  }, [isOnline, showNotification, updateExerciseInStore, loadExercises, setLoadingState, setErrorState]);

  // Eliminar ejercicio
  const handleDeleteExercise = useCallback(async (exerciseId: string): Promise<boolean> => {
    if (!isOnline) {
      showNotification('Sin conexión. No se puede eliminar el ejercicio.', 'error');
      return false;
    }

    setLoadingState('deleting', true);
    setErrorState('exercises', null);

    try {
      const exercise = exercises.find(ex => ex.id === exerciseId);
      await deleteExercise(exerciseId);
      removeExerciseFromStore(exerciseId);

      showNotification(`Ejercicio "${exercise?.name}" eliminado exitosamente`, 'success');
      await loadExercises(); // Recargar para sincronizar

      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al eliminar el ejercicio';
      setErrorState('exercises', message);
      showNotification(message, 'error');
      return false;
    } finally {
      setLoadingState('deleting', false);
    }
  }, [isOnline, showNotification, exercises, removeExerciseFromStore, loadExercises, setLoadingState, setErrorState]);

  // Crear asignación
  const handleCreateAssignment = useCallback(async (exerciseId: string, dayOfWeek: DayOfWeek): Promise<boolean> => {
    if (!isOnline) {
      showNotification('Sin conexión. No se puede asignar el ejercicio.', 'error');
      return false;
    }

    setLoadingState('creating', true);
    setErrorState('assignments', null);

    try {
      const exercise = exercises.find(ex => ex.id === exerciseId);
      const newAssignmentId = await createExerciseAssignment({
        exerciseId,
        dayOfWeek
      });

      // Crear el objeto ExerciseAssignment completo para agregar al store
      const assignmentWithExercise: ExerciseAssignment = {
        id: newAssignmentId,
        exerciseId,
        dayOfWeek,
        exercise
      };

      addAssignment(assignmentWithExercise);

      showNotification(`"${exercise?.name}" asignado al ${dayOfWeek}`, 'success');
      await loadAssignments(dayOfWeek); // Recargar para sincronizar

      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al asignar el ejercicio';
      setErrorState('assignments', message);
      showNotification(message, 'error');
      return false;
    } finally {
      setLoadingState('creating', false);
    }
  }, [isOnline, showNotification, exercises, addAssignment, loadAssignments, setLoadingState, setErrorState]);

  // Eliminar asignación
  const handleDeleteAssignment = useCallback(async (assignmentId: string): Promise<boolean> => {
    if (!isOnline) {
      showNotification('Sin conexión. No se puede eliminar la asignación.', 'error');
      return false;
    }

    setLoadingState('deleting', true);
    setErrorState('assignments', null);

    try {
      await deleteExerciseAssignment(assignmentId);
      removeAssignmentFromStore(assignmentId);

      showNotification('Asignación eliminada exitosamente', 'success');
      await loadAssignments(); // Recargar para sincronizar

      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al eliminar la asignación';
      setErrorState('assignments', message);
      showNotification(message, 'error');
      return false;
    } finally {
      setLoadingState('deleting', false);
    }
  }, [isOnline, showNotification, removeAssignmentFromStore, loadAssignments, setLoadingState, setErrorState]);

  // Cargar datos iniciales
  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  useEffect(() => {
    if (selectedDay) {
      loadAssignments();
    }
  }, [selectedDay, loadAssignments]);

  return {
    // Estado
    exercises,
    assignments,
    loading,
    errors,

    // Acciones de UI
    openPanel,
    closePanel,
    setTab,
    setSelectedDay,
    setEditingExercise,
    setPreviewUrl,

    // Acciones de datos
    loadExercises,
    loadAssignments,
    handleCreateExercise,
    handleUpdateExercise,
    handleDeleteExercise,
    handleCreateAssignment,
    handleDeleteAssignment,

    // Utilidades
    getFilteredExercises,
    getAssignmentsByDay: getAssignmentsByDayFromStore,
    resetState
  };
}; 