import { endOfMonth, endOfWeek, format, isSameDay, isWithinInterval, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import type { WorkoutRecord } from '../../interfaces';

export type TimeFilter = 'week' | 'month' | 'all';

/**
 * Filtra registros por período de tiempo
 * @param records - Array de registros con propiedad date
 * @param timeFilter - Tipo de filtro temporal
 * @returns Registros filtrados
 */
export const filterRecordsByTime = <T extends { date: Date }>(
  records: T[],
  timeFilter: TimeFilter
): T[] => {
  // Si no hay registros, retornar array vacío
  if (records.length === 0) return records;

  // Usar la fecha más reciente de los registros como "ahora" en lugar de new Date()
  // Esto asegura que los filtros funcionen correctamente con datos históricos o futuros
  const now = new Date(Math.max(...records.map(r => r.date.getTime())));

  switch (timeFilter) {
    case 'week':
      const weekStart = startOfWeek(now, { locale: es });
      const weekEnd = endOfWeek(now, { locale: es });
      return records.filter(record =>
        isWithinInterval(record.date, { start: weekStart, end: weekEnd })
      );
    case 'month':
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      return records.filter(record =>
        isWithinInterval(record.date, { start: monthStart, end: monthEnd })
      );
    case 'all':
    default:
      return records;
  }
}

/**
 * Obtiene la etiqueta descriptiva del filtro temporal
 * @param timeFilter - Tipo de filtro temporal
 * @param referenceDate - Fecha de referencia opcional (por defecto usa new Date())
 * @returns Etiqueta descriptiva
 */
export const getTimeFilterLabel = (timeFilter: TimeFilter, referenceDate?: Date): string => {
  const now = referenceDate || new Date();

  switch (timeFilter) {
    case 'week':
      return `Semana del ${format(startOfWeek(now, { locale: es }), 'd MMM', { locale: es })}`;
    case 'month':
      return format(now, 'MMMM yyyy', { locale: es });
    case 'all':
      return 'Todos los registros';
    default:
      return '';
  }
}

/**
 * Verifica si un ejercicio se entrenó hoy (fecha exacta usando isSameDay)
 * Mejorada para usar comparación de días exacta sin dependencia de horas
 */
export const isExerciseTrainedToday = (exerciseId: string, workoutRecords: WorkoutRecord[]): boolean => {
  const today = startOfDay(new Date()); // Normalizar a inicio del día

  const result = workoutRecords.some(record => {
    const recordDay = startOfDay(record.date); // Normalizar a inicio del día
    const isSame = isSameDay(recordDay, today);
    return record.exerciseId === exerciseId && isSame;
  });

  return result;
};

/**
 * Obtiene todos los ejercicios entrenados hoy
 * Mejorada para usar comparación de días exacta
 */
export const getExercisesTrainedToday = (workoutRecords: WorkoutRecord[]): string[] => {
  const today = startOfDay(new Date()); // Normalizar a inicio del día

  const trainedToday = workoutRecords
    .filter(record => {
      const recordDay = startOfDay(record.date);
      const isSame = isSameDay(recordDay, today);
      return isSame;
    })
    .map(record => record.exerciseId);

  const uniqueIds = [...new Set(trainedToday)];
  return uniqueIds;
};

/**
 * Obtiene el día de la semana actual en español (formato usado en la app)
 */
export const getCurrentDayOfWeek = (): string => {
  const today = new Date();
  const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  return dayNames[today.getDay()];
};

/**
 * Verifica si un ejercicio se entrenó hoy Y coincide con el día actual
 * Solo debe aparecer verde si ambas condiciones se cumplen
 */
export const isExerciseTrainedTodayAndCorrectDay = (
  exerciseId: string,
  workoutRecords: WorkoutRecord[],
  currentTabDay: string
): boolean => {
  const todayDayOfWeek = getCurrentDayOfWeek();

  // Solo marcar verde si estamos en el tab del día correcto
  if (todayDayOfWeek !== currentTabDay) {
    return false;
  }

  // Y además debe haberse entrenado hoy
  const trainedToday = isExerciseTrainedToday(exerciseId, workoutRecords);

  return trainedToday;
};

/**
 * Obtiene todos los ejercicios entrenados hoy QUE COINCIDEN con el día actual
 * Solo para el tab correcto
 */
export const getExercisesTrainedTodayForCurrentDay = (
  workoutRecords: WorkoutRecord[],
  currentTabDay: string
): string[] => {
  const todayDayOfWeek = getCurrentDayOfWeek();

  // Solo procesar si estamos en el tab del día correcto
  if (todayDayOfWeek !== currentTabDay) {
    return [];
  }

  // Si es el tab correcto, obtener ejercicios entrenados hoy
  return getExercisesTrainedToday(workoutRecords);
}; 