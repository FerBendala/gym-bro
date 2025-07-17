import { AlertTriangle, Settings, Wifi, WifiOff, X } from 'lucide-react';
import React, { useState } from 'react';
import { useModalOverflow, useOnlineStatus } from '../../hooks';
import type { DayOfWeek, Exercise } from '../../interfaces';
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

  // Hook para manejar overflow del body - el modal siempre está "abierto" cuando se renderiza
  useModalOverflow(true);

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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Configuración de tabs
  const tabs: { id: AdminPanelTab; label: string; }[] = [
    { id: 'exercises', label: 'Ejercicios' },
    { id: 'assignments', label: 'Asignaciones' }
  ];

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden transform transition-all duration-300">
        {/* Header mejorado con gradiente */}
        <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border-b border-gray-700/50">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
          <div className="relative p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {/* Icono del panel */}
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200">
                  <Settings className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-1 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Administración de Ejercicios
                  </h3>
                  <p className="text-lg text-blue-300 font-medium mb-2">
                    Gestiona tus ejercicios y asignaciones
                  </p>

                  {/* Indicador de conexión mejorado */}
                  <div className="flex items-center space-x-2">
                    {isOnline ? (
                      <div className="flex items-center space-x-1 text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full border border-green-400/30">
                        <Wifi className="w-3 h-3" />
                        <span>En línea</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded-full border border-red-400/30">
                        <WifiOff className="w-3 h-3" />
                        <span>Sin conexión</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón de cerrar mejorado */}
              <button
                onClick={onClose}
                className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 backdrop-blur-sm border border-gray-600/30 hover:border-gray-500/50 hover:shadow-lg hover:scale-105"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
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

        {/* Tabs Navigation mejorada */}
        <div className="border-b border-gray-700/50 bg-gray-800/30">
          <div className="flex space-x-1 px-6 py-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content responsive */}
        <div className="overflow-y-auto max-h-[calc(95vh-200px)] p-6 space-y-6">
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-700/30 rounded-xl border border-gray-600/30 p-5 hover:border-gray-500/50 transition-colors duration-200">
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

        {/* Footer con gradiente sutil y efecto shimmer */}
        <div className="h-2 bg-gradient-to-r from-blue-500/20 via-purple-500/30 to-blue-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse" />
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

// Exportar el nuevo componente AdminPanelPage (página completa)
export { AdminPanelPage } from './admin-panel-page';

// Exportar tipos
export type * from './types';
