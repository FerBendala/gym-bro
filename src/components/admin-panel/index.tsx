import { AlertTriangle, Wifi, WifiOff, X } from 'lucide-react';
import React, { useState } from 'react';
import { THEME_CONTAINERS, THEME_RESPONSIVE, THEME_TABS } from '../../constants/theme';
import { useOnlineStatus } from '../../hooks';
import type { DayOfWeek, Exercise } from '../../interfaces';
import { cn } from '../../utils/functions';
import { Button } from '../button';
import { URLPreview } from '../url-preview';
import {
  ExerciseAssignments,
  ExerciseForm,
  ExerciseList
} from './components';
import { useAdminData } from './hooks';
import type { AdminPanelProps, AdminPanelTab } from './types';

/**
 * Panel de administración responsive con sistema de tabs
 * Optimizado para móvil con modal bottom-sheet mejorado
 */
export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
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
    <div className={THEME_CONTAINERS.modal.overlay}>
      <div className={THEME_CONTAINERS.modal.container}>
        {/* Header responsive */}
        <div className={THEME_CONTAINERS.modal.header}>
          <div className="flex items-center space-x-3">
            <h2 className={cn(
              THEME_RESPONSIVE.typography.h2.mobile,
              THEME_RESPONSIVE.typography.h2.tablet,
              THEME_RESPONSIVE.typography.h2.weight,
              'text-white'
            )}>
              Administración de Ejercicios
            </h2>
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
          <Button
            variant="ghost"
            onClick={onClose}
            className={cn(
              THEME_RESPONSIVE.touch.minTarget,
              'md:min-h-auto md:min-w-auto'
            )}
          >
            <X className="w-5 h-5 md:w-4 md:h-4" />
          </Button>
        </div>

        {!isOnline && (
          <div className="bg-yellow-900/20 border-b border-yellow-700 p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <p className="text-yellow-400 text-sm">
                Sin conexión a internet. Las funciones de administración están deshabilitadas.
              </p>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="border-b border-gray-700 bg-gray-800/50">
          <div className="flex space-x-1 px-6 py-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  THEME_TABS.tab.base,
                  activeTab === tab.id
                    ? THEME_TABS.variants.default.active
                    : THEME_TABS.variants.default.inactive
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content responsive */}
        <div className={THEME_CONTAINERS.modal.content}>
          <div className={cn(
            THEME_RESPONSIVE.spacing.section.mobile,
            THEME_RESPONSIVE.spacing.section.tablet,
            'space-y-6 sm:space-y-8'
          )}>
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
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
                exercises={exercises}
                assignments={assignments}
                isOnline={isOnline}
                loading={loading}
                onCreateAssignment={handleCreateAssignment}
                onDeleteAssignment={handleDeleteAssignment}
                onPreviewUrl={handlePreviewUrl}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal de vista previa completa */}
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