import type { WorkoutRecord } from '../../../interfaces';

/**
 * Valida si hay suficientes registros para mostrar el dashboard
 */
export const hasEnoughData = (records: WorkoutRecord[]): boolean => {
  return records.length > 0;
};

/**
 * Obtiene el tiempo de filtro por defecto
 */
export const getDefaultTimeFilter = (): string => {
  return 'Últimos 30 días';
};

/**
 * Valida si el tab es válido
 */
export const isValidTab = (tab: string): boolean => {
  const validTabs = ['balance', 'advanced', 'predictions', 'history', 'exercises'];
  return validTabs.includes(tab);
}; 