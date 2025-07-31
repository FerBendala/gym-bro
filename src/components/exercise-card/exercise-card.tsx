import { Bookmark, ClipboardList, Info, Play, WifiOff } from 'lucide-react';
import React from 'react';

import { ExerciseModal } from './components';
import { LastWorkoutSummary } from './components/last-workout-summary';
import { useExerciseCard } from './hooks';
import type { ExerciseCardProps } from './types';

import { Card, CardContent } from '@/components/card';
import { URLPreview } from '@/components/url-preview';
import type { WorkoutFormData, WorkoutFormDataAdvanced, WorkoutRecord } from '@/interfaces';
import { getCategoryColor, getCategoryIcon } from '@/utils';

/**
 * Componente principal del ExerciseCard
 * Orquesta los subcomponentes y maneja la lógica principal
 */
interface ExerciseCardWithRecordsProps extends ExerciseCardProps {
  workoutRecords: WorkoutRecord[];
}

export const ExerciseCard: React.FC<ExerciseCardWithRecordsProps> = ({
  assignment,
  onRecord,
  disabled = false,
  isTrainedToday = false,
  workoutRecords,
  onGoToHistory,
}) => {
  const {
    showModal,
    loading,
    showPreview,
    toggleModal,
    setShowPreview,
    handleSubmit,
    resetModal,
    formMethods,
    advancedFormMethods,
    lastRecord,
    lastWorkoutSeries,
  } = useExerciseCard(assignment.exerciseId, assignment.exercise, workoutRecords);

  const onSubmitForm = async (data: WorkoutFormData | WorkoutFormDataAdvanced) => {
    await handleSubmit(assignment.id, data, onRecord);
  };

  const primaryCategory = assignment.exercise?.categories?.[0] || 'Pecho';
  const colorGradient = getCategoryColor(primaryCategory);
  const CategoryIcon = getCategoryIcon(primaryCategory);

  const handleCardClick = () => {
    if (!disabled) {
      toggleModal();
    }
  };

  const [showDescription, setShowDescription] = React.useState(false);

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (assignment.exercise?.url) {
      setShowPreview(true);
    }
  };

  const handleDescriptionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDescription(!showDescription);
  };

  return (
    <>
      <Card
        className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer ${isTrainedToday
          ? 'border-green-500/50 shadow-sm shadow-green-500/20 bg-gradient-to-r from-gray-800/90 to-gray-900/90'
          : 'bg-gradient-to-r from-gray-800/50 to-gray-900/70 border-gray-700/50 hover:border-gray-600/50'
          } ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:scale-[1.02]'}`}
        onClick={handleCardClick}
        asButton={false}
      >
        {/* Indicador visual de categoría */}
        <div className={`absolute top-0 left-0 w-full h-4 bg-gradient-to-r ${colorGradient}`} />

        {/* Indicador de entrenamiento completado */}
        {isTrainedToday && (
          <div className="absolute -top-1.5 right-5">
            <Bookmark className="w-10 h-10 text-green-400 fill-green-400" />
          </div>
        )}

        <CardContent className="px-1 pt-5 flex flex-col gap-1">
          {/* Título y categorías en la parte superior */}
          <div className="flex items-start space-x-3 mb-3">
            {/* Icono con gradiente por categoría - más grande */}
            <div className={`p-3 rounded-xl bg-gradient-to-br ${colorGradient} flex-shrink-0 shadow-lg`}>
              <CategoryIcon className="w-5 h-5 text-white" />
            </div>

            {/* Título y categorías en columna */}
            <div className="flex-1 min-w-0">
              {/* Categorías encima del título */}
              {assignment.exercise?.categories && assignment.exercise.categories.length > 0 && (
                <div className="flex items-center space-x-2 mb-1">
                  {assignment.exercise.categories.map((category) => (
                    <span
                      key={category}
                      className={`inline-flex items-center text-xs text-white bg-gradient-to-r ${getCategoryColor(category)} px-1.5 py-0.5 rounded-full font-medium shadow-sm border border-white/20`}
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}

              {/* Título debajo de las categorías - más pequeño */}
              <h3 className="text-base font-semibold text-white leading-tight truncate text-justify">
                {assignment.exercise?.name || 'Ejercicio'}
              </h3>
            </div>
          </div>

          {/* Contenido principal en layout horizontal */}
          <div className="flex items-center justify-between space-x-4 w-full">
            {/* Sección de información del último entrenamiento */}
            <div className="flex-shrink-0 text-right">
              <LastWorkoutSummary record={lastRecord} compact />
            </div>

            {/* Sección de acciones */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Warning de conexión */}
              {disabled && (
                <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                  <WifiOff className="w-4 h-4 text-red-400" />
                </div>
              )}

              {/* Botón de historial */}
              {onGoToHistory && assignment.exercise && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onGoToHistory(assignment.exerciseId, assignment.exercise!.name);
                  }}
                  title={`Ver historial de ${assignment.exercise.name}`}
                  className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 transition-all duration-200 hover:scale-105"
                >
                  <ClipboardList className="w-4 h-4 text-purple-400" />
                </button>
              )}

              {/* Botón de descripción (solo si existe descripción) */}
              {assignment.exercise?.description && (
                <button
                  onClick={handleDescriptionClick}
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
              {assignment.exercise?.url && (
                <button
                  onClick={handleVideoClick}
                  title="Ver video del ejercicio"
                  className="p-2 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 transition-all duration-200 hover:scale-105"
                >
                  <Play className="w-4 h-4 text-orange-400" />
                </button>
              )}
            </div>
          </div>

          {/* Descripción del ejercicio con animación */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showDescription && assignment.exercise?.description ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
            {assignment.exercise?.description && (
              <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-200 leading-relaxed">
                  {assignment.exercise.description}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal para registro de entrenamiento */}
      <ExerciseModal
        isOpen={showModal}
        onClose={resetModal}
        assignment={assignment}
        loading={loading}
        onSubmit={onSubmitForm}
        formMethods={formMethods}
        advancedFormMethods={advancedFormMethods}
        lastWorkoutSeries={lastWorkoutSeries}
      />

      {/* Modal de vista previa completa - solo se renderiza cuando se necesita */}
      {showPreview && assignment.exercise?.url && (
        <URLPreview
          url={assignment.exercise.url}
          showFullPreview={true}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
};
