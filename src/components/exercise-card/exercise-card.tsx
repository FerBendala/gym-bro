import React from 'react';

import { ExerciseCardActions, ExerciseCardDescription, ExerciseCardHeader, ExerciseCardIndicators, ExerciseModal, LastWorkoutSummary } from './components';
import { useExerciseCard } from './hooks';
import type { ExerciseCardProps } from './types';

import { Card, CardContent } from '@/components/card';
import { URLPreview } from '@/components/url-preview';
import type { WorkoutFormData, WorkoutFormDataAdvanced, WorkoutRecord } from '@/interfaces';

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
        <ExerciseCardIndicators primaryCategory={primaryCategory} isTrainedToday={isTrainedToday} />

        <CardContent className="px-1 pt-5 flex flex-col gap-1">
          <ExerciseCardHeader exercise={assignment.exercise || { name: 'Ejercicio' }} />

          {/* Contenido principal en layout horizontal */}
          <div className="flex items-center justify-between space-x-4 w-full">
            {/* Sección de información del último entrenamiento */}
            <div className="flex-shrink-0 text-right">
              <LastWorkoutSummary record={lastRecord} compact />
            </div>

            {/* Sección de acciones */}
            <ExerciseCardActions
              disabled={disabled}
              exercise={assignment.exercise}
              onGoToHistory={onGoToHistory}
              exerciseId={assignment.exerciseId}
              onVideoClick={handleVideoClick}
              onDescriptionClick={handleDescriptionClick}
              showDescription={showDescription}
            />
          </div>

          <ExerciseCardDescription
            description={assignment.exercise?.description}
            showDescription={showDescription}
          />
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
