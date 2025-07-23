import {
  getAssignmentsByDay,
  getExercises
} from '@/api/services';
import { useAdminStore } from '@/stores/admin';
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
    adminPanel: { selectedDay },
    setExercises,
    setAssignments,
    setLoading,
    setError
  } = useAdminStore();

  // Verificar si el store está completamente inicializado
  const validDays = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const isStoreReady = selectedDay !== undefined && selectedDay !== null && validDays.includes(selectedDay);



  // Cargar ejercicios
  const loadExercises = useCallback(async () => {
    console.log('📡 loadExercises - Iniciando carga:', { isOnline });

    if (!isOnline) {
      console.log('📡 loadExercises - Sin conexión, saltando carga');
      showNotification('Sin conexión. Los datos pueden estar desactualizados.', 'warning');
      return;
    }

    setLoading('exercises', true);
    setError('exercises', null);

    try {
      console.log('📡 loadExercises - Llamando a getExercises()');
      const exercisesData = await getExercises();
      console.log('📡 loadExercises - Datos recibidos:', exercisesData);
      console.log('📡 loadExercises - Tipo de datos:', typeof exercisesData, Array.isArray(exercisesData));
      console.log('📡 loadExercises - Longitud:', exercisesData?.length);
      setExercises(exercisesData);
      console.log('📡 loadExercises - setExercises llamado');
    } catch (error: any) {
      console.error('📡 loadExercises - Error:', error);
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

    // Validar que selectedDay sea válido antes de hacer la consulta
    if (!selectedDay) {
      console.warn('⚠️ selectedDay es undefined, saltando carga de asignaciones');
      return;
    }

    // Validación adicional: asegurar que selectedDay sea un día válido
    const validDays = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    if (!validDays.includes(selectedDay)) {
      console.warn('⚠️ selectedDay no es un día válido:', selectedDay);
      return;
    }



    setLoading('assignments', true);
    setError('assignments', null);

    try {
      const assignmentsData = await getAssignmentsByDay(selectedDay);

      // Enriquecer con datos de ejercicios
      const exercises = useAdminStore.getState().exercises;
      const assignmentsWithExercises = assignmentsData.map((assignment) => ({
        ...assignment,
        exercise: exercises.find((ex: any) => ex.id === assignment.exerciseId)
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
    console.log('🔄 useAdminDataLoader - Cargando ejercicios:', { isOnline, isStoreReady, selectedDay });
    loadExercises();
  }, [isOnline, loadExercises]);

  useEffect(() => {
    // Solo cargar asignaciones si el store está listo y selectedDay está definido
    console.log('🔄 useAdminDataLoader - Cargando asignaciones:', { isOnline, isStoreReady, selectedDay });
    if (selectedDay) {
      loadAssignments();
    }
  }, [isOnline, selectedDay, loadAssignments]);

  return {
    loadExercises,
    loadAssignments
  };
}; 