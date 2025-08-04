import { Timer, TrendingDown, TrendingUp, Trophy } from 'lucide-react';
import React from 'react';

import { TREND_THRESHOLDS, validatePercentage } from '../constants';
import type { CategoryDashboardChartProps } from '../types';

import { formatNumberToString } from '@/utils';
import { clamp } from '@/utils/functions/math-utils';

export const CategoryDashboardChart: React.FC<CategoryDashboardChartProps> = ({ data, color }) => {
  // Validar datos de entrada
  if (!data) {
    return (
      <div className="space-y-3">
        <div className="text-center text-gray-500 text-sm">Sin datos disponibles</div>
      </div>
    );
  }

  // Calcular valores dinámicos basados en datos reales con validaciones
  const maxFrequency = Math.max(data.frequency || 0, TREND_THRESHOLDS.MAX_FREQUENCY);
  const frequencyPercentage = maxFrequency > 0 ? ((data.frequency || 0) / maxFrequency) * 100 : 0;
  const idealFrequencyPercentage = (TREND_THRESHOLDS.IDEAL_FREQUENCY / maxFrequency) * 100;

  // Normalizar fuerza: convertir progresión (-100 a +100) a escala 0-100
  const normalizedStrength = clamp(((data.strength || 0) + 100) / 2, 0, 100);
  const strengthIdeal = 50; // 0% de progresión como punto neutral

  // Calcular ideal de intensidad basado en datos disponibles
  const intensityIdeal = Math.min(
    TREND_THRESHOLDS.MAX_INTENSITY,
    Math.max(TREND_THRESHOLDS.MIN_INTENSITY, (data.intensity || 0) * TREND_THRESHOLDS.INTENSITY_REDUCTION_FACTOR),
  );

  const metrics = [
    {
      label: 'Volumen',
      value: validatePercentage(data.volume || 0),
      max: Math.max((data.idealVolume || 0) * 1.5, data.volume || 0, 100),
      ideal: validatePercentage(data.idealVolume || 0),
      unit: '%',
      color,
    },
    {
      label: 'Intensidad',
      value: validatePercentage(data.intensity || 0),
      max: 100,
      ideal: validatePercentage(intensityIdeal),
      unit: '%',
      color: '#3B82F6',
    },
    {
      label: 'Frecuencia',
      value: validatePercentage(frequencyPercentage),
      max: 100,
      ideal: validatePercentage(idealFrequencyPercentage),
      unit: '/sem',
      color: '#8B5CF6',
    },
    {
      label: 'Fuerza',
      value: validatePercentage(normalizedStrength),
      max: 100,
      ideal: validatePercentage(strengthIdeal),
      unit: '%',
      color: (data.strength || 0) > 0 ? '#10B981' : (data.strength || 0) < 0 ? '#EF4444' : '#6B7280',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Métricas principales en barras horizontales */}
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-medium">{metric.label}</span>
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold">
                  {metric.label === 'Frecuencia'
                    ? `${formatNumberToString(data.frequency || 0, 1)}/sem`
                    : metric.label === 'Fuerza'
                      ? `${((data.strength || 0) > 0 ? '+' : '') + formatNumberToString(data.strength || 0, 0)}%`
                      : formatNumberToString(metric.value, 0) + metric.unit
                  }
                </span>
                {metric.label === 'Volumen' && (
                  <span className="text-gray-500 text-xs">
                    (ideal: {formatNumberToString(metric.ideal, 0)}%)
                  </span>
                )}
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
              {/* Indicador ideal */}
              {metric.label === 'Volumen' && (
                <div
                  className="absolute top-0 w-0.5 h-full bg-white/60 z-10"
                  style={{ left: `${(metric.ideal / metric.max) * 100}%` }}
                />
              )}

              {/* Barra de progreso actual */}
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out relative"
                style={{
                  width: `${Math.min(100, (metric.value / metric.max) * 100)}%`,
                  backgroundColor: metric.color,
                }}
              >
                {/* Brillo sutil */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Records y estado en una fila */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
        <div className="flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-xs text-gray-400">PRs:</span>
          <span className="text-sm font-bold text-yellow-400">
            {formatNumberToString(data.records || 0, 0)}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {data.trend === '+' && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-green-900/30 rounded-full">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400 font-medium">+</span>
            </div>
          )}
          {data.trend === '-' && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-red-900/30 rounded-full">
              <TrendingDown className="w-3 h-3 text-red-400" />
              <span className="text-xs text-red-400 font-medium">-</span>
            </div>
          )}
          {data.trend === '=' && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-gray-800/50 rounded-full">
              <Timer className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">=</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
