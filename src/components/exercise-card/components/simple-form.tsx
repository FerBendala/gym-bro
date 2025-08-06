import { Calendar, Dumbbell } from 'lucide-react';
import React from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { EXERCISE_CARD_CONSTANTS } from '../constants';

import { Button } from '@/components/button';
import { DatePicker } from '@/components/date-picker';
import { Input } from '@/components/input';
import type { WorkoutFormData } from '@/interfaces';
import { formatNumberToString } from '@/utils';

interface SimpleFormProps {
  loading: boolean;
  onSubmit: (data: WorkoutFormData) => Promise<void>;
  onCancel: () => void;
  formMethods: UseFormReturn<WorkoutFormData>;
  stats: {
    totalReps: number;
    totalVolume: number;
    sets: number;
  };
}

/**
 * Formulario simple compacto para entrenamiento con peso/reps/sets fijos
 */
export const SimpleForm: React.FC<SimpleFormProps> = ({
  loading,
  onSubmit,
  onCancel,
  formMethods,
  stats,
}) => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = formMethods;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Datos del entrenamiento */}
      <div className="bg-gray-800/30 rounded-lg border border-gray-700/30 p-3">
        <h4 className="text-sm font-medium text-white mb-3 flex items-center">
          <Dumbbell className="w-4 h-4 mr-2" />
          Datos del entrenamiento
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Peso (kg)</label>
            <Input
              type="number" step="0.5" min="0" placeholder="0"
              {...register('weight', {
                required: EXERCISE_CARD_CONSTANTS.ERROR_MESSAGES.weight.required,
                min: { value: 0, message: EXERCISE_CARD_CONSTANTS.ERROR_MESSAGES.weight.min },
                valueAsNumber: true,
              })}
              error={errors.weight?.message}
              className="bg-gray-700/50 border-gray-600/50"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Repeticiones</label>
            <Input
              type="number" min="1" placeholder="1"
              {...register('reps', {
                required: EXERCISE_CARD_CONSTANTS.ERROR_MESSAGES.reps.required,
                min: { value: 1, message: EXERCISE_CARD_CONSTANTS.ERROR_MESSAGES.reps.min },
                valueAsNumber: true,
              })}
              error={errors.reps?.message}
              className="bg-gray-700/50 border-gray-600/50"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Series</label>
            <Input
              type="number" min="1" placeholder="1"
              {...register('sets', {
                required: EXERCISE_CARD_CONSTANTS.ERROR_MESSAGES.sets.required,
                min: { value: 1, message: EXERCISE_CARD_CONSTANTS.ERROR_MESSAGES.sets.min },
                valueAsNumber: true,
              })}
              error={errors.sets?.message}
              className="bg-gray-700/50 border-gray-600/50"
            />
          </div>
        </div>

        {/* Estadísticas en tiempo real */}
        {stats.totalVolume > 0 && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="bg-blue-600/10 rounded-lg p-2 text-center border border-blue-500/20">
              <p className="text-sm font-bold text-blue-400">{stats.sets}</p>
              <p className="text-xs text-blue-300">Series</p>
            </div>
            <div className="bg-green-600/10 rounded-lg p-2 text-center border border-green-500/20">
              <p className="text-sm font-bold text-green-400">{stats.totalReps}</p>
              <p className="text-xs text-green-300">Reps totales</p>
            </div>
            <div className="bg-purple-600/10 rounded-lg p-2 text-center border border-purple-500/20">
              <p className="text-sm font-bold text-purple-400">{formatNumberToString(stats.totalVolume)} {EXERCISE_CARD_CONSTANTS.STATS.volumeUnit}</p>
              <p className="text-xs text-purple-300">Volumen</p>
            </div>
          </div>
        )}
      </div>

      {/* Fecha del entrenamiento */}
      <div className="bg-gray-800/30 rounded-lg border border-gray-700/30 p-3">
        <h4 className="text-sm font-medium text-white mb-3 flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Fecha del entrenamiento
        </h4>
        <DatePicker
          label="Selecciona la fecha"
          value={watch('date')}
          onChange={date => setValue('date', date)}
          className="border-gray-600/50"
        />
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="submit"
          loading={loading}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          {loading ? 'Registrando...' : (stats.totalVolume > 0 ? `Registrar (${formatNumberToString(stats.totalVolume)} ${EXERCISE_CARD_CONSTANTS.STATS.volumeUnit})` : 'Registrar Entrenamiento')}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="sm:w-auto">
          Cancelar
        </Button>
      </div>
    </form>
  );
};
