import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Utilidades genéricas para el manejo de tiempo
 * Reutilizable en RecentWorkouts, Dashboard, Calendar, etc.
 */

/**
 * Formatea una fecha de manera relativa (hace X horas, días, etc.)
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  // Menos de 1 hora
  if (diffInMinutes < 60) {
    if (diffInMinutes < 1) return 'Hace menos de 1 minuto';
    if (diffInMinutes === 1) return 'Hace 1 minuto';
    return `Hace ${diffInMinutes} minutos`;
  }

  // Menos de 24 horas
  if (diffInHours < 24) {
    if (diffInHours === 1) return 'Hace 1 hora';
    return `Hace ${diffInHours} horas`;
  }

  // Menos de 7 días
  if (diffInDays < 7) {
    if (diffInDays === 1) return 'Ayer';
    return `Hace ${diffInDays} días`;
  }

  // Más de 7 días: mostrar fecha formateada
  return format(date, 'dd MMM yyyy', { locale: es });
};

/**
 * Obtiene la diferencia en horas entre dos fechas
 */
export const getHoursDifference = (date1: Date, date2: Date): number => {
  return Math.floor(Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60));
};

/**
 * Obtiene la diferencia en días entre dos fechas
 */
export const getDaysDifference = (date1: Date, date2: Date): number => {
  return Math.floor(Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Verifica si una fecha es de hoy
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Verifica si una fecha es de ayer
 */
export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

/**
 * Verifica si una fecha está dentro de la semana actual
 */
export const isThisWeek = (date: Date): boolean => {
  const diffInDays = getDaysDifference(new Date(), date);
  return diffInDays <= 7;
};

/**
 * Formatea una fecha de manera compacta (para espacios reducidos)
 */
export const formatCompactDate = (date: Date): string => {
  if (isToday(date)) return 'Hoy';
  if (isYesterday(date)) return 'Ayer';
  if (isThisWeek(date)) return format(date, 'EEEE', { locale: es });
  return format(date, 'dd/MM', { locale: es });
}; 