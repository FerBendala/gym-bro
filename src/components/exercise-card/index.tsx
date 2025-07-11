import { WifiOff } from 'lucide-react';
import React from 'react';
import type { WorkoutRecord } from '../../interfaces';
import { Card, CardContent } from '../card';
import { OfflineWarning } from '../offline-warning';
import { URLPreview } from '../url-preview';
import { ExerciseCardHeader, ExerciseModal } from './components';
import { LastWorkoutSummary } from './components/last-workout-summary';
import { useExerciseCard } from './hooks';
import type { ExerciseCardProps } from './types';

// Colores para cada categoría
const categoryColors: Record<string, string> = {
  'Pecho': 'from-red-500/80 to-pink-500/80',
  'Espalda': 'from-blue-500/80 to-cyan-500/80',
  'Piernas': 'from-green-500/80 to-emerald-500/80',
  'Hombros': 'from-purple-500/80 to-violet-500/80',
  'Brazos': 'from-orange-500/80 to-amber-500/80',
  'Core': 'from-indigo-500/80 to-blue-500/80'
};

/**
 * Componente principal del ExerciseCard
 * Orquesta los subcomponentes y maneja la lógica principal
 * Adaptado con el diseño visual del balance muscular de referencia
 */
interface ExerciseCardWithRecordsProps extends ExerciseCardProps {
  workoutRecords: WorkoutRecord[];
}

export const ExerciseCard: React.FC<ExerciseCardWithRecordsProps> = ({ assignment, onRecord, disabled = false, isTrainedToday = false, workoutRecords }) => {
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

  const onSubmitForm = async (data: any) => {
    await handleSubmit(assignment.id, data, onRecord);
  };

  // Obtener la primera categoría para determinar el color
  const primaryCategory = assignment.exercise?.categories?.[0] || 'Pecho';
  const colorGradient = categoryColors[primaryCategory] || 'from-gray-500/80 to-gray-600/80';

  return (
    <>
      <Card className={`mb-3 relative overflow-hidden transition-all duration-300 hover:shadow-xl ${isTrainedToday
        ? 'border-green-500/50 shadow-lg shadow-green-500/20 bg-gradient-to-br from-gray-800/90 to-gray-900/90'
        : 'bg-gradient-to-br from-gray-800/50 to-gray-900/70 border-gray-700/50 hover:border-gray-600/50'
        }`}>
        {/* Indicador visual de categoría */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colorGradient}`} />

        {/* Indicador de entrenamiento completado */}
        {isTrainedToday && (
          <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
        )}

        <CardContent className="p-4 sm:p-6">
          <ExerciseCardHeader
            assignment={assignment}
            disabled={disabled}
            onToggleModal={toggleModal}
            onShowPreview={() => setShowPreview(true)}
          />

          {assignment.exercise?.description && (
            <p className="text-xs sm:text-sm text-gray-300 mb-3 leading-relaxed bg-gray-800/30 p-2 rounded-lg border border-gray-700/50">
              {assignment.exercise.description}
            </p>
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

          {/* Resumen del último entrenamiento */}
          <LastWorkoutSummary record={lastRecord} />
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
        lastRecord={lastRecord}
        lastWorkoutSeries={lastWorkoutSeries}
      />

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