import { WifiOff } from 'lucide-react';
import React from 'react';
import type { WorkoutRecord } from '../../interfaces';
import { Card, CardContent } from '../card';
import { OfflineWarning } from '../offline-warning';
import { URLPreview } from '../url-preview';
import { ExerciseCardForm, ExerciseCardHeader } from './components';
import { LastWorkoutSummary } from './components/last-workout-summary';
import { useExerciseCard } from './hooks';
import type { ExerciseCardProps } from './types';

/**
 * Componente principal del ExerciseCard
 * Orquesta los subcomponentes y maneja la lógica principal
 */
interface ExerciseCardWithRecordsProps extends ExerciseCardProps {
  workoutRecords: WorkoutRecord[];
}

export const ExerciseCard: React.FC<ExerciseCardWithRecordsProps> = ({ assignment, onRecord, disabled = false, isTrainedToday = false, workoutRecords }) => {
  const {
    showForm,
    loading,
    showPreview,
    toggleForm,
    setShowPreview,
    handleSubmit,
    resetForm,
    formMethods,
    advancedFormMethods,
    lastRecord,
  } = useExerciseCard(assignment.exerciseId, assignment.exercise, workoutRecords);

  const onSubmitForm = async (data: any) => {
    await handleSubmit(assignment.id, data, onRecord);
  };

  return (
    <>
      <Card className={`mb-3 ${isTrainedToday && 'border-green-500 border-2 shadow-lg shadow-green-500/20'}`}>
        <CardContent>
          <ExerciseCardHeader
            assignment={assignment}
            disabled={disabled}
            showForm={showForm}
            onToggleForm={toggleForm}
            onShowPreview={() => setShowPreview(true)}
          />

          {assignment.exercise?.description && (
            <p className="text-xs sm:text-sm text-gray-400 mb-2">{assignment.exercise.description}</p>
          )}

          {/* Vista previa de URL */}
          {assignment.exercise?.url && (
            <div className="mb-2">
              <URLPreview
                url={assignment.exercise.url}
                onClick={() => setShowPreview(true)}
              />
            </div>
          )}

          {/* Warning de conexión usando componente genérico */}
          {disabled && (
            <OfflineWarning
              message="Sin conexión. No se pueden registrar entrenamientos."
              icon={WifiOff}
              variant="warning"
            />
          )}

          {/* Resumen del último entrenamiento */}
          <LastWorkoutSummary record={lastRecord} />

          {/* Formulario modular */}
          {showForm && !disabled && (
            <ExerciseCardForm
              loading={loading}
              onSubmit={onSubmitForm}
              onCancel={resetForm}
              formMethods={formMethods}
              advancedFormMethods={advancedFormMethods}
            />
          )}
        </CardContent>
      </Card >

      {/* Modal de vista previa completa */}
      {
        showPreview && assignment.exercise?.url && (
          <URLPreview
            url={assignment.exercise.url}
            showFullPreview={true}
            onClose={() => setShowPreview(false)}
          />
        )
      }
    </>
  );
};