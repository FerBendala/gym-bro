import { Edit2, ExternalLink, Percent, Trash2 } from 'lucide-react';
import React from 'react';

import { deleteExercise } from '@/api/services';
import { Button } from '@/components/button';
import type { Exercise } from '@/interfaces';
import { useAdminStore } from '@/stores/admin';
import { useOnlineStatus } from '@/stores/connection';
import { useNotification } from '@/stores/notification';

interface ExerciseItemProps {
  exercise: Exercise;
  onPreviewUrl: (url: string) => void;
}

export const ExerciseItem: React.FC<ExerciseItemProps> = ({
  exercise,
  onPreviewUrl,
}) => {
  const isOnline = useOnlineStatus();
  const { showNotification } = useNotification();

  const {
    setEditingExercise,
    setTab,
    setLoading,
    setError,
    removeExerciseFromStore,
  } = useAdminStore();

  const handleEditExercise = () => {
    setEditingExercise(exercise);
    setTab('create-exercise');
  };

  const handleDeleteExercise = async () => {
    if (!isOnline) {
      showNotification('Sin conexión. No se puede eliminar el ejercicio.', 'error');
      return;
    }

    setLoading('deleting', true);
    setError('exercises', null);

    try {
      await deleteExercise(exercise.id);
      removeExerciseFromStore(exercise.id);
      showNotification(`Ejercicio "${exercise.name}" eliminado exitosamente`, 'success');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al eliminar el ejercicio';
      setError('exercises', message);
      showNotification(message, 'error');
    } finally {
      setLoading('deleting', false);
    }
  };

  return (
    <div className="bg-gray-800/50 hover:bg-gray-800/70 transition-colors rounded-lg p-3 border border-gray-700/30">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-medium text-white truncate">{exercise.name}</h4>
            {exercise.url && (
              <button
                onClick={() => onPreviewUrl(exercise.url!)}
                className="text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0"
                title="Ver URL"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Mostrar porcentajes de categorías si están disponibles */}
          {exercise.categoryPercentages && Object.keys(exercise.categoryPercentages).length > 0 && (
            <div className="mt-1 flex items-center gap-1">
              <div className="flex flex-wrap gap-1">
                {Object.entries(exercise.categoryPercentages)
                  .sort(([, a], [, b]) => b - a) // Ordenar de mayor a menor
                  .slice(0, 2)
                  .map(([category, percentage]) => (
                    <span
                      key={category}
                      className="text-xs text-green-300 bg-green-500/15 px-1 py-0.5 rounded-full font-medium border border-green-500/20 flex items-center gap-1"
                    >
                      {category}: {percentage}
                      <Percent className="w-3 h-3 text-green-400" />
                    </span>
                  ))}
                {Object.keys(exercise.categoryPercentages).length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{Object.keys(exercise.categoryPercentages).length - 2} más
                  </span>
                )}
              </div>
            </div>
          )}

          {exercise.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{exercise.description}</p>
          )}
        </div>

        <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditExercise}
            disabled={!isOnline}
            title="Editar ejercicio"
            className="p-1"
          >
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDeleteExercise}
            disabled={!isOnline}
            title="Eliminar ejercicio"
            className="p-1"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
