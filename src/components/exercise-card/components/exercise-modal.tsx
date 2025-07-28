import { useModalOverflow } from '@/hooks';
import type { WorkoutFormData, WorkoutFormDataAdvanced } from '@/interfaces';

import { Dumbbell } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { EXERCISE_CARD_CONSTANTS } from '../constants';
import type { ExerciseModalProps } from '../types';
import { exerciseCardUtils } from '../utils';
import { ExerciseCardForm } from './exercise-card-form';
import { LastWorkoutSection } from './last-workout-section';
import { ModalHeader } from './modal-header';

/**
 * Modal para registro de ejercicios con diseño moderno y atractivo
 * Incluye información del último entrenamiento y formulario mejorado
 */
export const ExerciseModal: React.FC<ExerciseModalProps> = ({
  isOpen,
  onClose,
  assignment,
  loading,
  onSubmit,
  formMethods,
  advancedFormMethods,
  lastWorkoutSeries = []
}) => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useModalOverflow(isOpen);

  useEffect(() => {
    let container = document.getElementById(EXERCISE_CARD_CONSTANTS.MODAL.portalId);
    if (!container) {
      container = document.createElement('div');
      container.id = EXERCISE_CARD_CONSTANTS.MODAL.portalId;
      document.body.appendChild(container);
    }
    setPortalContainer(container);
  }, []);

  if (!isOpen || !portalContainer) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleFormSubmit = async (data: WorkoutFormData | WorkoutFormDataAdvanced) => {
    await onSubmit(data);
    onClose();
  };

  const expandedSeries = exerciseCardUtils.expandWorkoutSeries(lastWorkoutSeries);
  const lastWorkoutStats = exerciseCardUtils.calculateLastWorkoutStats(lastWorkoutSeries);

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4" onClick={handleBackdropClick}>
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden transform transition-all duration-300">
        <ModalHeader
          assignment={assignment}
          onClose={onClose}
        />

        {/* Contenido principal */}
        <div className="overflow-y-auto max-h-[70vh] p-6 space-y-6">
          {/* Resumen del último entrenamiento */}
          {expandedSeries.length > 0 && lastWorkoutStats && (
            <LastWorkoutSection
              expandedSeries={expandedSeries}
              lastWorkoutStats={lastWorkoutStats}
            />
          )}

          {/* Formulario principal */}
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-700/30 rounded-xl border border-gray-600/30 p-5 hover:border-gray-500/50 transition-colors duration-200">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Dumbbell className="w-5 h-5 text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold text-white">Registrar Nuevo Entrenamiento</h4>
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

        {/* Footer */}
        <div className="h-2 bg-gradient-to-r from-blue-500/20 via-purple-500/30 to-blue-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse" />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, portalContainer);
}; 