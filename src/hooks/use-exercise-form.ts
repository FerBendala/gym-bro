import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { ExerciseFormData } from '../components/admin-panel/types';
import type { Exercise } from '../interfaces';
import { validateURL } from '../utils/functions/url-validation';

interface UseExerciseFormProps {
  exercise?: Exercise;
  onSubmit: (data: ExerciseFormData) => Promise<boolean>;
}

export const useExerciseForm = ({ exercise, onSubmit }: UseExerciseFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ExerciseFormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      categories: [],
      description: '',
      url: ''
    }
  });

  const watchedUrl = watch('url');
  const watchedCategories = watch('categories');
  const isEditing = !!exercise;

  // Reset del formulario cuando cambia el ejercicio a editar
  useEffect(() => {
    if (exercise) {
      reset({
        name: exercise.name || '',
        categories: exercise.categories || [],
        description: exercise.description || '',
        url: exercise.url || ''
      });
    } else {
      // Reset a valores vacíos cuando no hay ejercicio (modo crear)
      reset({
        name: '',
        categories: [],
        description: '',
        url: ''
      });
    }
  }, [exercise, reset]);

  const handleFormSubmit = async (data: ExerciseFormData) => {
    if (data.url && !validateURL(data.url)) {
      return;
    }

    const success = await onSubmit(data);
    if (success && !isEditing) {
      reset();
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(handleFormSubmit),
    errors,
    watchedUrl,
    watchedCategories,
    isEditing,
    validateURL,
    setValue
  };
}; 