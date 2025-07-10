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
          const estimated1RM = record.weight * (1 + Math.min(record.reps, 20) / 30);
          const x = getChartX(record.date.getTime(), dateRange, dimensions);
          const y = getChartY(estimated1RM, weightRange, dimensions);

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

        // Crear la línea de progreso usando 1RM estimado
        const pathData = exerciseRecords.map((record, index) => {
          const estimated1RM = record.weight * (1 + Math.min(record.reps, 20) / 30);
          const x = getChartX(record.date.getTime(), dateRange, dimensions);
          const y = getChartY(estimated1RM, weightRange, dimensions);
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
              const estimated1RM = record.weight * (1 + Math.min(record.reps, 20) / 30);
              const x = getChartX(record.date.getTime(), dateRange, dimensions);
              const y = getChartY(estimated1RM, weightRange, dimensions);

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