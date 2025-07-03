import React from 'react';
import type { ChartEmptyStateProps } from '../types';

/**
 * Estado vacío del ExerciseProgressChart cuando no hay datos
 */
export const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({
  height = 64,
  message = 'No hay datos suficientes para mostrar el gráfico'
}) => {
  return (
    <div className={`h-${height} flex items-center justify-center text-gray-400`}>
      <p>{message}</p>
    </div>
  );
}; 