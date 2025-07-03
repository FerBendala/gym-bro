import { Dumbbell, ExternalLink, Plus, WifiOff } from 'lucide-react';
import React from 'react';
import { Button } from '../../button';
import type { ExerciseCardHeaderProps } from '../types';

/**
 * Header del ExerciseCard con título, categoría y botones de acción
 */
export const ExerciseCardHeader: React.FC<ExerciseCardHeaderProps> = ({
  assignment,
  disabled,
  showForm,
  onToggleForm,
  onShowPreview
}) => {
  return (
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Dumbbell className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">
            {assignment.exercise?.name || 'Ejercicio'}
          </h3>
          {assignment.exercise?.category && (
            <p className="text-sm text-gray-400">{assignment.exercise.category}</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {disabled && (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        {assignment.exercise?.url && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowPreview}
            className="flex-shrink-0"
            title="Ver referencia"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleForm}
          className="flex-shrink-0"
          disabled={disabled}
        >
          <Plus className={`w-4 h-4 transition-transform ${showForm ? 'rotate-45' : ''}`} />
        </Button>
      </div>
    </div>
  );
}; 