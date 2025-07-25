import { Timer, TrendingDown, TrendingUp, Trophy } from 'lucide-react';
import React from 'react';
import { formatNumber } from '../../../utils/functions';

interface CategoryDashboardChartProps {
  data: {
    volume: number;
    idealVolume: number;
    intensity: number;
    frequency: number;
    strength: number;
    records: number;
    trend: string;
  };
  color: string;
}

export const CategoryDashboardChart: React.FC<CategoryDashboardChartProps> = ({ data, color }) => {
  // Calcular valores dinámicos basados en datos reales
  const maxFrequency = Math.max(data.frequency, 3.5); // Máximo realista para frecuencia semanal
  const frequencyPercentage = (data.frequency / maxFrequency) * 100;
  const idealFrequencyPercentage = (2.5 / maxFrequency) * 100; // 2.5 veces por semana como ideal

  // Normalizar fuerza: convertir progresión (-100 a +100) a escala 0-100
  const normalizedStrength = Math.max(0, Math.min(100, ((data.strength + 100) / 2)));
  const strengthIdeal = 50; // 0% de progresión como punto neutral

  // Calcular ideal de intensidad basado en datos disponibles
  const intensityIdeal = Math.min(80, Math.max(60, data.intensity * 0.9)); // 10% menos que actual como objetivo conservador

  const metrics = [
    {
      label: 'Volumen',
      value: data.volume,
      max: Math.max(data.idealVolume * 1.5, data.volume, 100),
      ideal: data.idealVolume,
      unit: '%',
      color: color
    },
    {
      label: 'Intensidad',
      value: data.intensity,
      max: 100,
      ideal: intensityIdeal,
      unit: '%',
      color: '#3B82F6'
    },
    {
      label: 'Frecuencia',
      value: frequencyPercentage,
      max: 100,
      ideal: idealFrequencyPercentage,
      unit: '/sem',
      color: '#8B5CF6'
    },
    {
      label: 'Fuerza',
      value: normalizedStrength,
      max: 100,
      ideal: strengthIdeal,
      unit: '%',
      color: data.strength > 0 ? '#10B981' : data.strength < 0 ? '#EF4444' : '#6B7280'
    }
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
                    ? formatNumber(data.frequency, 1) + '/sem'
                    : metric.label === 'Fuerza'
                      ? (data.strength > 0 ? '+' : '') + formatNumber(data.strength, 0) + '%'
                      : formatNumber(metric.value, 0) + metric.unit
                  }
                </span>
                {metric.label === 'Volumen' && (
                  <span className="text-gray-500 text-xs">
                    (ideal: {formatNumber(metric.ideal, 0)}%)
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
                  backgroundColor: metric.color
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
            {formatNumber(data.records, 0)}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {data.trend === 'improving' && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-green-900/30 rounded-full">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400 font-medium">+</span>
            </div>
          )}
          {data.trend === 'declining' && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-red-900/30 rounded-full">
              <TrendingDown className="w-3 h-3 text-red-400" />
              <span className="text-xs text-red-400 font-medium">-</span>
            </div>
          )}
          {data.trend === 'stable' && (
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