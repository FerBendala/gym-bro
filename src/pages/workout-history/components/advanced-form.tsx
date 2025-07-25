import { Input } from '@/components/input';
import { formatNumberToString } from '@/utils';
import { Trash2 } from 'lucide-react';
import React from 'react';
import type { EditMode } from '../types';

interface AdvancedFormProps {
  editMode: EditMode;
  onFieldChange: (key: keyof EditMode, value: any) => void;
  onIndividualSetAdd: () => void;
  onIndividualSetRemove: (index: number) => void;
  onIndividualSetUpdate: (index: number, field: 'weight' | 'reps', value: number) => void;
}

export const AdvancedForm: React.FC<AdvancedFormProps> = ({
  editMode,
  onFieldChange,
  onIndividualSetAdd,
  onIndividualSetRemove,
  onIndividualSetUpdate
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm text-gray-400">Series individuales</label>
        <button
          onClick={onIndividualSetAdd}
          className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
        >
          + Añadir serie
        </button>
      </div>

      <div className="space-y-2 mb-4">
        {editMode.individualSets.map((set, index) => (
          <div key={index} className="grid grid-cols-3 gap-2 p-3 rounded-lg">
            <div>
              <label className="text-xs text-gray-400">Peso (kg)</label>
              <Input
                type="number"
                value={set.weight}
                onChange={(e) => onIndividualSetUpdate(index, 'weight', Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Repeticiones</label>
              <Input
                type="number"
                value={set.reps}
                onChange={(e) => onIndividualSetUpdate(index, 'reps', Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => onIndividualSetRemove(index)}
                className="w-full px-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-400">Fecha</label>
          <Input
            type="date"
            value={editMode.date.toISOString().split('T')[0]}
            onChange={(e) => onFieldChange('date', new Date(e.target.value))}
            className="mt-1"
          />
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>Series: {editMode.individualSets.length}</span>
          <span>Reps totales: {editMode.individualSets.reduce((sum, set) => sum + set.reps, 0)}</span>
          <span>Volumen: {formatNumberToString(editMode.individualSets.reduce((sum, set) => sum + (set.weight * set.reps), 0))} kg</span>
        </div>
      </div>
    </div>
  );
}; 