import { Calendar, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';
import { formatNumber } from '../../../utils/functions';
import type { ExtendedTimelinePoint } from '../hooks/use-timeline-data';

interface TimelineStatsProps {
  timelineData: ExtendedTimelinePoint[];
  maxValue: number;
  totalGrowthPercent: number;
}

export const TimelineStats: React.FC<TimelineStatsProps> = ({
  timelineData,
  maxValue,
  totalGrowthPercent
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-blue-400 mr-2" />
            <p className="text-3xl font-bold text-blue-400">
              {timelineData.length}
            </p>
          </div>
          <p className="text-sm text-gray-400">Semanas registradas</p>
        </div>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <Calendar className="w-6 h-6 text-green-400 mr-2" />
            <p className="text-3xl font-bold text-green-400">
              {formatNumber(maxValue)} kg
            </p>
          </div>
          <p className="text-sm text-gray-400">Mejor semana</p>
        </div>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="text-center">
          <div className="flex items-center justify-center">
            {totalGrowthPercent > 0 ? (
              <TrendingUp className="w-6 h-6 text-green-400 mr-2" />
            ) : totalGrowthPercent < 0 ? (
              <TrendingDown className="w-6 h-6 text-red-400 mr-2" />
            ) : (
              <Minus className="w-6 h-6 text-gray-400 mr-2" />
            )}
            <p className={`text-3xl font-bold ${totalGrowthPercent > 0 ? 'text-green-400' : totalGrowthPercent < 0 ? 'text-red-400' : 'text-gray-400'}`}>
              {totalGrowthPercent > 0 ? '+' : ''}{totalGrowthPercent.toFixed(1)}%
            </p>
          </div>
          <p className="text-sm text-gray-400">Crecimiento total (múltiples semanas)</p>
        </div>
      </div>
    </div>
  );
}; 