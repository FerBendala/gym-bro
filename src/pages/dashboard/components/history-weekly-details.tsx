import { Card, CardContent, CardHeader } from '@/components/card';
import { InfoTooltip } from '@/components/tooltip';
import { TREND_COLORS, TREND_LABELS } from '@/constants';
import type { HistoryPoint } from '@/interfaces';
import { formatNumberToString } from '@/utils';
import { ArrowDown, ArrowUp, Calendar, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';
import { MetricsGrid } from '../shared';

interface HistoryWeeklyDetailsProps {
  historyData: HistoryPoint[];
}

export const HistoryWeeklyDetails: React.FC<HistoryWeeklyDetailsProps> = ({ historyData }) => {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return ArrowUp;
      case 'down': return ArrowDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    return TREND_COLORS[trend];
  };

  const getTrendBadge = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return { text: TREND_LABELS.up, color: 'bg-green-500 text-white', icon: TrendingUp };
      case 'down': return { text: TREND_LABELS.down, color: 'bg-red-500 text-white', icon: TrendingDown };
      default: return { text: TREND_LABELS.stable, color: 'bg-gray-500 text-white', icon: null };
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Historial Semanal Detallado
          <InfoTooltip
            content="Desglose detallado de cada semana con métricas completas y comparativas."
            position="top"
            className="ml-2"
          />
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {historyData.slice().reverse().map((point, index) => {
            const TrendIcon = getTrendIcon(point.trend);
            const trendColor = getTrendColor(point.trend);
            const trendBadge = getTrendBadge(point.trend);

            return (
              <div
                key={index}
                className="relative p-4 sm:p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-200"
              >
                {/* Header con semana, fecha y estado */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-br from-blue-500/80 to-blue-600/80">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base md:text-lg font-semibold text-white">
                        Semana {point.weekNumber}
                      </h4>
                      <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                        <span className="text-xs sm:text-sm text-gray-400">
                          {point.date.toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        {point.weekNumber > 1 && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${trendBadge.color}`}>
                            {trendBadge.text}
                          </span>
                        )}
                        {point.weekNumber > 1 && trendBadge.icon && (
                          <trendBadge.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${point.trend === 'down' ? 'text-red-400' : 'text-green-400'}`} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Volumen principal y cambio */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-gray-400">
                      volumen total
                    </div>
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400">
                      {formatNumberToString(point.value)} kg
                    </div>
                  </div>
                </div>

                {/* Métricas principales en grid */}
                <MetricsGrid>
                  <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">Entrenamientos</div>
                    <div className="text-sm sm:text-lg font-semibold text-white">
                      {point.totalWorkouts}
                    </div>
                    <div className="text-xs text-gray-500">sesiones</div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">Peso Máximo</div>
                    <div className="text-sm sm:text-lg font-semibold text-white">
                      {formatNumberToString(point.maxWeight)}
                    </div>
                    <div className="text-xs text-gray-500">kg</div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">Series</div>
                    <div className="text-sm sm:text-lg font-semibold text-white">
                      {point.totalSets}
                    </div>
                    <div className="text-xs text-gray-500">totales</div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">Ejercicios</div>
                    <div className="text-sm sm:text-lg font-semibold text-white">
                      {point.uniqueExercises}
                    </div>
                    <div className="text-xs text-gray-500">únicos</div>
                  </div>
                </MetricsGrid>

                {/* Información de cambio vs semana anterior */}
                {point.weekNumber > 1 && (
                  <div className="bg-gray-800/30 rounded-lg p-3">
                    <h5 className="text-xs font-medium text-gray-300 mb-2 flex items-center gap-1">
                      <TrendIcon className={`w-3 h-3 ${trendColor}`} />
                      Cambio vs Semana Anterior
                    </h5>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Volumen/sesión:</span>
                        <span className={`text-xs font-medium ${point.change > 0 ? 'text-green-400' : point.change < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                          {point.change > 0 ? '+' : ''}{formatNumberToString(point.change)} kg ({point.changePercent > 0 ? '+' : ''}{formatNumberToString(point.changePercent, 1)}%)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Volumen total:</span>
                        <span className={`text-xs font-medium ${point.totalVolumeChangePercent > 0 ? 'text-green-400' : point.totalVolumeChangePercent < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                          {point.totalVolumeChangePercent > 0 ? '+' : ''}{formatNumberToString(point.totalVolumeChangePercent, 1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}; 