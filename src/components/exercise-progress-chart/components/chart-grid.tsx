import { THEME_CHART } from '@/constants/theme/index.constants';
import React from 'react';
import { generateGridPoints, getChartY } from '../../../utils/functions';
import type { ChartGridProps } from '../types';

/**
 * Grid y ejes del ExerciseProgressChart
 * Maneja la estructura base del SVG con cuadrícula y etiquetas
 */
export const ChartGrid: React.FC<ChartGridProps> = ({
  dimensions,
  weightRange
}) => {
  const { width, height, padding } = dimensions;
  const gridPoints = generateGridPoints(weightRange);

  return (
    <>
      {/* Patrón de cuadrícula */}
      <defs>
        <pattern id="chart-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke={THEME_CHART.grid.color}
            strokeWidth="1"
            opacity={THEME_CHART.grid.opacity}
          />
        </pattern>
      </defs>

      {/* Fondo con cuadrícula */}
      <rect width="100%" height="100%" fill="url(#chart-grid)" />

      {/* Eje X (horizontal) */}
      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke={THEME_CHART.axes.color}
        strokeWidth={THEME_CHART.axes.width}
      />

      {/* Eje Y (vertical) */}
      <line
        x1={padding}
        y1={padding}
        x2={padding}
        y2={height - padding}
        stroke={THEME_CHART.axes.color}
        strokeWidth={THEME_CHART.axes.width}
      />

      {/* Etiquetas del eje Y (peso) */}
      {gridPoints.map((weight, index) => {
        const y = getChartY(weight, weightRange, dimensions);
        return (
          <g key={index}>
            <line
              x1={padding - 5}
              y1={y}
              x2={padding}
              y2={y}
              stroke={THEME_CHART.axes.color}
            />
            <text
              x={padding - 10}
              y={y + 4}
              textAnchor="end"
              fontSize={THEME_CHART.text.size}
              fill={THEME_CHART.text.color}
            >
              {weight.toFixed(1)}
            </text>
          </g>
        );
      })}
    </>
  );
}; 