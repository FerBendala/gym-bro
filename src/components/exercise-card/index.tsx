import { WifiOff } from 'lucide-react';
import React from 'react';
import { Card, CardContent } from '../card';
import { OfflineWarning } from '../offline-warning';
import { URLPreview } from '../url-preview';
import { ExerciseCardForm, ExerciseCardHeader } from './components';
import { useExerciseCard } from './hooks';
import type { ExerciseCardProps } from './types';

/**
 * Componente principal del ExerciseCard
 * Orquesta los subcomponentes y maneja la lógica principal
 */
export const ExerciseCard: React.FC<ExerciseCardProps> = ({ assignment, onRecord, disabled = false, isTrainedToday = false }) => {
  const {
    showForm,
    loading,
    showPreview,
    toggleForm,
    setShowPreview,
    handleSubmit,
    resetForm,
    formMethods,
    advancedFormMethods
  } = useExerciseCard();

  const onSubmitForm = async (data: any) => {
    await handleSubmit(assignment.id, data, onRecord);
  };

  return (
    <>
      <Card className={`mb-4 ${isTrainedToday ? 'border-green-500 border-2 shadow-lg shadow-green-500/20' : ''}`}>
        <CardContent className="p-4">
          <ExerciseCardHeader
            assignment={assignment}
            disabled={disabled}
            showForm={showForm}
            onToggleForm={toggleForm}
            onShowPreview={() => setShowPreview(true)}
          />

          {assignment.exercise?.description && (
            <p className="text-sm text-gray-400 mb-3">{assignment.exercise.description}</p>
          )}

          {/* Vista previa de URL */}
          {assignment.exercise?.url && (
            <div className="mb-3">
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
      </Card>

      {/* Modal de vista previa completa */}
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