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
 * Sección compacta que muestra el resumen del último entrenamiento
 */
export const LastWorkoutSection: React.FC<LastWorkoutSectionProps> = ({
  expandedSeries,
  lastWorkoutStats,
}) => {
  return (
    <div className="bg-gradient-to-r from-green-900/20 via-green-800/20 to-green-900/20 rounded-lg border border-green-700/30 p-3 hover:border-green-600/50 transition-all duration-200">
      <div className="flex items-center space-x-2 mb-3">
        <div className="p-1.5 bg-green-500/20 rounded-lg">
          <TrendingUp className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Último Entrenamiento</h4>
          <p className="text-xs text-green-300">
            <Calendar className="w-3 h-3 inline mr-1" />
            {lastWorkoutStats.date.toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Estadísticas generales - más compactas */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-green-800/20 rounded-lg border border-green-700/30">
          <p className="text-sm font-bold text-green-300">{formatNumberToString(lastWorkoutStats.totalVolume)} {EXERCISE_CARD_CONSTANTS.STATS.volumeUnit}</p>
          <p className="text-xs text-green-400">Volumen</p>
        </div>
        <div className="text-center p-2 bg-green-800/20 rounded-lg border border-green-700/30">
          <p className="text-sm font-bold text-green-300">{lastWorkoutStats.totalSets}</p>
          <p className="text-xs text-green-400">Series</p>
        </div>
        <div className="text-center p-2 bg-green-800/20 rounded-lg border border-green-700/30">
          <p className="text-sm font-bold text-green-300">{formatNumberToString(lastWorkoutStats.maxWeight)} {EXERCISE_CARD_CONSTANTS.STATS.volumeUnit}</p>
          <p className="text-xs text-green-400">Máximo</p>
        </div>
      </div>

      {/* Series detalladas - más compactas */}
      <div className="border-t border-green-700/30 pt-3">
        <h5 className="text-xs font-medium text-green-300 mb-2 flex items-center">
          <Dumbbell className="w-3 h-3 mr-1" />
          Series
        </h5>

        <div className="space-y-1 max-h-24 overflow-y-auto">
          {expandedSeries.map((series, index: number) => (
            <div key={`${series.recordIndex}-${series.setIndex}-${index}`} className="flex items-center justify-between p-1.5 bg-green-800/10 rounded border border-green-700/20">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-green-400 bg-green-700/30 px-1.5 py-0.5 rounded-full min-w-[24px] text-center">
                  S{index + 1}
                </span>
                <div className="text-xs text-green-300">
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
