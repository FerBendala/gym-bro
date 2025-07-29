import { Calendar, Dumbbell, TrendingUp } from 'lucide-react';
import React from 'react';

import { EXERCISE_CARD_CONSTANTS } from '../constants';

import { formatNumberToString } from '@/utils';

interface LastWorkoutSectionProps {
  expandedSeries: {
    weight: number;
    reps: number;
    volume: number;
    recordIndex: number;
    setIndex: number;
  }[];
  lastWorkoutStats: {
    totalVolume: number;
    totalSets: number;
    averageWeight: number;
    maxWeight: number;
    date: Date;
  };
}

/**
 * Sección que muestra el resumen del último entrenamiento
 */
export const LastWorkoutSection: React.FC<LastWorkoutSectionProps> = ({
  expandedSeries,
  lastWorkoutStats,
}) => {
  return (
    <div className="bg-gradient-to-r from-green-900/20 via-green-800/20 to-green-900/20 rounded-xl border border-green-700/30 p-5 hover:border-green-600/50 transition-all duration-200 hover:shadow-lg">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <TrendingUp className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white">Último Entrenamiento</h4>
          <p className="text-sm text-green-300">
            <Calendar className="w-4 h-4 inline mr-1" />
            {lastWorkoutStats.date.toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-green-800/20 rounded-lg border border-green-700/30">
          <p className="text-lg font-bold text-green-300">{formatNumberToString(lastWorkoutStats.totalVolume)} {EXERCISE_CARD_CONSTANTS.STATS.volumeUnit}</p>
          <p className="text-xs text-green-400">Volumen Total</p>
        </div>
        <div className="text-center p-3 bg-green-800/20 rounded-lg border border-green-700/30">
          <p className="text-lg font-bold text-green-300">{lastWorkoutStats.totalSets}</p>
          <p className="text-xs text-green-400">Series Totales</p>
        </div>
        <div className="text-center p-3 bg-green-800/20 rounded-lg border border-green-700/30">
          <p className="text-lg font-bold text-green-300">{formatNumberToString(lastWorkoutStats.maxWeight)} {EXERCISE_CARD_CONSTANTS.STATS.volumeUnit}</p>
          <p className="text-xs text-green-400">Peso Máximo</p>
        </div>
      </div>

      {/* Series detalladas */}
      <div className="border-t border-green-700/30 pt-4">
        <h5 className="text-sm font-medium text-green-300 mb-3 flex items-center">
          <Dumbbell className="w-4 h-4 mr-2" />
          Series Realizadas
        </h5>

        <div className="space-y-2 max-h-32 overflow-y-auto">
          {expandedSeries.map((series, index: number) => (
            <div key={`${series.recordIndex}-${series.setIndex}-${index}`} className="flex items-center justify-between p-2 bg-green-800/10 rounded-lg border border-green-700/20">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-medium text-green-400 bg-green-700/30 px-2 py-1 rounded-full min-w-[32px] text-center">
                  S{index + 1}
                </span>
                <div className="text-sm text-green-300">
                  <span className="font-medium">{formatNumberToString(series.weight)} {EXERCISE_CARD_CONSTANTS.STATS.volumeUnit}</span>
                  <span className="text-green-400 mx-1">×</span>
                  <span className="font-medium">{series.reps} reps</span>
                </div>
              </div>
              <div className="text-xs text-green-400 font-medium">
                {formatNumberToString(series.volume)} {EXERCISE_CARD_CONSTANTS.STATS.volumeUnit}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
