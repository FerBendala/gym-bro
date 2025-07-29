import {
  calculateVolume,
  formatRelativeTime,
  formatVolumeToKg,
  getVolumeAdjustmentColor,
  logger,
} from '@/utils';
import { Clock, Dumbbell, Target, Trash2, TrendingUp, Zap } from 'lucide-react';
import React, { useState } from 'react';
import type { WorkoutItemProps } from '../types';

/**
 * Item individual de entrenamiento con diseño mejorado y atractivo
 * Soporta visualización elegante de series individuales con badges
 * Layout responsive optimizado para mejor UX
 * Incluye funcionalidad de eliminación
 */
export const WorkoutItem: React.FC<WorkoutItemProps> = ({ record, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const volume = calculateVolume(record);
  const volumeColor = getVolumeAdjustmentColor(volume);
  const formattedVolume = formatVolumeToKg(volume);
  const relativeTime = formatRelativeTime(record.date);

  const handleDelete = async () => {
    if (!onDelete) return;

    // Confirmar eliminación
    if (!window.confirm('¿Estás seguro de que quieres eliminar este entrenamiento? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(record.id);
    } catch (error) {
      logger.error('Error eliminando entrenamiento:', error as Error, { recordId: record.id }, 'WORKOUT_ITEM');
    } finally {
      setIsDeleting(false);
    }
  };

  // Detectar si tiene series individuales explícitas
  const hasExplicitIndividualSets = record.individualSets && record.individualSets.length > 0;

  // Detectar si probablemente tiene series individuales (para entrenamientos antiguos)
  // Si el peso o reps promedio no son números enteros, probablemente son series diferentes
  const hasInferredIndividualSets = !hasExplicitIndividualSets &&
    record.sets > 1 &&
    (record.weight % 1 !== 0 || record.reps % 1 !== 0);

  const showIndividualSets = hasExplicitIndividualSets || hasInferredIndividualSets;

  // Generar series individuales inferidas si no las tiene explícitas
  const getDisplaySets = () => {
    if (hasExplicitIndividualSets) {
      return record.individualSets!;
    }

    if (hasInferredIndividualSets) {
      // Generar series variadas basadas en el promedio
      const baseSets = [];
      for (let i = 0; i < record.sets; i++) {
        // Variar ligeramente peso y reps para simular series individuales
        const weightVariation = (i - record.sets / 2) * 2.5; // Variación de ±2.5kg por serie
        const repsVariation = i % 2 === 0 ? 1 : -1; // Alternar ±1 rep

        baseSets.push({
          weight: Math.max(0, record.weight + weightVariation),
          reps: Math.max(1, record.reps + repsVariation)
        });
      }
      return baseSets;
    }

    return [];
  };

  const displaySets = getDisplaySets();

  return (
    <div className={`bg-gradient-to-r from-gray-800/50 to-gray-700/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-700/50 hover:border-gray-600/70 transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-800/70 hover:to-gray-700/50 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Header: Ejercicio + Metadata */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <div className="flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-600/30 to-blue-700/20 rounded-xl flex items-center justify-center border border-blue-500/20">
            <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-white font-semibold text-xs sm:text-sm truncate mb-1">
              {record.exercise?.name || 'Ejercicio desconocido'}
            </h4>
            <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap gap-1">
              <span className="flex items-center text-xs text-gray-400 shrink-0">
                <Clock className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">{relativeTime}</span>
                <span className="sm:hidden">{relativeTime.replace('Hace ', '').replace(' minutos', 'min').replace(' horas', 'h')}</span>
              </span>
              {record.exercise?.categories && (
                <span className="text-xs text-blue-300 bg-blue-500/15 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-medium border border-blue-500/20 shrink-0">
                  {record.exercise.categories.join(', ')}
                </span>
              )}
              <span className="text-xs text-gray-500 capitalize font-medium shrink-0">
                {record.dayOfWeek}
              </span>
            </div>
          </div>
        </div>

        {/* Indicador de volumen + botón eliminar */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Volumen */}
          <div className="text-right">
            <div className={`text-xs sm:text-sm font-bold ${volumeColor} mb-1`}>
              {formattedVolume}kg
            </div>
            <div className="text-xs text-gray-400 flex items-center justify-end">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Volumen</span>
              <span className="sm:hidden">Vol</span>
            </div>
          </div>

          {/* Botón eliminar */}
          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="group p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Eliminar entrenamiento"
            >
              <Trash2 className={`w-3 h-3 sm:w-4 sm:h-4 text-red-400 group-hover:text-red-300 transition-colors ${isDeleting ? 'animate-pulse' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Contenido: Series individuales o formato simple */}
      <div className="space-y-2 sm:space-y-3">
        {showIndividualSets ? (
          <div className="space-y-2 sm:space-y-3">
            {/* Series individuales en formato responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
              {displaySets.map((set, setIndex) => (
                <div
                  key={setIndex}
                  className="bg-gradient-to-r from-gray-700/60 to-gray-600/40 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-600/40 hover:border-gray-500/60 transition-all duration-200"
                >
                  {/* Header de la serie */}
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span className="text-xs sm:text-sm font-bold text-gray-200">
                      S{setIndex + 1}
                    </span>
                    <div className="text-xs text-green-400 font-medium">
                      {(set.weight * set.reps).toFixed(0)}kg
                    </div>
                  </div>

                  {/* Contenido en formato horizontal responsive */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                      {/* Peso */}
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <Zap className="w-3 h-3 text-yellow-400" />
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm sm:text-lg font-bold text-white">
                            {set.weight.toFixed(set.weight % 1 === 0 ? 0 : 1)}
                          </span>
                          <span className="text-xs sm:text-sm text-yellow-400">kg</span>
                        </div>
                      </div>

                      {/* Separador */}
                      <span className="text-gray-500 text-sm">×</span>

                      {/* Repeticiones */}
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <Target className="w-3 h-3 text-green-400" />
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm sm:text-lg font-bold text-white">
                            {set.reps}
                          </span>
                          <span className="text-xs sm:text-sm text-green-400">
                            <span className="hidden sm:inline">reps</span>
                            <span className="sm:hidden">r</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Formato simple mejorado */
          <div className="bg-gradient-to-r from-gray-700/40 to-gray-600/30 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-600/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                  </div>
                  <div>
                    <span className="text-sm sm:text-lg font-bold text-white">
                      {record.weight}
                    </span>
                    <span className="text-xs sm:text-sm text-yellow-400 ml-1">kg</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Target className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  </div>
                  <div>
                    <span className="text-sm sm:text-lg font-bold text-white">
                      {record.reps}
                    </span>
                    <span className="text-xs sm:text-sm text-green-400 ml-1">
                      <span className="hidden sm:inline">reps</span>
                      <span className="sm:hidden">r</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-xs sm:text-sm text-blue-400 font-bold">{record.sets}</span>
                  </div>
                  <span className="text-xs sm:text-sm text-blue-400 font-medium">
                    <span className="hidden sm:inline">series</span>
                    <span className="sm:hidden">s</span>
                  </span>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <div className="text-sm text-gray-300 font-medium">
                  {record.weight} × {record.reps} × {record.sets}
                </div>
                <div className="text-xs text-gray-500">
                  = {volume.toFixed(0)}kg total
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 