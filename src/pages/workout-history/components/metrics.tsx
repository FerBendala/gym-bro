import { formatNumberToString } from '@/utils';
import React from 'react';
import type { WorkoutStats } from '../../utils';

interface WorkoutMetricsProps {
  stats: WorkoutStats;
  hasIndividualSets: boolean;
}

export const WorkoutMetrics: React.FC<WorkoutMetricsProps> = ({
  stats,
  hasIndividualSets
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div className="bg-gray-800/50 rounded-lg p-3 text-center">
        <p className="text-lg font-bold text-white">
          {hasIndividualSets ?
            `${formatNumberToString(stats.minWeight)}-${formatNumberToString(stats.maxWeight)}` :
            formatNumberToString(stats.avgWeight)
          } kg
        </p>
        <p className="text-xs text-gray-400">
          {hasIndividualSets ? 'Peso (min-max)' : 'Peso'}
        </p>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-3 text-center">
        <p className="text-lg font-bold text-white">
          {stats.totalReps}
        </p>
        <p className="text-xs text-gray-400">Reps totales</p>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-3 text-center">
        <p className="text-lg font-bold text-white">
          {stats.totalSets}
        </p>
        <p className="text-xs text-gray-400">Series</p>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-3 text-center">
        <p className="text-lg font-bold text-green-400">
          {formatNumberToString(stats.totalVolume)} kg
        </p>
        <p className="text-xs text-gray-400">Volumen</p>
      </div>
    </div>
  );
}; 