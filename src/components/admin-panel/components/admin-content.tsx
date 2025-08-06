import React from 'react';

import type { AdminPanelTab } from '../types';

import { ExerciseAssignments } from './exercise-assignments';
import { ExerciseForm } from './exercise-form';
import { ExerciseList } from './exercise-list';

import { useAdminStore } from '@/stores/admin';

interface AdminContentProps {
  activeTab: AdminPanelTab;
  isModal?: boolean;
}

export const AdminContent: React.FC<AdminContentProps> = ({
  activeTab,
  isModal = false,
}) => {
  // Usar selectores específicos para acceder al estado correctamente
  const editingExercise = useAdminStore((state) => state.adminPanel.editingExercise);
  const setEditingExercise = useAdminStore((state) => state.setEditingExercise);
  const setPreviewUrl = useAdminStore((state) => state.setPreviewUrl);

  const content = (
    <div className="space-y-3 sm:space-y-4 min-w-0 overflow-hidden">
      {/* Tab: Ejercicios Existentes */}
      {activeTab === 'exercises' && (
        <ExerciseList />
      )}

      {/* Tab: Crear/Editar Ejercicio */}
      {activeTab === 'create-exercise' && (
        <ExerciseForm
          exercise={editingExercise || undefined}
          onPreviewUrl={setPreviewUrl}
        />
      )}

      {/* Tab: Asignaciones */}
      {activeTab === 'assignments' && (
        <ExerciseAssignments />
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="overflow-y-auto max-h-[calc(95vh-200px)] p-3 sm:p-4 space-y-3 sm:space-y-4 min-w-0 overflow-hidden">
        {content}
      </div>
    );
  }

  // Para modo página completa, envolver en un contenedor apropiado
  return (
    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 min-w-0 overflow-hidden">
      {content}
    </div>
  );
};
