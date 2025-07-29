import { WorkoutRecord } from "@/interfaces";

/**
 * Valida que un registro de entrenamiento sea válido para cálculos
 */
export const isValidRecord = (record: WorkoutRecord): boolean => {
  // Validaciones básicas
  if (!(record.weight > 0 &&
    record.reps > 0 &&
    record.sets > 0 &&
    isFinite(record.weight) &&
    isFinite(record.reps) &&
    isFinite(record.sets) &&
    record.date instanceof Date &&
    !isNaN(record.date.getTime()))) {
    return false;
  }

  // Rechazar fechas futuras que distorsionan cálculos
  const now = new Date();
  const tolerance = 24 * 60 * 60 * 1000; // 1 día de tolerancia para zona horaria

  if (record.date.getTime() > now.getTime() + tolerance) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ Registro con fecha futura ignorado: ${record.date.toISOString().split('T')[0]} (peso: ${record.weight}kg)`);
    }
    return false;
  }

  return true;
};