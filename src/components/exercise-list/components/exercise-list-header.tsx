import { Move, Plus } from 'lucide-react';
import React from 'react';

import type { ExerciseListHeaderProps } from '../types';

import { ConnectionIndicator } from '@/components/connection-indicator';

/**
 * Header del ExerciseList con título del día, estado de conexión y botón configurar
 */
export const ExerciseListHeader: React.FC<ExerciseListHeaderProps> = ({
  dayOfWeek,
  isOnline,
  onOpenAdmin,
  hasExercises = false,
  isDragModeActive = false,
  onToggleDragMode,
}) => {
  return (
    <div className="flex items-center justify-between mb-6 mt-8">
      <div className="flex items-center space-x-3">
        <div className="flex flex-col space-y-2">
          <h2 className="text-xl font-bold text-white capitalize">
            {dayOfWeek}
          </h2>
          <div className="flex items-center space-x-4">
            <ConnectionIndicator isOnline={isOnline} />
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center space-x-2">
        {/* Botón Arrastrar - solo visible cuando hay ejercicios */}
        {hasExercises && onToggleDragMode && (
          <button
            onClick={onToggleDragMode}
            className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm ${isDragModeActive
              ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white focus:ring-gray-500'
            }`}
            title={isDragModeActive ? 'Desactivar modo arrastrar' : 'Activar modo arrastrar para reordenar ejercicios'}
          >
            <div className="flex items-center space-x-2">
              <Move className="w-4 h-4" />
              <span className="font-medium text-sm">
                {isDragModeActive ? 'Desactivar' : 'Arrastrar'}
              </span>
            </div>
          </button>
        )}

        {/* Botón Añadir Ejercicio */}
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
    </div>
  );
};
