import { Plus, Trash2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { DAYS } from '../../../constants/days';
import type { DayOfWeek } from '../../../interfaces';
import { groupExercisesByCategory } from '../../../utils/functions/select-utils';
import { Button } from '../../button';
import { Card, CardContent, CardHeader } from '../../card';
import { Select } from '../../select';
import { URLPreview } from '../../url-preview';
import type { ExerciseAssignmentsProps } from '../types';

interface AssignmentFormData {
  exerciseId: string;
  dayOfWeek: DayOfWeek;
}

/**
 * Componente para asignar ejercicios por día con select agrupado por categorías
 */
export const ExerciseAssignments: React.FC<ExerciseAssignmentsProps> = ({
  selectedDay,
  onSelectDay,
  exercises,
  assignments,
  isOnline,
  loading,
  onCreateAssignment,
  onDeleteAssignment,
  onPreviewUrl
}) => {
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
    const success = await onCreateAssignment(data.exerciseId, data.dayOfWeek);
    if (success) {
      reset({ exerciseId: '', dayOfWeek: selectedDay });
    }
  };

  // Agrupar ejercicios por categoría para el select
  const exerciseGroups = groupExercisesByCategory(exercises);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white">Asignar Ejercicios por Día</h3>
        <p className="text-sm text-gray-400">
          Los ejercicios están organizados por categorías para facilitar la selección
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Selector de días */}
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <Button
                key={day}
                variant={selectedDay === day ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onSelectDay(day)}
                disabled={!isOnline}
              >
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </Button>
            ))}
          </div>

          {/* Formulario de asignación con select agrupado */}
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
              loading={loading}
              disabled={!isOnline || exercises.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isOnline
                ? `Asignar al ${selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}`
                : 'Sin conexión'
              }
            </Button>
          </form>

          {/* Lista de ejercicios asignados */}
          <div className="mt-6">
            <h4 className="text-md font-medium text-white mb-3">
              Ejercicios de {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}
            </h4>
            {assignments.length === 0 ? (
              <p className="text-gray-400 text-sm">
                {isOnline
                  ? 'No hay ejercicios asignados para este día'
                  : 'Sin conexión - No se pueden cargar las asignaciones'
                }
              </p>
            ) : (
              <div className="space-y-2">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="bg-gray-800 p-3 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">
                          {assignment.exercise?.name || 'Ejercicio no encontrado'}
                        </p>
                        {assignment.exercise?.category && (
                          <p className="text-sm text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full inline-block mt-1">
                            {assignment.exercise.category}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDeleteAssignment(assignment.id)}
                        disabled={!isOnline}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Vista previa de URL en asignaciones */}
                    {assignment.exercise?.url && (
                      <URLPreview
                        url={assignment.exercise.url}
                        onClick={() => onPreviewUrl(assignment.exercise!.url!)}
                        className="mt-2"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 