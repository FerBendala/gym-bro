
import { Dumbbell } from 'lucide-react';
import React from 'react';

import { EXERCISE_CARD_CONSTANTS } from '../constants';
import type { ExerciseModalProps } from '../types';
import { exerciseCardUtils } from '../utils';

import { ExerciseCardForm } from './exercise-card-form';
import { LastWorkoutSection } from './last-workout-section';

import { BaseModal } from '@/components/modal';
import type { WorkoutFormData, WorkoutFormDataAdvanced } from '@/interfaces';

/**
 * Modal para registro de ejercicios con diseño compacto y eficiente
 * Incluye información del último entrenamiento y formulario optimizado
 */
export const ExerciseModal: React.FC<ExerciseModalProps> = ({
  isOpen,
  onClose,
  assignment,
  loading,
  onSubmit,
  formMethods,
  advancedFormMethods,
  lastWorkoutSeries = [],
}) => {
  const handleFormSubmit = async (data: WorkoutFormData | WorkoutFormDataAdvanced) => {
    await onSubmit(data);
    onClose();
  };

  const expandedSeries = exerciseCardUtils.expandWorkoutSeries(lastWorkoutSeries);
  const lastWorkoutStats = exerciseCardUtils.calculateLastWorkoutStats(lastWorkoutSeries);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Entrenamiento"
      subtitle={assignment.exercise?.name || 'Ejercicio'}
      icon={Dumbbell}
      portalId={EXERCISE_CARD_CONSTANTS.MODAL.portalId}
      maxWidth="5xl"
    >
      <div className="p-4 space-y-4">
        {/* Resumen del último entrenamiento - más compacto */}
        {expandedSeries.length > 0 && lastWorkoutStats && (
          <LastWorkoutSection
            expandedSeries={expandedSeries}
            lastWorkoutStats={lastWorkoutStats}
          />
        )}

        {/* Formulario principal - más compacto */}
        <div className="bg-gradient-to-br from-gray-800/30 to-gray-700/30 rounded-lg border border-gray-600/30 p-4 hover:border-gray-500/50 transition-colors duration-200">
          <div className="flex items-center space-x-2 mb-3">
            <div className="p-1.5 bg-blue-500/20 rounded-lg">
              <Dumbbell className="w-4 h-4 text-blue-400" />
            </div>
            <h4 className="text-base font-semibold text-white">Registrar Entrenamiento</h4>
          </div>

          <ExerciseCardForm
            loading={loading}
            onSubmit={handleFormSubmit}
            onCancel={onClose}
            formMethods={formMethods}
            advancedFormMethods={advancedFormMethods}
          />
        </div>
      </div>
    </BaseModal>
  );
};
