import { Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import type { WorkoutFormData, WorkoutFormDataAdvanced } from '../../../interfaces';
import { formatNumber } from '../../../utils/functions';
import { Button } from '../../button';
import { DatePicker } from '../../date-picker';
import { Input } from '../../input';

interface ExerciseCardFormProps {
  loading: boolean;
  onSubmit: (data: WorkoutFormData | WorkoutFormDataAdvanced) => Promise<void>;
  onCancel: () => void;
  formMethods: UseFormReturn<WorkoutFormData>;
  advancedFormMethods: UseFormReturn<WorkoutFormDataAdvanced>;
}

/**
 * Formulario del ExerciseCard para registro de entrenamientos
 * Soporta modo simple (peso/reps/sets fijos) y modo avanzado (series individuales)
 * Diseño mejorado basado en el historial de entrenamientos
 */
export const ExerciseCardForm: React.FC<ExerciseCardFormProps> = ({
  loading,
  onSubmit,
  onCancel,
  formMethods,
  advancedFormMethods
}) => {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  // Form methods para modo simple
  const { register, handleSubmit, formState: { errors } } = formMethods;

  // Form methods para modo avanzado
  const {
    register: advancedRegister,
    handleSubmit: advancedHandleSubmit,
    control: advancedControl,
    formState: { errors: advancedErrors },
    watch: advancedWatch
  } = advancedFormMethods;

  // Field array para series individuales
  const { fields, append, remove } = useFieldArray({
    control: advancedControl,
    name: "sets"
  });

  const addSet = () => {
    append({ weight: 0, reps: 1 });
  };

  const removeSet = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Cambiar modo de entrenamiento con inicialización inteligente
  const handleModeChange = (mode: 'simple' | 'advanced') => {
    setIsAdvancedMode(mode === 'advanced');

    if (mode === 'advanced') {
      // CORREGIDO: Siempre transferir datos del formulario simple al avanzado
      const simpleData = formMethods.getValues();

      // Solo transferir si hay datos válidos en el formulario simple
      if (simpleData.weight > 0 || simpleData.reps > 0 || simpleData.sets > 0) {
        const series = [];
        for (let i = 0; i < (simpleData.sets || 1); i++) {
          series.push({ weight: simpleData.weight || 0, reps: simpleData.reps || 1 });
        }

        // Limpiar series existentes y agregar las nuevas
        remove();
        series.forEach(set => append(set));
      }
    } else if (mode === 'simple' && fields.length > 0) {
      // Si cambia a modo simple, calcular promedios de las series individuales
      const watchedSets = advancedWatch("sets");
      if (watchedSets && watchedSets.length > 0) {
        const totalSets = watchedSets.length;
        const totalReps = watchedSets.reduce((sum, set) => sum + set.reps, 0);
        const avgReps = Math.round(totalReps / totalSets);
        const avgWeight = watchedSets.reduce((sum, set) => sum + set.weight, 0) / totalSets;

        formMethods.setValue('weight', avgWeight);
        formMethods.setValue('reps', avgReps);
        formMethods.setValue('sets', totalSets);
      }
    }
  };

  // Calcular estadísticas para modo avanzado
  const watchedSets = advancedWatch("sets");
  const totalSets = watchedSets?.length || 0;
  const totalReps = watchedSets?.reduce((sum, set) => sum + set.reps, 0) || 0;
  const totalVolume = watchedSets?.reduce((sum, set) => sum + (set.weight * set.reps), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Selector de modo mejorado */}
      <div>
        <label className="text-sm text-gray-400 mb-3 block">Modo de entrenamiento</label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => handleModeChange('simple')}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${!isAdvancedMode
              ? 'bg-blue-600 text-white border border-blue-500 shadow-md'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/50'
              }`}
          >
            🏃 Registro Rápido
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('advanced')}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isAdvancedMode
              ? 'bg-blue-600 text-white border border-blue-500 shadow-md'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/50'
              }`}
          >
            ⚡ Series Individuales
          </button>
        </div>
      </div>

      {isAdvancedMode ? (
        /* Modo avanzado - Series individuales */
        <form onSubmit={advancedHandleSubmit(onSubmit)} className="space-y-6">

          {/* Gestión de series */}
          <div className="bg-gray-800/30 rounded-xl border border-gray-700/30 p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-white flex items-center">
                ⚡ Series individuales
              </h4>
              <button
                type="button"
                onClick={addSet}
                className="px-3 py-2 bg-green-600/20 text-green-300 rounded-lg text-sm hover:bg-green-600/30 transition-colors border border-green-500/30 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir serie</span>
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-blue-300">Serie {index + 1}</span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSet(index)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Eliminar serie"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Peso (kg)</label>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="0"
                        {...advancedRegister(`sets.${index}.weight`, {
                          required: 'El peso es requerido',
                          min: { value: 0, message: 'El peso debe ser positivo' },
                          valueAsNumber: true
                        })}
                        error={advancedErrors.sets?.[index]?.weight?.message}
                        className="bg-gray-700/50 border-gray-600/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Repeticiones</label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        {...advancedRegister(`sets.${index}.reps`, {
                          required: 'Las repeticiones son requeridas',
                          min: { value: 1, message: 'Mínimo 1 repetición' },
                          valueAsNumber: true
                        })}
                        error={advancedErrors.sets?.[index]?.reps?.message}
                        className="bg-gray-700/50 border-gray-600/50"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Estadísticas en tiempo real */}
            {totalSets > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-blue-600/10 rounded-lg p-3 text-center border border-blue-500/20">
                  <p className="text-lg font-bold text-blue-400">{totalSets}</p>
                  <p className="text-xs text-blue-300">Series</p>
                </div>
                <div className="bg-green-600/10 rounded-lg p-3 text-center border border-green-500/20">
                  <p className="text-lg font-bold text-green-400">{totalReps}</p>
                  <p className="text-xs text-green-300">Reps totales</p>
                </div>
                <div className="bg-purple-600/10 rounded-lg p-3 text-center border border-purple-500/20">
                  <p className="text-lg font-bold text-purple-400">{formatNumber(totalVolume)} kg</p>
                  <p className="text-xs text-purple-300">Volumen</p>
                </div>
              </div>
            )}
          </div>

          {/* Fecha del entrenamiento */}
          <div className="bg-gray-800/30 rounded-xl border border-gray-700/30 p-5">
            <h4 className="text-lg font-medium text-white mb-4 flex items-center">
              📅 Fecha del entrenamiento
            </h4>
            <DatePicker
              label="Selecciona la fecha"
              value={advancedWatch('date')}
              onChange={date => advancedFormMethods.setValue('date', date)}
              className="border-gray-600/50"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              loading={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              disabled={totalSets === 0}
            >
              {loading ? 'Registrando...' : `Registrar ${totalSets} Serie${totalSets !== 1 ? 's' : ''}`}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="sm:w-auto"
            >
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        /* Modo simple - Registro rápido */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Datos del entrenamiento */}
          <div className="bg-gray-800/30 rounded-xl border border-gray-700/30 p-5">
            <h4 className="text-lg font-medium text-white mb-4 flex items-center">
              🏃 Datos del entrenamiento
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Peso (kg)</label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="0"
                  {...register('weight', {
                    required: 'El peso es requerido',
                    min: { value: 0, message: 'El peso debe ser positivo' },
                    valueAsNumber: true
                  })}
                  error={errors.weight?.message}
                  className="bg-gray-700/50 border-gray-600/50"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Repeticiones</label>
                <Input
                  type="number"
                  min="1"
                  placeholder="1"
                  {...register('reps', {
                    required: 'Las repeticiones son requeridas',
                    min: { value: 1, message: 'Mínimo 1 repetición' },
                    valueAsNumber: true
                  })}
                  error={errors.reps?.message}
                  className="bg-gray-700/50 border-gray-600/50"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Series</label>
                <Input
                  type="number"
                  min="1"
                  placeholder="1"
                  {...register('sets', {
                    required: 'Las series son requeridas',
                    min: { value: 1, message: 'Mínimo 1 serie' },
                    valueAsNumber: true
                  })}
                  error={errors.sets?.message}
                  className="bg-gray-700/50 border-gray-600/50"
                />
              </div>
            </div>

            {/* Estadísticas en tiempo real para modo rápido */}
            {(() => {
              const simpleData = formMethods.watch(['weight', 'reps', 'sets']);
              const [weight, reps, sets] = simpleData;

              if (weight > 0 || reps > 0 || sets > 0) {
                const totalReps = (reps || 0) * (sets || 0);
                const totalVolume = (weight || 0) * totalReps;

                return (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-blue-600/10 rounded-lg p-3 text-center border border-blue-500/20">
                      <p className="text-lg font-bold text-blue-400">{sets || 0}</p>
                      <p className="text-xs text-blue-300">Series</p>
                    </div>
                    <div className="bg-green-600/10 rounded-lg p-3 text-center border border-green-500/20">
                      <p className="text-lg font-bold text-green-400">{totalReps}</p>
                      <p className="text-xs text-green-300">Reps totales</p>
                    </div>
                    <div className="bg-purple-600/10 rounded-lg p-3 text-center border border-purple-500/20">
                      <p className="text-lg font-bold text-purple-400">{formatNumber(totalVolume)} kg</p>
                      <p className="text-xs text-purple-300">Volumen</p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* Fecha del entrenamiento */}
          <div className="bg-gray-800/30 rounded-xl border border-gray-700/30 p-5">
            <h4 className="text-lg font-medium text-white mb-4 flex items-center">
              📅 Fecha del entrenamiento
            </h4>
            <DatePicker
              label="Selecciona la fecha"
              value={formMethods.watch('date')}
              onChange={date => formMethods.setValue('date', date)}
              className="border-gray-600/50"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              loading={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {(() => {
                if (loading) return 'Registrando...';

                const simpleData = formMethods.watch(['weight', 'reps', 'sets']);
                const [weight, reps, sets] = simpleData;

                if (weight > 0 && reps > 0 && sets > 0) {
                  const totalVolume = weight * reps * sets;
                  return `Registrar (${formatNumber(totalVolume)} kg)`;
                }

                return 'Registrar Entrenamiento';
              })()}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="sm:w-auto"
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}; 