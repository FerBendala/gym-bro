import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import React, { useState } from 'react';
import { MODERN_THEME } from '../../constants/modern-theme';
import { useOnlineStatus } from '../../hooks';
import type { DayOfWeek, Exercise } from '../../interfaces';
import { cn } from '../../utils/functions';
import { OfflineWarning } from '../offline-warning';
import { URLPreview } from '../url-preview';
import {
  ExerciseAssignments,
  ExerciseForm,
  ExerciseList
} from './components';
import { useAdminData } from './hooks';
import type { AdminPanelTab } from './types';

/**
 * Panel de administración como página completa sin modal
 * Optimizado para mobile-first con navegación de tabs moderna
 */
export const AdminPanelPage: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('lunes');
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminPanelTab>('exercises');

  const isOnline = useOnlineStatus();
  const {
    exercises,
    assignments,
    loading,
    handleCreateExercise,
    handleUpdateExercise,
    handleDeleteExercise,
    handleCreateAssignment,
    handleDeleteAssignment,
    loadData
  } = useAdminData(selectedDay, isOnline);

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    // Cambiar automáticamente al tab de ejercicios cuando se edita
    setActiveTab('exercises');
  };

  const handleCancelEdit = () => {
    setEditingExercise(null);
  };

  const handleExerciseSubmit = async (data: any) => {
    if (editingExercise) {
      const success = await handleUpdateExercise(editingExercise.id, data);
      if (success) {
        setEditingExercise(null);
      }
      return success;
    } else {
      return await handleCreateExercise(data);
    }
  };

  const handlePreviewUrl = (url: string) => {
    setPreviewUrl(url);
  };

  // Configuración de tabs
  const tabs: { id: AdminPanelTab; label: string; }[] = [
    { id: 'exercises', label: 'Ejercicios' },
    { id: 'assignments', label: 'Asignaciones' }
  ];

  return (
    <div className="space-y-6">
      {/* Header con estado de conexión */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold text-white">Administración de Ejercicios</h2>
          {/* Indicador de conexión */}
          <div className="flex items-center space-x-1">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-xs ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
              {isOnline ? 'En línea' : 'Sin conexión'}
            </span>
          </div>
        </div>
      </div>

      {/* Warning de conexión */}
      {!isOnline && (
        <OfflineWarning
          message="Sin conexión a internet. Las funciones de administración están deshabilitadas."
          icon={AlertTriangle}
          variant="warning"
        />
      )}

      {/* Navegación de tabs moderna */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200',
                MODERN_THEME.touch.tap,
                MODERN_THEME.accessibility.focusRing,
                activeTab === tab.id
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido de tabs */}
      <div className="space-y-6">
        {/* Tab: Ejercicios */}
        {activeTab === 'exercises' && (
          <>
            {/* Formulario de ejercicio - crear o editar */}
            <ExerciseForm
              isOnline={isOnline}
              loading={loading}
              onSubmit={handleExerciseSubmit}
              exercise={editingExercise || undefined}
              onCancel={editingExercise ? handleCancelEdit : undefined}
              onPreviewUrl={handlePreviewUrl}
            />

            {/* Lista de ejercicios existentes - solo mostrar si no estamos editando */}
            {!editingExercise && (
              <ExerciseList
                exercises={exercises}
                isOnline={isOnline}
                onEditExercise={handleEditExercise}
                onDelete={handleDeleteExercise}
                onPreviewUrl={handlePreviewUrl}
              />
            )}
          </>
        )}

        {/* Tab: Asignaciones */}
        {activeTab === 'assignments' && (
          <ExerciseAssignments
            exercises={exercises}
            assignments={assignments}
            selectedDay={selectedDay}
            isOnline={isOnline}
            loading={loading}
            onSelectDay={setSelectedDay}
            onCreateAssignment={handleCreateAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onPreviewUrl={handlePreviewUrl}
          />
        )}
      </div>

      {/* Modal de vista previa de URL */}
      {previewUrl && (
        <URLPreview
          url={previewUrl}
          showFullPreview={true}
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </div>
  );
}; 