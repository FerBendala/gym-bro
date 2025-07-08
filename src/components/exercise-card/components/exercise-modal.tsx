import { Calendar, Dumbbell, Target, TrendingUp, X, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatNumber } from '../../../utils/functions';
import type { ExerciseModalProps } from '../types';
import { ExerciseCardForm } from './exercise-card-form';

/**
 * Modal para registro de ejercicios con diseño moderno y atractivo
 * Incluye información del último entrenamiento y formulario mejorado
 * Renderizado usando Portal para evitar problemas de posicionamiento
 */
export const ExerciseModal: React.FC<ExerciseModalProps> = ({
  isOpen,
  onClose,
  assignment,
  loading,
  onSubmit,
  formMethods,
  advancedFormMethods,
  lastRecord
}) => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  // Crear o encontrar el contenedor del portal una sola vez
  useEffect(() => {
    let container = document.getElementById('modal-root');

    if (!container) {
      container = document.createElement('div');
      container.id = 'modal-root';
      document.body.appendChild(container);
    }

    setPortalContainer(container);

    // Cleanup: no remover el contenedor ya que puede ser usado por otros modales
    return () => {
      // Solo limpiar si es necesario, pero mantener el contenedor
    };
  }, []);

  // No renderizar nada si el modal no está abierto o no hay contenedor
  if (!isOpen || !portalContainer) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFormSubmit = async (data: any) => {
    await onSubmit(data);
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden transform transition-all duration-300">
        {/* Header mejorado con gradiente */}
        <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border-b border-gray-700/50">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
          <div className="relative p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {/* Icono del ejercicio */}
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-1 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Nuevo Entrenamiento
                  </h3>
                  <p className="text-lg text-blue-300 font-medium mb-2">
                    {assignment.exercise?.name || 'Ejercicio'}
                  </p>

                  {/* Categorías mejoradas */}
                  {assignment.exercise?.categories && assignment.exercise.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {assignment.exercise.categories.map((category: string) => (
                        <span
                          key={category}
                          className="text-xs text-blue-200 bg-blue-500/20 px-3 py-1.5 rounded-full font-medium border border-blue-400/30 backdrop-blur-sm hover:bg-blue-500/30 transition-colors duration-200"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
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

        {/* Contenido principal */}
        <div className="overflow-y-auto max-h-[70vh] p-6 space-y-6">
          {/* Descripción del ejercicio */}
          {assignment.exercise?.description && (
            <div className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl border border-gray-600/30 hover:border-gray-500/50 transition-colors duration-200">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Descripción</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {assignment.exercise.description}
              </p>
            </div>
          )}

          {/* Resumen del último entrenamiento mejorado */}
          {lastRecord && (
            <div className="bg-gradient-to-r from-green-900/20 via-green-800/20 to-green-900/20 rounded-xl border border-green-700/30 p-5 hover:border-green-600/50 transition-all duration-200 hover:shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">Último Entrenamiento</h4>
                  <p className="text-sm text-green-300">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {lastRecord.date.toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-800/20 rounded-lg border border-green-700/30 hover:bg-green-700/30 transition-colors duration-200">
                  <div className="flex items-center justify-center mb-1">
                    <Zap className="w-4 h-4 text-green-400 mr-1" />
                  </div>
                  <p className="text-lg font-bold text-green-300">
                    {formatNumber(lastRecord.weight)} kg
                  </p>
                  <p className="text-xs text-green-400">Peso</p>
                </div>

                <div className="text-center p-3 bg-green-800/20 rounded-lg border border-green-700/30 hover:bg-green-700/30 transition-colors duration-200">
                  <div className="flex items-center justify-center mb-1">
                    <Target className="w-4 h-4 text-green-400 mr-1" />
                  </div>
                  <p className="text-lg font-bold text-green-300">
                    {lastRecord.reps}
                  </p>
                  <p className="text-xs text-green-400">Reps</p>
                </div>

                <div className="text-center p-3 bg-green-800/20 rounded-lg border border-green-700/30 hover:bg-green-700/30 transition-colors duration-200">
                  <div className="flex items-center justify-center mb-1">
                    <Dumbbell className="w-4 h-4 text-green-400 mr-1" />
                  </div>
                  <p className="text-lg font-bold text-green-300">
                    {lastRecord.sets}
                  </p>
                  <p className="text-xs text-green-400">Series</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-green-700/30">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-sm text-green-300 font-medium">
                    <strong>Volumen Total:</strong> {formatNumber(lastRecord.weight * lastRecord.reps * lastRecord.sets)} kg
                  </p>
                </div>
              </div>
            </div>
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

        {/* Footer con gradiente sutil y efecto shimmer */}
        <div className="h-2 bg-gradient-to-r from-blue-500/20 via-purple-500/30 to-blue-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse" />
        </div>
      </div>
    </div>
  );

  // Usar createPortal para renderizar fuera del flujo normal del DOM
  return createPortal(modalContent, portalContainer);
}; 