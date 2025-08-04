import { Timer, TrendingDown, TrendingUp, Trophy } from 'lucide-react';
import React from 'react';

import { formatNumberToString } from '@/utils';
import { clamp } from '@/utils/functions/math-utils';

// Función para obtener un color más oscuro para el gradiente
const getDarkerColor = (color: string): string => {
  // Mapeo de colores a versiones más oscuras
  const colorMap: Record<string, string> = {
    '#3B82F6': '#1D4ED8', // Azul
    '#10B981': '#059669', // Verde
    '#F59E0B': '#D97706', // Naranja
    '#EF4444': '#DC2626', // Rojo
    '#8B5CF6': '#7C3AED', // Púrpura
    '#F97316': '#EA580C', // Naranja oscuro
    '#06B6D4': '#0891B2', // Cian
    '#84CC16': '#65A30D', // Verde lima
    '#6B7280': '#4B5563', // Gris
  };
  
  return colorMap[color] || color;
};

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
  // Validación de datos
  if (!data) {
    return (
      <div className="flex items-center justify-center p-4 text-gray-400">
        <span>Datos no disponibles</span>
      </div>
    );
  }

  // Validar que todos los valores sean números válidos (permitir valores negativos para strength)
  const isValidData = Object.entries(data).every(([key, value]) => {
    // Ignorar propiedades que no son números (como 'trend')
    if (key === 'trend') return true;
    if (typeof value !== 'number' || isNaN(value)) return false;
    // Permitir valores negativos solo para strength (puede indicar regresión)
    if (key === 'strength') return true;
    // Para otros valores, deben ser >= 0
    return value >= 0;
  });

  if (!isValidData) {
    // Debug: identificar qué valores son inválidos
    const invalidValues = Object.entries(data).filter(([key, value]) => {
      if (key === 'trend') return false; // trend es string, no número
      if (typeof value !== 'number' || isNaN(value)) return true;
      if (key === 'strength') return false; // strength puede ser negativo
      return value < 0;
    });

    return (
      <div className="flex items-center justify-center p-4 text-gray-400">
        <span>Datos inválidos: {invalidValues.map(([key]) => key).join(', ')}</span>
      </div>
    );
  }

  // Calcular valores dinámicos basados en datos reales
  const maxFrequency = Math.max(data.frequency, 3.5); // Máximo realista para frecuencia semanal
  const frequencyPercentage = (data.frequency / maxFrequency) * 100;
  const idealFrequencyPercentage = (2.5 / maxFrequency) * 100; // 2.5 veces por semana como ideal

  // Normalizar valores para el gráfico
  const normalizedStrength = clamp(((data.strength + 100) / 2), 0, 100);
  const strengthIdeal = 50; // 0% de progresión como punto neutral

  // Calcular intensidad ideal (10% menos que actual como objetivo conservador)
  const intensityIdeal = clamp(data.intensity * 0.9, 60, 80);

  const metrics = [
    {
      label: 'Volumen',
      value: data.volume,
      max: Math.max(data.idealVolume * 1.5, data.volume, 100),
      ideal: data.idealVolume,
      unit: '%',
      color,
    },
    {
      label: 'Intensidad',
      value: data.intensity,
      max: 100,
      ideal: intensityIdeal,
      unit: '%',
      color: '#3B82F6',
    },
    {
      label: 'Frecuencia',
      value: frequencyPercentage,
      max: 100,
      ideal: idealFrequencyPercentage,
      unit: '/sem',
      color: '#8B5CF6',
    },
    {
      label: 'Fuerza',
      value: normalizedStrength,
      max: 100,
      ideal: strengthIdeal,
      unit: '%',
      color: data.strength > 0 ? '#10B981' : data.strength < 0 ? '#EF4444' : '#6B7280',
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
                    ? `${formatNumberToString(data.frequency, 1)}/sem`
                    : metric.label === 'Fuerza'
                      ? `${(data.strength > 0 ? '+' : '') + formatNumberToString(data.strength, 0)}%`
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
                  background: `linear-gradient(90deg, ${metric.color} 0%, ${getDarkerColor(metric.color)} 100%)`,
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
            {formatNumberToString(data.records, 0)}
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
