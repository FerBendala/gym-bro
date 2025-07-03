import { Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import type { WorkoutFormData, WorkoutFormDataAdvanced } from '../../../interfaces';
import { Button } from '../../button';
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

  const switchToAdvanced = () => {
    setIsAdvancedMode(true);
    // Si no hay series, agregar una inicial
    if (fields.length === 0) {
      addSet();
    }
  };

  const switchToSimple = () => {
    setIsAdvancedMode(false);
  };

  // Calcular resumen para modo avanzado
  const watchedSets = advancedWatch("sets");
  const totalSets = watchedSets?.length || 0;
  const totalVolume = watchedSets?.reduce((sum, set) => sum + (set.weight * set.reps), 0) || 0;

  if (isAdvancedMode) {
    return (
      <form onSubmit={advancedHandleSubmit(onSubmit)} className="space-y-3 pt-2 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-medium text-white">Series Individuales</h4>
          <div className="flex space-x-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={switchToSimple}
              className="text-xs px-2 py-1"
            >
              Modo Simple
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addSet}
              className="text-xs px-2 py-1"
            >
              <Plus className="w-3 h-3 mr-1" />
              Añadir Serie
            </Button>
          </div>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end space-x-2">
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label={`Serie ${index + 1} - Peso (kg)`}
                    type="number"
                    step="0.5"
                    min="0"
                    {...advancedRegister(`sets.${index}.weight`, {
                      required: 'El peso es requerido',
                      min: { value: 0, message: 'El peso debe ser positivo' },
                      valueAsNumber: true
                    })}
                    error={advancedErrors.sets?.[index]?.weight?.message}
                  />
                  <Input
                    label="Reps"
                    type="number"
                    min="1"
                    {...advancedRegister(`sets.${index}.reps`, {
                      required: 'Las repeticiones son requeridas',
                      min: { value: 1, message: 'Mínimo 1 repetición' },
                      valueAsNumber: true
                    })}
                    error={advancedErrors.sets?.[index]?.reps?.message}
                  />
                </div>
              </div>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeSet(index)}
                  className="mb-1"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Resumen */}
        {totalSets > 0 && (
          <div className="text-sm text-gray-400 bg-gray-800 p-3 rounded-lg">
            <div className="flex justify-between">
              <span>Total Series: {totalSets}</span>
              <span>Volumen Total: {totalVolume.toFixed(1)} kg</span>
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            type="submit"
            loading={loading}
            className="flex-1"
            disabled={totalSets === 0}
          >
            Registrar {totalSets} Serie{totalSets !== 1 ? 's' : ''}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancelar
          </Button>
        </div>
      </form>
    );
  }

  // Modo simple (original)
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 pt-2 border-t border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-medium text-white">Registro Rápido</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={switchToAdvanced}
          className="text-xs px-2 py-1"
        >
          Modo Avanzado
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Input
          label="Peso (kg)"
          type="number"
          step="0.5"
          min="0"
          sizeVariant="sm"
          {...register('weight', {
            required: 'El peso es requerido',
            min: { value: 0, message: 'El peso debe ser positivo' },
            valueAsNumber: true
          })}
          error={errors.weight?.message}
        />
        <Input
          label="Reps"
          type="number"
          min="1"
          sizeVariant="sm"
          {...register('reps', {
            required: 'Las repeticiones son requeridas',
            min: { value: 1, message: 'Mínimo 1 repetición' },
            valueAsNumber: true
          })}
          error={errors.reps?.message}
        />
        <Input
          label="Series"
          type="number"
          min="1"
          sizeVariant="sm"
          {...register('sets', {
            required: 'Las series son requeridas',
            min: { value: 1, message: 'Mínimo 1 serie' },
            valueAsNumber: true
          })}
          error={errors.sets?.message}
        />
      </div>
      <div className="flex space-x-2">
        <Button
          type="submit"
          loading={loading}
          size="sm"
          className="flex-1"
        >
          Registrar
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCancel}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}; 