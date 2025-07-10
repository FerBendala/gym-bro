import { Move, Plus } from 'lucide-react';
import React from 'react';
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
    <div className="flex items-center justify-between mb-6 mt-8">
      <div className="flex items-center space-x-3">
        <div className="flex flex-col space-y-2">
          <h2 className="text-xl font-bold text-white capitalize">
            {dayOfWeek}
          </h2>
          <div className="flex items-center space-x-4">
            {/* Tooltip de drag and drop */}
            {hasExercises && (
              <div className="flex items-center space-x-2 text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-lg">
                <Move className="w-3 h-3" />
                <span className="hidden sm:inline">Arrastra para reordenar</span>
                <span className="sm:hidden">Arrastra</span>
              </div>
            )}
            <ConnectionIndicator isOnline={isOnline} />
          </div>
        </div>
      </div>

      {/* Botón de configurar más visible y atractivo */}
      <button
        onClick={onOpenAdmin}
        className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
      >
        <div className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span className="font-medium text-sm">Añadir Ejercicio</span>
        </div>
      </button>
    </div>
  );
}; 