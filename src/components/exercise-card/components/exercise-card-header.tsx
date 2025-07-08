import { Dumbbell, Plus, WifiOff } from 'lucide-react';
import React from 'react';
import { Button } from '../../button';
import type { ExerciseCardHeaderProps } from '../types';

/**
 * Header del ExerciseCard con título, categorías y botones de acción
 */
export const ExerciseCardHeader: React.FC<ExerciseCardHeaderProps> = ({
  assignment,
  disabled,
  onToggleModal,
  onShowPreview
}) => {
  return (
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center space-x-4">
        <div className="p-1.5 bg-blue-600 rounded-lg flex-shrink-0">
          <Dumbbell className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-semibold text-white leading-tight">
            {assignment.exercise?.name || 'Ejercicio'}
          </h3>
          {assignment.exercise?.categories && assignment.exercise.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {assignment.exercise.categories.map((category) => (
                <span
                  key={category}
                  className="text-xs text-blue-300 bg-blue-500/15 px-1.5 py-0.5 rounded-full font-medium border border-blue-500/20"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-1">
        {disabled && (
          <WifiOff className="w-3.5 h-3.5 text-red-500" />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleModal}
          className="flex-shrink-0 p-1 min-w-0"
          disabled={disabled}
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}; 