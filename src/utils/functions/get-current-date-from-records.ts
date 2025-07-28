import type { WorkoutRecord } from '@/interfaces';

/**
 * Obtiene la fecha "actual" basada en los datos reales del usuario
 * En lugar de usar new Date() que puede estar en un año diferente
 */
export const getCurrentDateFromRecords = (records: WorkoutRecord[]): Date => {
  if (records.length === 0) {
    return new Date(); // Fallback a fecha del sistema si no hay datos
  }

  // Usar la fecha más reciente de los entrenamientos
  const latestDate = new Date(Math.max(...records.map(r => new Date(r.date).getTime())));

  // En lugar de verificar si es "muy antigua", simplemente usar la fecha más reciente
  // esto maneja tanto datos pasados como futuros correctamente
  return latestDate;
}; 