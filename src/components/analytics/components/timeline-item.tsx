import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import React from 'react';
import { formatNumber } from '../../../utils/functions';
import type { ExtendedTimelinePoint } from '../hooks/use-timeline-data';

interface TimelineItemProps {
  point: ExtendedTimelinePoint;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ point }) => {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return ArrowUp;
      case 'down': return ArrowDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const TrendIcon = getTrendIcon(point.trend);
  const trendColor = getTrendColor(point.trend);

  return (
    <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-lg font-bold text-white">
            Semana {point.weekNumber}
          </span>
          <span className="text-sm text-gray-400">
            {point.date.toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-blue-400">
            {formatNumber(point.value)} kg
          </span>
          {point.weekNumber > 1 && (
            <div className={`flex items-center space-x-1 ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {point.changePercent > 0 ? '+' : ''}{point.changePercent.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-400">Entrenamientos:</span>
          <span className="ml-2 font-medium text-white">{point.totalWorkouts}</span>
        </div>
        <div>
          <span className="text-gray-400">Peso máximo:</span>
          <span className="ml-2 font-medium text-white">{formatNumber(point.maxWeight)} kg</span>
        </div>
        <div>
          <span className="text-gray-400">Series totales:</span>
          <span className="ml-2 font-medium text-white">{point.totalSets}</span>
        </div>
        <div>
          <span className="text-gray-400">Ejercicios únicos:</span>
          <span className="ml-2 font-medium text-white">{point.uniqueExercises}</span>
        </div>
      </div>

      {point.weekNumber > 1 && (
        <div className="mt-3 pt-3 border-t border-gray-700/50 text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">Cambio vs semana anterior (promedio/sesión):</span>
            <span className={`font-medium ${point.change > 0 ? 'text-green-400' : point.change < 0 ? 'text-red-400' : 'text-gray-400'}`}>
              {point.change > 0 ? '+' : ''}{formatNumber(point.change)} kg ({point.changePercent > 0 ? '+' : ''}{point.changePercent.toFixed(1)}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}; 