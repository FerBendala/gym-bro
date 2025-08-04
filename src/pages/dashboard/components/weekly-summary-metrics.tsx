import { Calendar, Target, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import React from 'react';

import { formatNumberToString } from '@/utils';
import type { DayMetrics } from '@/utils/functions/trends-interfaces';

interface WeeklySummaryMetricsProps {
  dailyTrends: DayMetrics[];
}

export const WeeklySummaryMetrics: React.FC<WeeklySummaryMetricsProps> = ({
  dailyTrends,
}) => {
  if (dailyTrends.length === 0) {
    return null;
  }

  // Filtrar solo días que tengan entrenamientos
  const daysWithData = dailyTrends.filter(day => day.workouts > 0);

  if (daysWithData.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="text-center">
          <div className="text-gray-400 text-sm mb-2">📊</div>
          <p className="text-gray-400 text-sm">No hay días con entrenamientos registrados</p>
          <p className="text-gray-500 text-xs mt-1">Registra algunos entrenamientos para ver las métricas</p>
        </div>
      </div>
    );
  }

  // Calcular métricas de resumen (solo días con datos)
  const totalWorkouts = daysWithData.reduce((sum, day) => sum + day.workouts, 0);
  const totalVolume = daysWithData.reduce((sum, day) => sum + day.totalVolume, 0);
  const avgPerformance = daysWithData.reduce((sum, day) => sum + day.performanceScore, 0) / daysWithData.length;
  const maxWeight = Math.max(...daysWithData.map(day => day.maxWeight));

  // Encontrar el mejor y peor día (solo entre días con datos)
  const bestDay = daysWithData.reduce((best, current) =>
    current.performanceScore > best.performanceScore ? current : best
  );

  const worstDay = daysWithData.reduce((worst, current) =>
    current.performanceScore < worst.performanceScore ? current : worst
  );

  // Calcular tendencia general (solo días con datos)
  const avgTrend = daysWithData.reduce((sum, day) => sum + day.trend, 0) / daysWithData.length;

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Target className="w-4 h-4 text-blue-400" />;
  };

  const getTrendText = (trend: number) => {
    if (trend > 0) return 'Mejorando';
    if (trend < 0) return 'Declinando';
    return 'Estable';
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-400';
    if (trend < 0) return 'text-red-400';
    return 'text-blue-400';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total de Entrenamientos */}
      <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          {getTrendIcon(avgTrend)}
        </div>
        <div className="mb-1">
          <div className="text-2xl font-bold text-white">
            {formatNumberToString(totalWorkouts, 0)}
          </div>
          <div className="text-sm text-gray-400">Entrenamientos</div>
        </div>
        <div className={`text-xs font-medium ${getTrendColor(avgTrend)}`}>
          {getTrendText(avgTrend)}
        </div>
      </div>

      {/* Volumen Total */}
      <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-green-600/20 rounded-lg">
            <Zap className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-green-400 text-xs font-medium">
            Total
          </div>
        </div>
        <div className="mb-1">
          <div className="text-2xl font-bold text-white">
            {formatNumberToString(totalVolume, 0)}
          </div>
          <div className="text-sm text-gray-400">kg Volumen</div>
        </div>
        <div className="text-xs text-gray-400">
          {formatNumberToString(totalVolume / Math.max(totalWorkouts, 1), 0)} kg/sesión
        </div>
      </div>

      {/* Rendimiento Promedio */}
      <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-purple-400 text-xs font-medium">
            Promedio
          </div>
        </div>
        <div className="mb-1">
          <div className="text-2xl font-bold text-white">
            {formatNumberToString(avgPerformance, 1)}%
          </div>
          <div className="text-sm text-gray-400">Rendimiento</div>
        </div>
        <div className="text-xs text-gray-400">
          Mejor: {bestDay.dayName}
        </div>
      </div>

      {/* Peso Máximo */}
      <div className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border border-orange-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-orange-600/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-orange-400 text-xs font-medium">
            Máximo
          </div>
        </div>
        <div className="mb-1">
          <div className="text-2xl font-bold text-white">
            {formatNumberToString(maxWeight, 0)} kg
          </div>
          <div className="text-sm text-gray-400">Peso Máximo</div>
        </div>
        <div className="text-xs text-gray-400">
          {worstDay.dayName} necesita mejora
        </div>
      </div>
    </div>
  );
}; 