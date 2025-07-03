import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { WorkoutFormData, WorkoutFormDataAdvanced } from '../../../interfaces';
import type { ExerciseCardProps, UseExerciseCardReturn } from '../types';

/**
 * Hook específico para manejar el estado y lógica del ExerciseCard
 * Centraliza el manejo del formulario, estados de carga y UI
 * Soporta tanto modo simple como avanzado con series individuales
 */
export const useExerciseCard = (): UseExerciseCardReturn => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Formulario para modo simple
  const formMethods = useForm<WorkoutFormData>({
    mode: 'onChange',
    defaultValues: {
      weight: 0,
      reps: 1,
      sets: 1
    }
  });

  // Formulario para modo avanzado
  const advancedFormMethods = useForm<WorkoutFormDataAdvanced>({
    mode: 'onChange',
    defaultValues: {
      sets: []
    }
  });

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
    } catch (error) {
      console.error('Error recording workout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    showForm,
    loading,
    showPreview,
    toggleForm,
    setShowPreview,
    handleSubmit,
    resetForm,
    formMethods,
    advancedFormMethods
  };
}; 