import { Plus } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import type { AssignmentFormData } from '../types';
import { formatDayName } from '../utils';

import { createExerciseAssignment } from '@/api/services';
import { Button } from '@/components/button';
import { Select } from '@/components/select';
import type { DayOfWeek } from '@/interfaces';
import { useAdminStore } from '@/stores/admin';
import { useOnlineStatus } from '@/stores/connection';
import { useNotification } from '@/stores/notification';
import { groupExercisesByCategory } from '@/utils';

interface AssignmentFormProps {
  selectedDay: DayOfWeek;
  onSuccess?: () => void;
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({ selectedDay, onSuccess }) => {
  const isOnline = useOnlineStatus();
  const { showNotification } = useNotification();

  const {
    exercises,
    setLoading,
    setError,
    addAssignment,
  } = useAdminStore();

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssignmentFormData>({
    mode: 'onChange',
    defaultValues: {
      exerciseId: '',
      dayOfWeek: selectedDay,
    },
  });

  // Observar el valor del formulario
  const exerciseId = watch('exerciseId');

  // Actualizar el formulario cuando cambie selectedDay
  useEffect(() => {
    setValue('dayOfWeek', selectedDay);
  }, [selectedDay, setValue]);

  // Manejar el cambio del select manualmente
  const handleExerciseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('exerciseId', e.target.value);
  };

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
        dayOfWeek: data.dayOfWeek,
      });

      // Crear objeto de asignación con datos del ejercicio
      const assignmentWithExercise = {
        id: assignmentId,
        exerciseId: data.exerciseId,
        dayOfWeek: data.dayOfWeek,
        exercise,
      };

      addAssignment(assignmentWithExercise);

      showNotification(`"${exercise?.name}" asignado al ${data.dayOfWeek}`, 'success');
      reset({ exerciseId: '', dayOfWeek: selectedDay });
      onSuccess?.();
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al asignar el ejercicio';
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      <div className="flex items-end space-x-3">
        <div className="flex-1">
          <Select
            disabled={!isOnline}
            placeholder={isOnline ? 'Selecciona un ejercicio...' : 'Sin conexión'}
            groups={exerciseGroups}
            value={exerciseId}
            onChange={handleExerciseChange}
            error={errors.exerciseId?.message}
          />
        </div>

        <Button
          type="submit"
          loading={false}
          disabled={!isOnline || exercises.length === 0 || !exerciseId}
          leftIcon={<Plus className="w-4 h-4" />}
          className="flex-shrink-0"
        >
          {isOnline ? 'Asignar' : 'Sin conexión'}
        </Button>
      </div>

      {/* Información compacta */}
      {isOnline && exercises.length > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''} disponible{exercises.length !== 1 ? 's' : ''}
          </span>
          <span>
            {formatDayName(selectedDay)}
          </span>
        </div>
      )}
    </form>
  );
};
