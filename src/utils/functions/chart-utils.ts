/**
 * Utilidades para gráficos y visualizaciones
 */

/**
 * Dimensiones del gráfico
 */
export interface ChartDimensions {
  width: number;
  height: number;
  padding: number;
}

/**
 * Rango de datos para un eje
 */
export interface DataRange {
  min: number;
  max: number;
}

/**
 * Calcula la coordenada X en el gráfico
 */
export const getChartX = (value: number, range: DataRange, dimensions: ChartDimensions): number => {
  const { min, max } = range;
  const { width, padding } = dimensions;
  const availableWidth = width - 2 * padding;

  if (max === min) return padding;

  const normalizedValue = (value - min) / (max - min);
  return padding + (normalizedValue * availableWidth);
};

/**
 * Calcula la coordenada Y en el gráfico
 */
export const getChartY = (value: number, range: DataRange, dimensions: ChartDimensions): number => {
  const { min, max } = range;
  const { height, padding } = dimensions;
  const availableHeight = height - 2 * padding;

  if (max === min) return height - padding;

  const normalizedValue = (value - min) / (max - min);
  return height - padding - (normalizedValue * availableHeight);
};

/**
 * Calcula el rango de datos para un array de valores
 */
export const calculateDataRange = (values: number[]): DataRange => {
  if (values.length === 0) {
    return { min: 0, max: 1 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  // Añadir un pequeño margen para evitar que los puntos toquen los bordes
  const margin = (max - min) * 0.05;

  return {
    min: Math.max(0, min - margin),
    max: max + margin
  };
};

/**
 * Genera puntos para el grid del gráfico
 */
export const generateGridPoints = (
  range: DataRange,
  dimensions: ChartDimensions,
  divisions: number = 5
): Array<{ x: number; y: number; value: number }> => {
  const points = [];
  const step = (range.max - range.min) / divisions;

  for (let i = 0; i <= divisions; i++) {
    const value = range.min + (step * i);
    const y = getChartY(value, range, dimensions);
    points.push({ x: dimensions.padding, y, value });
  }

  return points;
}; 