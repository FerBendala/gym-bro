import type { DayOfWeek } from '../../interfaces';

/**
 * Utilidades genéricas para tabs y navegación
 * Reutilizable en TabNavigation, breadcrumbs, segmented controls, etc.
 */

/**
 * Capitaliza la primera letra de un string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Formatea un día de la semana para mostrar
 */
export const formatDayLabel = (day: DayOfWeek): string => {
  return capitalize(day);
};

/**
 * Formatea un día de la semana en formato corto (3 letras)
 */
export const formatDayShort = (day: DayOfWeek): string => {
  const shortDays: Record<DayOfWeek, string> = {
    lunes: 'Lun',
    martes: 'Mar',
    miércoles: 'Mié',
    jueves: 'Jue',
    viernes: 'Vie',
    sábado: 'Sáb',
    domingo: 'Dom'
  };

  return shortDays[day];
};

/**
 * Obtiene el día siguiente en la semana
 */
export const getNextDay = (currentDay: DayOfWeek): DayOfWeek => {
  const days: DayOfWeek[] = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const currentIndex = days.indexOf(currentDay);
  const nextIndex = (currentIndex + 1) % days.length;
  return days[nextIndex];
};

/**
 * Obtiene el día anterior en la semana
 */
export const getPreviousDay = (currentDay: DayOfWeek): DayOfWeek => {
  const days: DayOfWeek[] = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const currentIndex = days.indexOf(currentDay);
  const previousIndex = currentIndex === 0 ? days.length - 1 : currentIndex - 1;
  return days[previousIndex];
};

/**
 * Verifica si un día es fin de semana
 */
export const isWeekend = (day: DayOfWeek): boolean => {
  return day === 'sábado' || day === 'domingo';
};

/**
 * Verifica si un día es día laboral
 */
export const isWeekday = (day: DayOfWeek): boolean => {
  return !isWeekend(day);
};

/**
 * Obtiene el índice numérico del día (0 = lunes)
 */
export const getDayIndex = (day: DayOfWeek): number => {
  const days: DayOfWeek[] = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  return days.indexOf(day);
};

/**
 * Obtiene un día por su índice (0 = lunes)
 */
export const getDayByIndex = (index: number): DayOfWeek => {
  const days: DayOfWeek[] = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  return days[index % days.length];
};

/**
 * Obtiene el día actual de la semana
 */
export const getCurrentDay = (): DayOfWeek => {
  const today = new Date().getDay();
  // JavaScript usa 0=domingo, 1=lunes... convertimos a nuestro formato
  const dayIndex = today === 0 ? 6 : today - 1; // 0=lunes en nuestro sistema
  return getDayByIndex(dayIndex);
};

/**
 * Crea una función de manejo de navegación entre tabs
 */
export const createTabNavigationHandler = <T>(
  currentValue: T,
  onChange: (value: T) => void,
  values: T[]
) => {
  return {
    goToNext: () => {
      const currentIndex = values.indexOf(currentValue);
      const nextIndex = (currentIndex + 1) % values.length;
      onChange(values[nextIndex]);
    },
    goToPrevious: () => {
      const currentIndex = values.indexOf(currentValue);
      const previousIndex = currentIndex === 0 ? values.length - 1 : currentIndex - 1;
      onChange(values[previousIndex]);
    },
    goTo: (value: T) => onChange(value),
    currentIndex: values.indexOf(currentValue),
    isFirst: values.indexOf(currentValue) === 0,
    isLast: values.indexOf(currentValue) === values.length - 1
  };
}; 