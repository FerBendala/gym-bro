import { ExternalLink, Trash2 } from 'lucide-react';
import React from 'react';

import { deleteExerciseAssignment } from '@/api/services';
import { Button } from '@/components/button';
import type { ExerciseAssignment } from '@/interfaces';
import { useAdminStore } from '@/stores/admin';
import { useOnlineStatus } from '@/stores/connection';
import { useNotification } from '@/stores/notification';

interface AssignmentItemProps {
  assignment: ExerciseAssignment;
  onPreviewUrl: (url: string) => void;
}

export const AssignmentItem: React.FC<AssignmentItemProps> = ({
  assignment,
  onPreviewUrl,
}) => {
  const isOnline = useOnlineStatus();
  const { showNotification } = useNotification();

  const {
    setLoading,
    setError,
    removeAssignmentFromStore,
  } = useAdminStore();

  const handleDeleteAssignment = async () => {
    if (!isOnline) {
      showNotification('Sin conexión. No se puede eliminar la asignación.', 'error');
      return;
    }

    setLoading('deleting', true);
    setError('assignments', null);

    try {
      await deleteExerciseAssignment(assignment.id);
      removeAssignmentFromStore(assignment.id);
      showNotification('Asignación eliminada exitosamente', 'success');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al eliminar la asignación';
      setError('assignments', message);
      showNotification(message, 'error');
    } finally {
      setLoading('deleting', false);
    }
  };

  return (
    <div className="bg-gray-800/50 hover:bg-gray-800/70 transition-colors rounded-lg p-3 border border-gray-700/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h4 className="text-sm font-medium text-white truncate flex-1 min-w-0">
              {assignment.exercise?.name || 'Ejercicio no encontrado'}
            </h4>
            {assignment.exercise?.url && (
              <button
                onClick={() => onPreviewUrl(assignment.exercise!.url!)}
                className="text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0"
                title="Ver URL"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {assignment.exercise?.categories && assignment.exercise.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {assignment.exercise.categories.slice(0, 3).map((category) => (
                <span
                  key={category}
                  className="text-xs text-blue-300 bg-blue-500/15 px-1.5 py-0.5 rounded-full font-medium border border-blue-500/20"
                >
                  {category}
                </span>
              ))}
              {assignment.exercise.categories.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{assignment.exercise.categories.length - 3} más
                </span>
              )}
            </div>
          )}
        </div>

        <Button
          variant="danger"
          size="sm"
          onClick={handleDeleteAssignment}
          disabled={!isOnline}
          className="ml-2 flex-shrink-0"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};
