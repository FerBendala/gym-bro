import { deleteExercise } from '@/api/services';
import type { Exercise } from '@/interfaces';
import { useAdminStore } from '@/stores/admin';
import { useOnlineStatus } from '@/stores/connection-store';
import { useNotification } from '@/stores/notification-store';
import { Edit2, Trash2 } from 'lucide-react';
import React from 'react';
import { Button } from '../../button';
import { URLPreview } from '../../url-preview';

interface ExerciseItemProps {
  exercise: Exercise;
  onPreviewUrl: (url: string) => void;
}

export const ExerciseItem: React.FC<ExerciseItemProps> = ({
  exercise,
  onPreviewUrl
}) => {
  const isOnline = useOnlineStatus();
  const { showNotification } = useNotification();

  const {
    setEditingExercise,
    setTab,
    setLoading,
    setError,
    removeExerciseFromStore
  } = useAdminStore();

  const handleEditExercise = () => {
    setEditingExercise(exercise);
    setTab('exercises');
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
    } catch (error: any) {
      const message = error.message || 'Error al eliminar el ejercicio';
      setError('exercises', message);
      showNotification(message, 'error');
    } finally {
      setLoading('deleting', false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700/50 hover:border-gray-600/70 transition-all duration-200">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h4 className="text-white font-medium truncate">{exercise.name}</h4>
            {exercise.categories && exercise.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {exercise.categories.map((category) => (
                  <span
                    key={category}
                    className="text-xs text-blue-300 bg-blue-500/15 px-2 py-1 rounded-full font-medium border border-blue-500/20"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
            {exercise.description && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{exercise.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditExercise}
              disabled={!isOnline}
              title="Editar ejercicio"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteExercise}
              disabled={!isOnline}
              title="Eliminar ejercicio"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Vista previa de URL del ejercicio */}
        {exercise.url && (
          <URLPreview
            url={exercise.url}
            onClick={() => onPreviewUrl(exercise.url!)}
          />
        )}
      </div>
    </div>
  );
}; 