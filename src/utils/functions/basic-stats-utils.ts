import { differenceInDays, format } from 'date-fns';

/**
 * Calcula el promedio de un array de números
 */
export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

/**
 * Calcula el máximo de un array de números
 */
export const calculateMax = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return Math.max(...numbers);
};

/**
 * Calcula el mínimo de un array de números
 */
export const calculateMin = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return Math.min(...numbers);
};

/**
 * Calcula el elemento más frecuente en un array
 */
export const calculateMostFrequent = <T>(items: T[]): T | null => {
  if (items.length === 0) return null;

  const frequency = items.reduce((acc, item) => {
    const key = String(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostFrequent = Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)[0];

  return mostFrequent ? (items.find(item => String(item) === mostFrequent[0]) || null) : null;
};

/**
 * Cuenta elementos únicos en un array basado en una función de mapeo
 */
export const countUniqueBy = <T>(items: T[], mapFn: (item: T) => string): number => {
  const uniqueValues = new Set(items.map(mapFn));
  return uniqueValues.size;
};

/**
 * Calcula días transcurridos desde una fecha
 */
export const getDaysAgo = (date: Date | null): string | null => {
  if (!date) return null;

  const days = differenceInDays(new Date(), date);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  return `Hace ${days} días`;
};

/**
 * Formatea una fecha como string para comparaciones
 */
export const formatDateForComparison = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Encuentra el registro más reciente en un array basado en fecha
 */
export const findMostRecent = <T extends { date: Date }>(records: T[]): T | null => {
  if (records.length === 0) return null;

  return records.reduce((most, current) =>
    current.date.getTime() > most.date.getTime() ? current : most
  );
};