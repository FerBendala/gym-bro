import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Exercise, WorkoutFormData, WorkoutFormDataAdvanced, WorkoutRecord } from '../../../interfaces';
import type { ExerciseCardProps, UseExerciseCardReturn } from '../types';

/**
 * Hook específico para manejar el estado y lógica del ExerciseCard
 * Centraliza el manejo del formulario, estados de carga y UI
 * Soporta tanto modo simple como avanzado con series individuales
 */
export const useExerciseCard = (
  exerciseId?: string,
  exerciseObj?: Exercise,
  workoutRecords?: WorkoutRecord[]
): UseExerciseCardReturn & { lastRecord: WorkoutRecord | null, lastWorkoutSeries: WorkoutRecord[], loadingLast: boolean } => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [lastRecord, setLastRecord] = useState<WorkoutRecord | null>(null);
  const [lastWorkoutSeries, setLastWorkoutSeries] = useState<WorkoutRecord[]>([]);
  const [loadingLast, setLoadingLast] = useState(false);

  // Formulario para modo simple
  const formMethods = useForm<WorkoutFormData>({
    mode: 'onChange',
    defaultValues: {
      weight: 0,
      reps: 1,
      sets: 1,
      date: new Date() // Fecha por defecto: hoy
    }
  });

  // Formulario para modo avanzado
  const advancedFormMethods = useForm<WorkoutFormDataAdvanced>({
    mode: 'onChange',
    defaultValues: {
      sets: [],
      date: new Date() // Fecha por defecto: hoy
    }
  });

  // Función para obtener el último registro y todas las series del último día
  const fetchLastRecord = () => {
    if (!exerciseId || !workoutRecords) return;
    setLoadingLast(true);

    // Filtrar en memoria por exerciseId y ordenar por fecha descendente
    const filtered = workoutRecords
      .filter(r => r.exerciseId === exerciseId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    if (filtered.length === 0) {
      setLastRecord(null);
      setLastWorkoutSeries([]);
      setLoadingLast(false);
      return;
    }

    // Obtener el último registro para compatibilidad
    let lastRecordData: WorkoutRecord | null = filtered[0];
    if (lastRecordData && exerciseObj) {
      lastRecordData = { ...lastRecordData, exercise: exerciseObj };
    }
    setLastRecord(lastRecordData);

    // Obtener todas las series del último día de entrenamiento
    const lastWorkoutDate = filtered[0].date;
    const lastWorkoutDateString = lastWorkoutDate.toDateString();

    const lastDaySeries = filtered
      .filter(r => r.date.toDateString() === lastWorkoutDateString)
      .map(r => exerciseObj ? { ...r, exercise: exerciseObj } : r)
      .sort((a, b) => a.date.getTime() - b.date.getTime()); // Ordenar por hora para mantener el orden de las series

    setLastWorkoutSeries(lastDaySeries);
    setLoadingLast(false);
  };

  const toggleModal = () => {
    setShowModal(!showModal);
    if (showModal) {
      formMethods.reset();
      advancedFormMethods.reset();
    }
  };

  const resetModal = () => {
    setShowModal(false);
    formMethods.reset();
    advancedFormMethods.reset();
  };

  const handleSubmit = async (
    assignmentId: string,
    data: WorkoutFormData | WorkoutFormDataAdvanced,
    onRecord: ExerciseCardProps['onRecord']
  ) => {
    setLoading(true);
    try {
      await onRecord(assignmentId, data);
      resetModal();
      // Volver a consultar el último registro tras guardar
      fetchLastRecord();
    } catch (error) {
      console.error('Error recording workout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Obtener el último registro del ejercicio al abrir el modal o cuando cambian los registros
  useEffect(() => {
    fetchLastRecord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId, showModal, workoutRecords]);

  return {
    showModal,
    loading,
    showPreview,
    toggleModal,
    setShowPreview,
    handleSubmit,
    resetModal,
    formMethods,
    advancedFormMethods,
    lastRecord,
    lastWorkoutSeries,
    loadingLast
  };
}; 