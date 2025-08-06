import { Calendar, Clock, TrendingDown, TrendingUp, Trophy, Zap } from 'lucide-react';
import React from 'react';

import { Card } from '@/components/card';
import { formatNumberToString } from '@/utils';

interface HistoryMetricsProps {
  historyData: {
    value: number;
    totalWorkouts: number;
  }[];
  totalGrowthPercent: number;
}

export const HistoryMetrics: React.FC<HistoryMetricsProps> = ({
  historyData,
  totalGrowthPercent,
}) => {
  const maxValue = historyData.length > 0 ? Math.max(...historyData.map(point => point.value)) : 0;
  const avgValue = historyData.length > 0 ? historyData.reduce((sum, p) => sum + p.value, 0) / historyData.length : 0;
  const avgWorkoutsPerWeek = historyData.length > 0 ? historyData.reduce((sum, p) => sum + p.totalWorkouts, 0) / historyData.length : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* Semanas Registradas */}
      <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-400">
              {historyData.length}
            </div>
            <div className="text-xs text-gray-400">Semanas Registradas</div>
          </div>
        </div>
      </Card>

      {/* Mejor Semana */}
      <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-green-500/20">
            <Trophy className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">
              {formatNumberToString(maxValue)} kg
            </div>
            <div className="text-xs text-gray-400">Mejor Semana</div>
          </div>
        </div>
      </Card>

      {/* Promedio Semanal */}
      <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-yellow-500/20">
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-400">
              {formatNumberToString(avgValue)} kg
            </div>
            <div className="text-xs text-gray-400">Promedio Semanal</div>
          </div>
        </div>
      </Card>

      {/* Duración Promedio */}
      <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-purple-400">
              {Math.round(avgWorkoutsPerWeek)} ent/sem
            </div>
            <div className="text-xs text-gray-400">Duración Promedio</div>
          </div>
        </div>
      </Card>

      {/* Crecimiento por Sesión */}
      <Card className={`p-4 bg-gradient-to-br ${totalGrowthPercent >= 0 ? 'from-green-500/10 to-green-600/10 border-green-500/20' : 'from-red-500/10 to-red-600/10 border-red-500/20'} border`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${totalGrowthPercent >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            {totalGrowthPercent >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div>
            <div className={`text-lg font-bold ${totalGrowthPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalGrowthPercent >= 0 ? '+' : ''}{formatNumberToString(totalGrowthPercent, 1)}%
            </div>
            <div className="text-xs text-gray-400">Crecimiento por Sesión</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
