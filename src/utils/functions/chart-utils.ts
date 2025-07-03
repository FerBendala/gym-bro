/**
 * Utilidades genéricas para gráficos y visualizaciones
 * Reutilizable en ExerciseProgressChart, Dashboard charts, etc.
 */

export interface ChartDimensions {
  width: number;
  height: number;
  padding: number;
}

export interface DataRange {
  min: number;
  max: number;
  range: number;
}

/**
 * Calcula el rango de datos para un conjunto de valores
 */
export const calculateDataRange = (values: number[]): DataRange => {
  if (values.length === 0) {
    return { min: 0, max: 1, range: 1 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1; // Evitar división por 0

  return { min, max, range };
};

/**
 * Convierte un valor de datos a coordenada X del gráfico
 */
export const getChartX = (
  value: number,
  dataRange: DataRange,
  dimensions: ChartDimensions
): number => {
  const { padding, width } = dimensions;
  return padding + ((value - dataRange.min) / dataRange.range) * (width - 2 * padding);
};

/**
 * Convierte un valor de datos a coordenada Y del gráfico (invertida para SVG)
 */
export const getChartY = (
  value: number,
  dataRange: DataRange,
  dimensions: ChartDimensions
): number => {
  const { padding, height } = dimensions;
  return height - padding - ((value - dataRange.min) / dataRange.range) * (height - 2 * padding);
};

/**
 * Genera puntos de cuadrícula para el eje Y
 */
export const generateGridPoints = (dataRange: DataRange, count: number = 5): number[] => {
  return Array.from({ length: count }, (_, index) => {
    const ratio = index / (count - 1);
    return dataRange.min + ratio * dataRange.range;
  });
};

/**
 * Agrupa registros por una propiedad específica
 */
export const groupRecordsByProperty = <T>(
  records: T[],
  getProperty: (record: T) => string
): Record<string, T[]> => {
  return records.reduce((acc, record) => {
    const property = getProperty(record);
    if (!acc[property]) {
      acc[property] = [];
    }
    acc[property].push(record);
    return acc;
  }, {} as Record<string, T[]>);
};

/**
 * Ordena registros por fecha
 */
export const sortRecordsByDate = <T extends { date: Date }>(records: T[]): T[] => {
  return [...records].sort((a, b) => a.date.getTime() - b.date.getTime());
}; 