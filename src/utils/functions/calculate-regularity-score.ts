import { getDay } from 'date-fns';
import type { WorkoutRecord } from '../../interfaces';
import { getCurrentDateFromRecords } from './get-current-date-from-records';

/**
 * Calcula score de regularidad mejorado que no penaliza patrones sistemáticos
 * MEJORADO: Considera el día de la semana actual para evaluaciones más justas
 */
export const calculateRegularityScore = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length < 3) return 50; // Score neutral para pocos datos

  const currentDate = getCurrentDateFromRecords(categoryRecords);
  const sortedRecords = [...categoryRecords].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // **MEJORA**: Considerar si la evaluación es en día temprano de la semana
  const currentWeekday = getDay(currentDate);
  const isEarlyWeek = currentWeekday <= 2; // Lunes o Martes

  const daysBetweenWorkouts: number[] = [];
  for (let i = 1; i < sortedRecords.length; i++) {
    const days = Math.floor(
      (new Date(sortedRecords[i].date).getTime() -
        new Date(sortedRecords[i - 1].date).getTime()) / (1000 * 60 * 60 * 24)
    );
    daysBetweenWorkouts.push(days);
  }

  // Detectar si hay un patrón sistemático
  const avgInterval = daysBetweenWorkouts.reduce((sum, days) => sum + days, 0) / daysBetweenWorkouts.length;
  const variance = daysBetweenWorkouts.reduce((sum, days) =>
    sum + Math.pow(days - avgInterval, 2), 0
  ) / daysBetweenWorkouts.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = avgInterval > 0 ? stdDev / avgInterval : 1;

  // **MEJORA**: Ajustar tolerancia basada en el día de la semana
  let toleranceThreshold = 0.3; // Umbral base
  if (isEarlyWeek) {
    // Ser más tolerante al inicio de la semana
    toleranceThreshold = 0.4;
  }

  // **MEJORA**: Considerar el último entrenamiento en el contexto del día actual
  const lastRecordDate = new Date(sortedRecords[sortedRecords.length - 1].date);
  const daysSinceLastWorkout = Math.floor(
    (currentDate.getTime() - lastRecordDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Si el último entrenamiento fue muy reciente y estamos al inicio de la semana,
  // no penalizar la consistencia
  if (isEarlyWeek && daysSinceLastWorkout <= 2) {
    toleranceThreshold = 0.5; // Aún más tolerante
  }

  // Mejorado: No penalizar patrones sistemáticos
  // Si el CV es bajo (< toleranceThreshold), es un patrón regular = buena puntuación
  if (coefficientOfVariation < toleranceThreshold) {
    return Math.min(100, 90 + (10 * (toleranceThreshold - coefficientOfVariation) / toleranceThreshold));
  }

  // Para mayor variabilidad, reducir puntuación gradualmente
  let regularityScore = Math.max(20, 90 - (coefficientOfVariation * 100));

  // **MEJORA**: Bonus por entrenamientos recientes al inicio de semana
  if (isEarlyWeek && daysSinceLastWorkout <= 1) {
    regularityScore = Math.min(100, regularityScore * 1.1); // 10% bonus
  }

  return Math.round(regularityScore);
}; 