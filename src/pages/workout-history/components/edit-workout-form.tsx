import { Edit } from 'lucide-react';
import React from 'react';

import type { EditMode, WorkoutRecordWithExercise } from '../types';

import { AdvancedForm } from './advanced-form';
import { ModeSelector } from './mode-selector';
import { SimpleForm } from './simple-form';

import { Button } from '@/components/button';

interface EditWorkoutFormProps {
  record: WorkoutRecordWithExercise;
  editMode: EditMode;
  onModeChange: (mode: 'simple' | 'advanced') => void;
  onFieldChange: <K extends keyof EditMode>(key: K, value: EditMode[K]) => void;
  onIndividualSetAdd: () => void;
  onIndividualSetRemove: (index: number) => void;
  onIndividualSetUpdate: (index: number, field: 'weight' | 'reps', value: number) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const EditWorkoutForm: React.FC<EditWorkoutFormProps> = ({
  record,
  editMode,
  onModeChange,
  onFieldChange,
  onIndividualSetAdd,
  onIndividualSetRemove,
  onIndividualSetUpdate,
  onSave,
  onCancel,
}) => {
  return (
    <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-blue-500/30 shadow-lg">
      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Edit className="w-5 h-5 mr-2" />
        Editando: {record.exercise?.name}
      </h4>

      {/* Selector de modo */}
      <ModeSelector
        currentMode={editMode.mode}
        onModeChange={onModeChange}
      />

      {editMode.mode === 'simple' ? (
        <SimpleForm
          editMode={editMode}
          onFieldChange={onFieldChange}
        />
      ) : (
        <AdvancedForm
          editMode={editMode}
          onFieldChange={onFieldChange}
          onIndividualSetAdd={onIndividualSetAdd}
          onIndividualSetRemove={onIndividualSetRemove}
          onIndividualSetUpdate={onIndividualSetUpdate}
        />
      )}

      <div className="flex justify-end space-x-2">
        <Button onClick={onCancel} variant="secondary" size="sm">
          Cancelar
        </Button>
        <Button onClick={onSave} variant="primary" size="sm">
          Guardar
        </Button>
      </div>
    </div>
  );
};
