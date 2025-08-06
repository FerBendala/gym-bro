import { BarChart3, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';

import { ChartEmptyState, ChartGrid, ChartStatistics, EnhancedChartLines } from './components';
import { CHART_DIMENSIONS, CHART_EMPTY_STATE, CHART_INFO_ITEMS } from './constants';
import { useChartData, useChartStatistics } from './hooks';
import type { ExerciseProgressChartProps } from './types';

import { ChartLegend } from '@/components/chart-legend';
import { InfoTooltip } from '@/components/tooltip';
import { THEME_CHART } from '@/constants/theme';
import type { ChartDimensions } from '@/utils';

/**
 * Componente principal del ExerciseProgressChart mejorado
 * Con estadísticas adicionales y mejores efectos visuales
 */
export const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({ records }) => {
  const { chartData, isEmpty } = useChartData(records);
  const statistics = useChartStatistics(records);
  const [showStatistics, setShowStatistics] = useState(false);

  // Dimensiones del gráfico más grandes para mejor visualización
  const dimensions: ChartDimensions = CHART_DIMENSIONS;

  if (isEmpty || !chartData) {
    return <ChartEmptyState height={CHART_EMPTY_STATE.defaultHeight} />;
  }

  const { exerciseData, weightRange, dateRange, legendItems } = chartData;

  return (
    <div className="w-full space-y-6">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Progreso de Fuerza</h3>
            <p className="text-sm text-gray-400">Evolución considerando peso y repeticiones (1RM estimado)</p>
          </div>
        </div>

        <button
          onClick={() => setShowStatistics(!showStatistics)}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <BarChart3 className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">
            {showStatistics ? 'Ocultar' : 'Ver'} estadísticas
          </span>
        </button>
      </div>

      {/* Gráfico principal */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
        <div className="overflow-x-auto">
          <svg
            width={dimensions.width}
            height={dimensions.height}
            className="min-w-full"
            style={{ background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(31, 41, 55, 0.4) 100%)' }}
          >
            <ChartGrid
              dimensions={dimensions}
              weightRange={weightRange}
              dateRange={dateRange}
            />
            <EnhancedChartLines
              exerciseData={exerciseData}
              dimensions={dimensions}
              weightRange={weightRange}
              dateRange={dateRange}
              colors={[...THEME_CHART.colors]}
            />
          </svg>
        </div>

        {/* Leyenda mejorada */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
          <ChartLegend items={legendItems} />
          <InfoTooltip
            content="Cada línea muestra el progreso de fuerza estimada (1RM) por ejercicio, considerando tanto el peso como las repeticiones. Pasa el cursor sobre los puntos para ver detalles."
            position="left"
          />
        </div>

        {/* Información adicional */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-400">
          {CHART_INFO_ITEMS.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className={`w-2 h-2 ${item.color} rounded-full`} />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas adicionales */}
      {showStatistics && (
        <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h4 className="text-lg font-semibold text-white">Estadísticas Detalladas</h4>
            <InfoTooltip
              content="Métricas avanzadas calculadas a partir de tus datos de entrenamiento para ayudarte a entender tu progreso."
              position="right"
            />
          </div>
          <ChartStatistics statistics={statistics} />
        </div>
      )}
    </div>
  );
};
