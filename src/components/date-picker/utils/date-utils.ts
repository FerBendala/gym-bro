import { DATE_FORMATS } from '../constants';

/**
 * Formatea una fecha para mostrar en el input (formato YYYY-MM-DD)
 */
export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Formatea una fecha para mostrar como texto legible
 */
export const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString(
    DATE_FORMATS.DISPLAY.locale,
    DATE_FORMATS.DISPLAY.options,
  );
};

/**
 * Obtiene la fecha de hoy formateada para el input
 */
export const getTodayFormatted = (): string => {
  return formatDateForInput(new Date());
};

/**
 * Valida si una fecha es válida
 */
export const isValidDate = (date: Date): boolean => {
  return !isNaN(date.getTime());
};
