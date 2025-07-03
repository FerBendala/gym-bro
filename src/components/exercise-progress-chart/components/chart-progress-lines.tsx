import React from 'react';
import { getChartX, getChartY } from '../../../utils/functions';
import type { ChartProgressLinesProps } from '../types';

/**
 * Líneas de progreso del ExerciseProgressChart
 * Maneja el renderizado de líneas y puntos para cada ejercicio
 */
export const ChartProgressLines: React.FC<ChartProgressLinesProps> = ({
  exerciseData,
  dimensions,
  weightRange,
  dateRange,
  colors
}) => {
  return (
    <>
      {Object.entries(exerciseData).map(([exerciseName, exerciseRecords], exerciseIndex) => {
        const color = colors[exerciseIndex % colors.length];

        if (exerciseRecords.length < 2) {
          // Si solo hay un punto, mostrar un círculo
          const record = exerciseRecords[0];
          const x = getChartX(record.date.getTime(), dateRange, dimensions);
          const y = getChartY(record.weight, weightRange, dimensions);

          return (
            <circle
              key={exerciseName}
              cx={x}
              cy={y}
              r="4"
              fill={color}
            />
          );
        }

        // Crear la línea de progreso
        const pathData = exerciseRecords.map((record, index) => {
          const x = getChartX(record.date.getTime(), dateRange, dimensions);
          const y = getChartY(record.weight, weightRange, dimensions);
          return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');

        return (
          <g key={exerciseName}>
            {/* Línea */}
            <path
              d={pathData}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Puntos */}
            {exerciseRecords.map((record, pointIndex) => {
              const x = getChartX(record.date.getTime(), dateRange, dimensions);
              const y = getChartY(record.weight, weightRange, dimensions);

              return (
                <circle
                  key={pointIndex}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={color}
                />
              );
            })}
          </g>
        );
      })}
    </>
  );
}; 