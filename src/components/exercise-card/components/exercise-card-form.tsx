import type { WorkoutFormData, WorkoutFormDataAdvanced } from '@/interfaces';
import React, { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';

import { EXERCISE_CARD_CONSTANTS } from '../constants';
import { exerciseCardUtils } from '../utils';
import { AdvancedForm } from './advanced-form';
import { ModeSelector } from './mode-selector';
import { SimpleForm } from './simple-form';

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

  const { watch, setValue } = formMethods;
  const { control: advancedControl, watch: advancedWatch } = advancedFormMethods;

  const { fields, append, remove } = useFieldArray({
    control: advancedControl,
    name: "sets"
  });

  const addSet = () => append(EXERCISE_CARD_CONSTANTS.INDIVIDUAL_SETS.defaultSet);
  const removeSet = (index: number) => fields.length > EXERCISE_CARD_CONSTANTS.INDIVIDUAL_SETS.minSets && remove(index);

  const handleModeChange = (mode: 'simple' | 'advanced') => {
    setIsAdvancedMode(mode === 'advanced');

    if (mode === 'advanced') {
      const simpleData = formMethods.getValues();
      if (simpleData.weight > 0 || simpleData.reps > 0 || simpleData.sets > 0) {
        const series = Array.from({ length: simpleData.sets || 1 }, () => ({
          weight: simpleData.weight || 0,
          reps: simpleData.reps || 1
        }));
        remove();
        series.forEach(set => append(set));
      }
    } else if (mode === 'simple' && fields.length > 0) {
      const watchedSets = advancedWatch("sets");
      if (watchedSets?.length > 0) {
        const stats = exerciseCardUtils.calculateAdvancedFormStats(watchedSets);
        setValue('weight', stats.totalVolume / stats.totalReps);
        setValue('reps', Math.round(stats.totalReps / stats.totalSets));
        setValue('sets', stats.totalSets);
      }
    }
  };

  const watchedSets = advancedWatch("sets");
  const advancedStats = exerciseCardUtils.calculateAdvancedFormStats(watchedSets || []);
  const simpleData = watch(['weight', 'reps', 'sets']);
  const simpleStats = exerciseCardUtils.calculateFormStats(simpleData[0] || 0, simpleData[1] || 0, simpleData[2] || 0);

  return (
    <div className="space-y-6">
      <ModeSelector
        isAdvancedMode={isAdvancedMode}
        onModeChange={handleModeChange}
      />

      {isAdvancedMode ? (
        <AdvancedForm
          loading={loading}
          onSubmit={onSubmit}
          onCancel={onCancel}
          formMethods={advancedFormMethods}
          fields={fields}
          addSet={addSet}
          removeSet={removeSet}
          stats={advancedStats}
        />
      ) : (
        <SimpleForm
          loading={loading}
          onSubmit={onSubmit}
          onCancel={onCancel}
          formMethods={formMethods}
          stats={simpleStats}
        />
      )}
    </div>
  );
}; 