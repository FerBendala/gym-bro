/**
 * Utilidades específicas del componente ExerciseProgressChart
 */

import type { WorkoutRecord } from '@/interfaces';
import type { ChartDimensions, DataRange } from '@/utils';
import { getChartX, getChartY } from '@/utils';
import { calculateOptimal1RM } from '@/utils/functions/calculate-1rm.utils';

/**
 * Obtiene las coordenadas del gráfico para un registro
 */
export const getChartCoordinates = (
  record: WorkoutRecord,
  dateRange: DataRange,
  weightRange: DataRange,
  dimensions: ChartDimensions
) => {
  const estimated1RM = calculateOptimal1RM(record.weight, record.reps);
  const x = getChartX(record.date.getTime(), dateRange, dimensions);
  const y = getChartY(estimated1RM, weightRange, dimensions);

  return { x, y, estimated1RM };
};

/**
 * Genera el path SVG para una línea de progreso
 */
export const generateProgressPath = (
  records: WorkoutRecord[],
  dateRange: DataRange,
  weightRange: DataRange,
  dimensions: ChartDimensions
): string => {
  return records.map((record, index) => {
    const { x, y } = getChartCoordinates(record, dateRange, weightRange, dimensions);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
};

/**
 * Genera el path SVG para el área bajo una línea
 */
export const generateAreaPath = (
  records: WorkoutRecord[],
  dateRange: DataRange,
  weightRange: DataRange,
  dimensions: ChartDimensions
): string => {
  const pathData = records.map((record, index) => {
    const { x, y } = getChartCoordinates(record, dateRange, weightRange, dimensions);

    if (index === 0) {
      const bottomY = dimensions.height - dimensions.padding;
      return `M ${x} ${bottomY} L ${x} ${y}`;
    }
    return `L ${x} ${y}`;
  }).join(' ');

  const lastRecord = records[records.length - 1];
  const lastX = getChartX(lastRecord.date.getTime(), dateRange, dimensions);
  const bottomY = dimensions.height - dimensions.padding;

  return pathData + ` L ${lastX} ${bottomY} Z`;
}; 