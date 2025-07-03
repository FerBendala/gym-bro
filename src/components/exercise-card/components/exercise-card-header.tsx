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
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center space-x-2">
        <div className="p-1.5 bg-blue-600 rounded-lg flex-shrink-0">
          <Dumbbell className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-white leading-tight">
            {assignment.exercise?.name || 'Ejercicio'}
          </h3>
          {assignment.exercise?.category && (
            <p className="text-xs text-gray-400">{assignment.exercise.category}</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-1">
        {disabled && (
          <WifiOff className="w-3.5 h-3.5 text-red-500" />
        )}
        {assignment.exercise?.url && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowPreview}
            className="flex-shrink-0 p-1 min-w-0"
            title="Ver referencia"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleForm}
          className="flex-shrink-0 p-1 min-w-0"
          disabled={disabled}
        >
          <Plus className={`w-3.5 h-3.5 transition-transform ${showForm ? 'rotate-45' : ''}`} />
        </Button>
      </div>
    </div>
  );
}; 