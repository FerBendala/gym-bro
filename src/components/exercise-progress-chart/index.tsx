import React from 'react';
import { THEME_CHART } from '../../constants/theme';
import type { ChartDimensions } from '../../utils/functions';
import { ChartLegend } from '../chart-legend';
import { InfoTooltip } from '../tooltip';
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
      <div className="flex items-center justify-between mt-4">
        <ChartLegend items={legendItems} />
        <InfoTooltip
          content="Cada línea representa un ejercicio diferente. Los puntos muestran el peso máximo utilizado en cada fecha de entrenamiento."
          position="left"
        />
      </div>

      {/* Información adicional con tooltips */}
      <div className="mt-4 text-xs text-gray-400 space-y-1">
        <div className="flex items-center space-x-2">
          <span>Progreso de peso a lo largo del tiempo</span>
          <InfoTooltip
            content="Este gráfico te ayuda a visualizar si estás progresando en fuerza al aumentar gradualmente el peso en tus ejercicios."
            position="top"
          />
        </div>
        <div className="flex items-center space-x-2">
          <span>Eje X: Tiempo | Eje Y: Peso (kg)</span>
          <InfoTooltip
            content="Una línea ascendente indica progreso positivo. Las líneas planas pueden indicar mesetas, y las descendentes pueden señalar necesidad de ajustes."
            position="top"
          />
        </div>
      </div>
    </div>
  );
};