import { deleteExerciseAssignment } from '@/api/services';
import type { ExerciseAssignment } from '@/interfaces';
import { useAdminStore } from '@/stores/admin';
import { useOnlineStatus } from '@/stores/connection';
import { useNotification } from '@/stores/notification';
import { Trash2 } from 'lucide-react';
import React from 'react';
import { Button } from '../../button';
import { URLPreview } from '../../url-preview';

interface AssignmentItemProps {
  assignment: ExerciseAssignment;
  onPreviewUrl: (url: string) => void;
}

export const AssignmentItem: React.FC<AssignmentItemProps> = ({
  assignment,
  onPreviewUrl
}) => {
  const isOnline = useOnlineStatus();
  const { showNotification } = useNotification();

  const {
    setLoading,
    setError,
    removeAssignmentFromStore
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
    } catch (error: any) {
      const message = error.message || 'Error al eliminar la asignación';
      setError('assignments', message);
      showNotification(message, 'error');
    } finally {
      setLoading('deleting', false);
    }
  };

  return (
    <div className="bg-gray-800 p-3 rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-medium">
            {assignment.exercise?.name || 'Ejercicio no encontrado'}
          </p>
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
        <Button
          variant="danger"
          size="sm"
          onClick={handleDeleteAssignment}
          disabled={!isOnline}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Vista previa de URL en asignaciones */}
      {assignment.exercise?.url && (
        <URLPreview
          url={assignment.exercise.url}
          onClick={() => onPreviewUrl(assignment.exercise!.url!)}
          className="mt-2"
        />
      )}
    </div>
  );
}; 