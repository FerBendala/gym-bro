import React from 'react';

import { CHART_EMPTY_STATE } from '../constants';
import type { ChartEmptyStateProps } from '../types';

/**
 * Estado vacío del ExerciseProgressChart cuando no hay datos
 */
export const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({
  height = CHART_EMPTY_STATE.defaultHeight,
  message = CHART_EMPTY_STATE.defaultMessage,
}) => {
  return (
    <div className={`h-${height} flex items-center justify-center text-gray-400`}>
      <p>{message}</p>
    </div>
  );
};
