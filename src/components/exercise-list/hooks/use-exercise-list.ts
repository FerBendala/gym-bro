import { createWorkoutRecord, getAssignmentsByDay, getExercises, getWorkoutRecords, updateAssignmentsOrder } from '@/api/services';
import { useNotification } from '@/context/notification-context';
import { useOnlineStatus } from '@/hooks';
import type { DayOfWeek, ExerciseAssignment, WorkoutFormData, WorkoutFormDataAdvanced, WorkoutRecord } from '@/interfaces';
import { getExercisesTrainedTodayForCurrentDay } from '@/utils/functions/date-filters';
import { useEffect, useState } from 'react';
import type { UseExerciseListReturn } from '../types';

// Evento personalizado para escuchar cambios de datos
const DATA_CHANGE_EVENT = 'followgym-data-change';

/**
 * Hook específico para manejar la lógica del ExerciseList
 * Gestiona la carga de assignments y el registro de workouts
 */
export const useExerciseList = (dayOfWeek: DayOfWeek): UseExerciseListReturn => {
  const { showNotification } = useNotification();
  const isOnline = useOnlineStatus();
  const [assignments, setAssignments] = useState<ExerciseAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [exercisesTrainedToday, setExercisesTrainedToday] = useState<string[]>([]);
  const [workoutRecords, setWorkoutRecords] = useState<WorkoutRecord[]>([]);

  const loadAssignments = async () => {
    if (!isOnline) {
      showNotification('Sin conexión. Los datos pueden estar desactualizados.', 'warning');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [assignmentsData, exercisesData, workoutRecords] = await Promise.all([
        getAssignmentsByDay(dayOfWeek),
        getExercises(),
        getWorkoutRecords()
      ]);

      const assignmentsWithExercises = assignmentsData.map(assignment => ({
        ...assignment,
        exercise: exercisesData.find(ex => ex.id === assignment.exerciseId)
      }));

      setAssignments(assignmentsWithExercises);
      setWorkoutRecords(workoutRecords);

      // Determinar qué ejercicios se entrenaron hoy Y están en el tab correcto
      const trainedToday = getExercisesTrainedTodayForCurrentDay(workoutRecords, dayOfWeek);
      setExercisesTrainedToday(trainedToday);
    } catch (error: any) {
      showNotification(error.message || 'Error al cargar los ejercicios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordWorkout = async (assignmentId: string, data: WorkoutFormData | WorkoutFormDataAdvanced) => {
    if (!isOnline) {
      showNotification('Sin conexión. No se puede registrar el entrenamiento.', 'error');
      throw new Error('Sin conexión');
    }

    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) {
      showNotification('Ejercicio no encontrado', 'error');
      throw new Error('Ejercicio no encontrado');
    }

    try {
      // Verificar si es modo avanzado (series individuales)
      if ('sets' in data && Array.isArray(data.sets)) {
        // Modo avanzado: calcular valores agregados
        const sets = data.sets;
        const totalSets = sets.length;
        const totalReps = sets.reduce((sum, set) => sum + set.reps, 0);
        const averageReps = Math.round(totalReps / totalSets);
        const averageWeight = sets.reduce((sum, set) => sum + set.weight, 0) / totalSets;

        const workoutData = {
          exerciseId: assignment.exerciseId,
          weight: averageWeight,
          reps: averageReps,
          sets: totalSets,
          dayOfWeek,
          individualSets: sets
        };

        await createWorkoutRecord(workoutData, data.date);

        // Mensaje personalizado para modo avanzado
        const seriesText = sets.map((set, i) => `Serie ${i + 1}: ${set.weight}kg x ${set.reps}`).join(', ');
        showNotification(
          `Entrenamiento registrado: ${totalSets} series - ${seriesText}`,
          'success'
        );
      } else {
        // Modo simple: usar datos directamente (type guard)
        const simpleData = data as WorkoutFormData;
        const workoutData = {
          exerciseId: assignment.exerciseId,
          weight: simpleData.weight,
          reps: simpleData.reps,
          sets: simpleData.sets,
          dayOfWeek
        };

        await createWorkoutRecord(workoutData, simpleData.date);

        showNotification(
          `Entrenamiento registrado: ${simpleData.sets} series de ${simpleData.reps} reps con ${simpleData.weight}kg`,
          'success'
        );
      }

      // Recargar datos para actualizar el estado de "entrenado hoy"
      await loadAssignments();
    } catch (error: any) {
      showNotification(error.message || 'Error al registrar el entrenamiento', 'error');
      throw error;
    }
  };

  const handleReorderAssignments = async (reorderedAssignments: ExerciseAssignment[]) => {
    if (!isOnline) {
      showNotification('Sin conexión. No se puede reordenar los ejercicios.', 'error');
      return;
    }

    try {
      // Actualizar el estado local inmediatamente para UX fluida
      setAssignments(reorderedAssignments);

      // Actualizar en la base de datos
      await updateAssignmentsOrder(reorderedAssignments);

      showNotification('Orden de ejercicios actualizado', 'success');
    } catch (error: any) {
      // Si hay error, recargar los datos para revertir cambios
      showNotification(error.message || 'Error al reordenar ejercicios', 'error');
      await loadAssignments();
    }
  };

  // Cargar assignments cuando cambie el día o el estado de conexión
  useEffect(() => {
    loadAssignments();
  }, [dayOfWeek, isOnline]);

  // Escuchar cambios de datos del AdminPanel
  useEffect(() => {
    const handleDataChange = (event: CustomEvent) => {
      const { type, data } = event.detail;

      // Solo recargar si es relevante para este componente
      if (type === 'exercises' || type === 'assignments') {
        // Recargar datos para mantener sincronización
        loadAssignments();

        // Mostrar notificación visual del cambio
        if (type === 'exercises') {
          if (data?.deleted) {
            showNotification('Lista de ejercicios actualizada', 'info');
          } else {
            showNotification('Ejercicios actualizados', 'info');
          }
        } else if (type === 'assignments') {
          showNotification('Asignaciones actualizadas', 'info');
        }
      }
    };

    // Añadir el listener con el tipo correcto
    const listener = handleDataChange as EventListener;
    window.addEventListener(DATA_CHANGE_EVENT, listener);

    // Cleanup al desmontar
    return () => {
      window.removeEventListener(DATA_CHANGE_EVENT, listener);
    };
  }, [showNotification]); // loadAssignments se define arriba y cambia con dayOfWeek/isOnline

  return {
    assignments,
    loading,
    handleRecordWorkout,
    loadAssignments,
    handleReorderAssignments,
    exercisesTrainedToday,
    workoutRecords
  };
}; 