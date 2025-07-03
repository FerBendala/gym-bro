import { Move, Plus } from 'lucide-react';
import React from 'react';
import { Button } from '../../button';
import { ConnectionIndicator } from '../../connection-indicator';
import type { ExerciseListHeaderProps } from '../types';

/**
 * Header del ExerciseList con título del día, estado de conexión y botón configurar
 */
export const ExerciseListHeader: React.FC<ExerciseListHeaderProps> = ({
  dayOfWeek,
  isOnline,
  onOpenAdmin,
  hasExercises = false
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        <h2 className="text-xl font-bold text-white capitalize">
          {dayOfWeek}
        </h2>
        <ConnectionIndicator isOnline={isOnline} />

        {/* Tooltip de drag and drop */}
        {hasExercises && (
          <div className="flex items-center space-x-2 text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-lg">
            <Move className="w-3 h-3" />
            <span className="hidden sm:inline">Arrastra para reordenar</span>
            <span className="sm:hidden">Arrastra</span>
          </div>
        )}
      </div>
      <Button onClick={onOpenAdmin} variant="secondary" size="sm">
        <Plus className="w-4 h-4 mr-2" />
        Configurar
      </Button>
    </div>
  );
}; 