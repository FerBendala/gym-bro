import { Button } from '@/components/button';
import { DatePicker } from '@/components/date-picker';
import { Input } from '@/components/input';
import type { WorkoutFormDataAdvanced } from '@/interfaces';
import { formatNumber } from '@/utils/functions';
import { Plus, Trash2 } from 'lucide-react';
import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { FieldArrayWithId } from 'react-hook-form';

import { EXERCISE_CARD_CONSTANTS } from '../constants';

interface AdvancedFormProps {
  loading: boolean;
  onSubmit: (data: WorkoutFormDataAdvanced) => Promise<void>;
  onCancel: () => void;
  formMethods: UseFormReturn<WorkoutFormDataAdvanced>;
  fields: FieldArrayWithId<WorkoutFormDataAdvanced, "sets", "id">[];
  addSet: () => void;
  removeSet: (index: number) => void;
  stats: {
    totalSets: number;
    totalReps: number;
    totalVolume: number;
  };
}

/**
 * Formulario avanzado para series individuales
 */
export const AdvancedForm: React.FC<AdvancedFormProps> = ({
  loading,
  onSubmit,
  onCancel,
  formMethods,
  fields,
  addSet,
  removeSet,
  stats
}) => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = formMethods;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Gestión de series */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-white flex items-center">⚡ Series individuales</h4>
          <button type="button" onClick={addSet} className="px-3 py-2 bg-green-600/20 text-green-300 rounded-lg text-sm hover:bg-green-600/30 transition-colors border border-green-500/30 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Añadir serie</span>
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-blue-300">Serie {index + 1}</span>
                {fields.length > EXERCISE_CARD_CONSTANTS.INDIVIDUAL_SETS.minSets && (
                  <button type="button" onClick={() => removeSet(index)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="Eliminar serie">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Peso (kg)</label>
                  <Input
                    type="number" step="0.5" min="0" placeholder="0"
                    {...register(`sets.${index}.weight`, {
                      required: EXERCISE_CARD_CONSTANTS.ERROR_MESSAGES.weight.required,
                      min: { value: 0, message: EXERCISE_CARD_CONSTANTS.ERROR_MESSAGES.weight.min },
                      valueAsNumber: true
                    })}
                    error={errors.sets?.[index]?.weight?.message}
                    className="bg-gray-700/50 border-gray-600/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Repeticiones</label>
                  <Input
                    type="number" min="1" placeholder="1"
                    {...register(`sets.${index}.reps`, {
                      required: EXERCISE_CARD_CONSTANTS.ERROR_MESSAGES.reps.required,
                      min: { value: 1, message: EXERCISE_CARD_CONSTANTS.ERROR_MESSAGES.reps.min },
                      valueAsNumber: true
                    })}
                    error={errors.sets?.[index]?.reps?.message}
                    className="bg-gray-700/50 border-gray-600/50"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Estadísticas en tiempo real */}
        {stats.totalSets > 0 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-blue-600/10 rounded-lg p-3 text-center border border-blue-500/20">
              <p className="text-lg font-bold text-blue-400">{stats.totalSets}</p>
              <p className="text-xs text-blue-300">Series</p>
            </div>
            <div className="bg-green-600/10 rounded-lg p-3 text-center border border-green-500/20">
              <p className="text-lg font-bold text-green-400">{stats.totalReps}</p>
              <p className="text-xs text-green-300">Reps totales</p>
            </div>
            <div className="bg-purple-600/10 rounded-lg p-3 text-center border border-purple-500/20">
              <p className="text-lg font-bold text-purple-400">{formatNumber(stats.totalVolume)} {EXERCISE_CARD_CONSTANTS.STATS.volumeUnit}</p>
              <p className="text-xs text-purple-300">Volumen</p>
            </div>
          </div>
        )}
      </div>

      {/* Fecha del entrenamiento */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700/30 p-5">
        <h4 className="text-lg font-medium text-white mb-4 flex items-center">📅 Fecha del entrenamiento</h4>
        <DatePicker
          label="Selecciona la fecha"
          value={watch('date')}
          onChange={date => setValue('date', date)}
          className="border-gray-600/50"
        />
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="submit"
          loading={loading}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          disabled={stats.totalSets === 0}
        >
          {loading ? 'Registrando...' : `Registrar ${stats.totalSets} Serie${stats.totalSets !== 1 ? 's' : ''}`}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="sm:w-auto">
          Cancelar
        </Button>
      </div>
    </form>
  );
}; 