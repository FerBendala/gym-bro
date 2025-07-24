import { useAdminStore } from '@/stores/admin';
import React from 'react';
import type { AdminPanelTab } from '../types';
import { ExerciseAssignments } from './exercise-assignments';
import { ExerciseForm } from './exercise-form';
import { ExerciseList } from './exercise-list';

interface AdminContentProps {
  activeTab: AdminPanelTab;
  isModal?: boolean;
}

export const AdminContent: React.FC<AdminContentProps> = ({
  activeTab,
  isModal = false
}) => {
  // Usar selectores específicos para acceder al estado correctamente
  const editingExercise = useAdminStore((state) => state.adminPanel.editingExercise);
  const setEditingExercise = useAdminStore((state) => state.setEditingExercise);
  const setPreviewUrl = useAdminStore((state) => state.setPreviewUrl);

  const content = (
    <div className="space-y-6">
      {/* Tab: Ejercicios */}
      {activeTab === 'exercises' && (
        <>
          {/* Formulario de ejercicio - crear o editar */}
          <ExerciseForm
            exercise={editingExercise || undefined}
            onCancel={editingExercise ? () => setEditingExercise(null) : undefined}
            onPreviewUrl={setPreviewUrl}
          />

          {/* Lista de ejercicios existentes - solo mostrar si no estamos editando */}
          {!editingExercise && (
            <ExerciseList />
          )}
        </>
      )}

      {/* Tab: Asignaciones */}
      {activeTab === 'assignments' && (
        <ExerciseAssignments />
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="overflow-y-auto max-h-[calc(95vh-200px)] p-6 space-y-6">
        <div className="bg-gradient-to-br from-gray-800/30 to-gray-700/30 rounded-xl border border-gray-600/30 p-5 hover:border-gray-500/50 transition-colors duration-200">
          {content}
        </div>
      </div>
    );
  }

  return content;
}; 