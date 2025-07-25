import { Input } from '@/components/input';
import type { EditMode } from '@/pages/workout-history/types';
import React from 'react';

interface SimpleFormProps {
  editMode: EditMode;
  onFieldChange: (key: keyof EditMode, value: any) => void;
}

export const SimpleForm: React.FC<SimpleFormProps> = ({
  editMode,
  onFieldChange
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div>
        <label className="text-sm text-gray-400">Peso (kg)</label>
        <Input
          type="number"
          value={editMode.weight}
          onChange={(e) => onFieldChange('weight', Number(e.target.value))}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm text-gray-400">Repeticiones</label>
        <Input
          type="number"
          value={editMode.reps}
          onChange={(e) => onFieldChange('reps', Number(e.target.value))}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm text-gray-400">Series</label>
        <Input
          type="number"
          value={editMode.sets}
          onChange={(e) => onFieldChange('sets', Number(e.target.value))}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm text-gray-400">Fecha</label>
        <Input
          type="date"
          value={editMode.date.toISOString().split('T')[0]}
          onChange={(e) => onFieldChange('date', new Date(e.target.value))}
          className="mt-1"
        />
      </div>
    </div>
  );
}; 