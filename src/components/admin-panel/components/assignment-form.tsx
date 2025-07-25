import { createExerciseAssignment } from '@/api/services';
import type { DayOfWeek } from '@/interfaces';
import { useAdminStore } from '@/stores/admin';
import { useOnlineStatus } from '@/stores/connection';
import { useNotification } from '@/stores/notification';
import { Plus } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { groupExercisesByCategory } from '../../../utils/functions/select-utils';
import { Button } from '../../button';
import { Select } from '../../select';
import type { AssignmentFormData } from '../types';
import { formatDayName } from '../utils/admin-utils';

interface AssignmentFormProps {
  selectedDay: DayOfWeek;
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({ selectedDay }) => {
  const isOnline = useOnlineStatus();
  const { showNotification } = useNotification();

  const {
    exercises,
    setLoading,
    setError,
    addAssignment
  } = useAdminStore();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<AssignmentFormData>({
    mode: 'onChange',
    defaultValues: {
      exerciseId: '',
      dayOfWeek: selectedDay
    }
  });

  // Actualizar el formulario cuando cambie selectedDay
  useEffect(() => {
    setValue('dayOfWeek', selectedDay);
  }, [selectedDay, setValue]);

  const handleFormSubmit = async (data: AssignmentFormData) => {
    if (!isOnline) {
      showNotification('Sin conexión. No se puede asignar el ejercicio.', 'error');
      return false;
    }

    setLoading('creating', true);
    setError('assignments', null);

    try {
      const exercise = exercises.find(ex => ex.id === data.exerciseId);
      const assignmentId = await createExerciseAssignment({
        exerciseId: data.exerciseId,
        dayOfWeek: data.dayOfWeek
      });

      // Crear objeto de asignación con datos del ejercicio
      const assignmentWithExercise = {
        id: assignmentId,
        exerciseId: data.exerciseId,
        dayOfWeek: data.dayOfWeek,
        exercise
      };

      addAssignment(assignmentWithExercise);

      showNotification(`"${exercise?.name}" asignado al ${data.dayOfWeek}`, 'success');
      reset({ exerciseId: '', dayOfWeek: selectedDay });
      return true;
    } catch (error: any) {
      const message = error.message || 'Error al asignar el ejercicio';
      setError('assignments', message);
      showNotification(message, 'error');
      return false;
    } finally {
      setLoading('creating', false);
    }
  };

  // Agrupar ejercicios por categoría para el select
  const exerciseGroups = groupExercisesByCategory(exercises);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Select
        label="Seleccionar ejercicio por categoría"
        disabled={!isOnline}
        placeholder={isOnline ? 'Selecciona un ejercicio...' : 'Sin conexión'}
        groups={exerciseGroups}
        {...register('exerciseId', { required: 'Selecciona un ejercicio' })}
        error={errors.exerciseId?.message}
      />

      {/* Contador de ejercicios disponibles */}
      {isOnline && exercises.length > 0 && (
        <div className="text-xs text-gray-500">
          {exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''} disponible{exercises.length !== 1 ? 's' : ''}
          en {exerciseGroups.length} categoría{exerciseGroups.length !== 1 ? 's' : ''}
        </div>
      )}

      <Button
        type="submit"
        loading={false}
        disabled={!isOnline || exercises.length === 0}
      >
        <Plus className="w-4 h-4 mr-2" />
        {isOnline
          ? `Asignar al ${formatDayName(selectedDay)}`
          : 'Sin conexión'
        }
      </Button>
    </form>
  );
}; 