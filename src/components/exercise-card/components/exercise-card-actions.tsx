import { BarChart3, ClipboardList, Info, Play, WifiOff } from 'lucide-react';
import React from 'react';

import { useNavigateTo, useSetNavigationParams } from '@/stores/modern-layout';

interface ExerciseCardActionsProps {
  disabled: boolean;
  exercise?: {
    name: string;
    description?: string;
    url?: string;
  };
  onGoToHistory?: (exerciseId: string, exerciseName: string) => void;
  exerciseId: string;
  onVideoClick: (e: React.MouseEvent) => void;
  onDescriptionClick: (e: React.MouseEvent) => void;
  showDescription: boolean;
}

export const ExerciseCardActions: React.FC<ExerciseCardActionsProps> = ({
  disabled,
  exercise,
  onGoToHistory,
  exerciseId,
  onVideoClick,
  onDescriptionClick,
  showDescription,
}) => {
  const navigateTo = useNavigateTo();
  const setNavigationParams = useSetNavigationParams();

  const handleProgressClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (exercise) {
      // Navegar al dashboard con el ejercicio filtrado
      navigateTo('progress', {
        filteredExercise: exercise.name
      });
    }
  };

  return (
    <div className="flex items-center space-x-2 flex-shrink-0">
      {/* Warning de conexión */}
      {disabled && (
        <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
          <WifiOff className="w-4 h-4 text-red-400" />
        </div>
      )}

      {/* Botón de progreso/análisis */}
      {exercise && (
        <button
          onClick={handleProgressClick}
          title={`Ver progreso de ${exercise.name}`}
          className="p-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 transition-all duration-200 hover:scale-105"
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
        </button>
      )}

      {/* Botón de historial */}
      {onGoToHistory && exercise && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onGoToHistory(exerciseId, exercise.name);
          }}
          title={`Ver historial de ${exercise.name}`}
          className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 transition-all duration-200 hover:scale-105"
        >
          <ClipboardList className="w-4 h-4 text-purple-400" />
        </button>
      )}

      {/* Botón de descripción (solo si existe descripción) */}
      {exercise?.description && (
        <button
          onClick={onDescriptionClick}
          title="Ver descripción del ejercicio"
          className={`p-2 rounded-lg border transition-all duration-200 hover:scale-105 ${showDescription
            ? 'bg-blue-600/30 border-blue-500/50'
            : 'bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/30'
            }`}
        >
          <Info className="w-4 h-4 text-blue-400" />
        </button>
      )}

      {/* Botón de video (solo si existe URL) */}
      {exercise?.url && (
        <button
          onClick={onVideoClick}
          title="Ver video del ejercicio"
          className="p-2 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 transition-all duration-200 hover:scale-105"
        >
          <Play className="w-4 h-4 text-orange-400" />
        </button>
      )}
    </div>
  );
};
