import React from 'react';
import { THEME_CHART } from '../../constants/theme';
import type { ChartDimensions } from '../../utils/functions';
import { ChartLegend } from '../chart-legend';
import { ChartEmptyState, ChartGrid, ChartProgressLines } from './components';
import { useChartData } from './hooks';
import type { ExerciseProgressChartProps } from './types';

/**
 * Componente principal del ExerciseProgressChart
 * Orquesta los subcomponentes y maneja la lógica principal
 */
export const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({ records }) => {
  const { chartData, isEmpty } = useChartData(records);

  // Dimensiones del gráfico
  const dimensions: ChartDimensions = {
    width: 400,
    height: 200,
    padding: 40
  };

  if (isEmpty || !chartData) {
    return <ChartEmptyState height={64} />;
  }

  const { exerciseData, weightRange, dateRange, legendItems } = chartData;

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <svg width={dimensions.width} height={dimensions.height} className="min-w-full">
          <ChartGrid
            dimensions={dimensions}
            weightRange={weightRange}
            dateRange={dateRange}
          />
          <ChartProgressLines
            exerciseData={exerciseData}
            dimensions={dimensions}
            weightRange={weightRange}
            dateRange={dateRange}
            colors={[...THEME_CHART.colors]}
          />
        </svg>
      </div>

      {/* Leyenda usando componente genérico */}
      <ChartLegend items={legendItems} className="mt-4" />

      {/* Información adicional */}
      <div className="mt-4 text-xs text-gray-400">
        <p>Progreso de peso a lo largo del tiempo</p>
        <p>Eje X: Tiempo | Eje Y: Peso (kg)</p>
      </div>
    </div>
  );
};