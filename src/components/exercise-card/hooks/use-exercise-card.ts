import type { Exercise, WorkoutFormData, WorkoutFormDataAdvanced, WorkoutRecord } from '@/interfaces';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { EXERCISE_CARD_CONSTANTS } from '../constants';
import type { ExerciseCardProps, UseExerciseCardReturn } from '../types';
import { exerciseCardUtils } from '../utils';

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
    defaultValues: EXERCISE_CARD_CONSTANTS.DEFAULT_FORM_VALUES
  });

  // Formulario para modo avanzado
  const advancedFormMethods = useForm<WorkoutFormDataAdvanced>({
    mode: 'onChange',
    defaultValues: EXERCISE_CARD_CONSTANTS.DEFAULT_ADVANCED_FORM_VALUES
  });

  // Función para obtener el último registro usando utilidades
  const fetchLastRecord = () => {
    if (!exerciseId || !workoutRecords) return;
    setLoadingLast(true);

    const { lastRecord: record, lastWorkoutSeries: series } = exerciseCardUtils.getLastWorkoutData(
      exerciseId,
      workoutRecords,
      exerciseObj
    );

    setLastRecord(record);
    setLastWorkoutSeries(series);
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