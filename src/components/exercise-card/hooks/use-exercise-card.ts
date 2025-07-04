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
): UseExerciseCardReturn & { lastRecord: WorkoutRecord | null, loadingLast: boolean } => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [lastRecord, setLastRecord] = useState<WorkoutRecord | null>(null);
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

  // Función para obtener el último registro en memoria
  const fetchLastRecord = () => {
    if (!exerciseId || !workoutRecords) return;
    setLoadingLast(true);
    // Filtrar en memoria por exerciseId y ordenar por fecha descendente
    const filtered = workoutRecords
      .filter(r => r.exerciseId === exerciseId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    let enriched: WorkoutRecord | null = filtered.length > 0 ? filtered[0] : null;
    if (enriched && exerciseObj) {
      enriched = { ...enriched, exercise: exerciseObj };
    }
    setLastRecord(enriched);
    setLoadingLast(false);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) {
      formMethods.reset();
      advancedFormMethods.reset();
    }
  };

  const resetForm = () => {
    setShowForm(false);
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
      resetForm();
      // Volver a consultar el último registro tras guardar
      fetchLastRecord();
    } catch (error) {
      console.error('Error recording workout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Obtener el último registro del ejercicio al abrir el formulario o cuando cambian los registros
  useEffect(() => {
    fetchLastRecord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId, showForm, workoutRecords]);

  return {
    showForm,
    loading,
    showPreview,
    toggleForm,
    setShowPreview,
    handleSubmit,
    resetForm,
    formMethods,
    advancedFormMethods,
    lastRecord,
    loadingLast
  };
}; 