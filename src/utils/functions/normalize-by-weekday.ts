import { getDay } from 'date-fns';
import type { ExerciseAssignment } from '../../interfaces';

/**
 * Normaliza métricas semanales basándose en el día actual de la semana
 * CRÍTICO: Evita comparaciones injustas entre semanas incompletas vs completas
 */
export const normalizeByWeekday = (
  currentWeekValue: number,
  comparisonWeekValue: number,
  currentDate: Date = new Date(),
  allAssignments?: ExerciseAssignment[] // Usar asignaciones en lugar de registros
): {
  normalizedCurrent: number;
  normalizedComparison: number;
  weekdayFactor: number;
} => {
  const currentWeekday = getDay(currentDate); // 0 = domingo, 6 = sábado

  // **MEJORA**: Detectar patrón de entrenamiento basado en asignaciones configuradas
  let weekdayFactors: Record<number, number>;

  if (allAssignments && allAssignments.length > 0) {
    // Analizar distribución de asignaciones por día
    const weekdayDistribution = new Array(7).fill(0);
    const totalAssignments = allAssignments.length;

    allAssignments.forEach(assignment => {
      // Mapear DayOfWeek a índice numérico (0-6)
      const dayMap: Record<string, number> = {
        'domingo': 0,
        'lunes': 1,
        'martes': 2,
        'miércoles': 3,
        'jueves': 4,
        'viernes': 5,
        'sábado': 6
      };
      const weekday = dayMap[assignment.dayOfWeek];
      if (weekday !== undefined) {
        weekdayDistribution[weekday]++;
      }
    });

    // Calcular porcentajes de asignaciones por día
    const weekdayPercentages = weekdayDistribution.map(count => count / totalAssignments);

    // Crear factores basados en distribución de asignaciones
    const cumulativePercentages = weekdayPercentages.map((_percentage, index) =>
      weekdayPercentages.slice(0, index + 1).reduce((sum, p) => sum + p, 0)
    );

    weekdayFactors = {
      0: cumulativePercentages[0], // Domingo
      1: cumulativePercentages[1], // Lunes
      2: cumulativePercentages[2], // Martes
      3: cumulativePercentages[3], // Miércoles
      4: cumulativePercentages[4], // Jueves
      5: cumulativePercentages[5], // Viernes
      6: cumulativePercentages[6]  // Sábado
    };
  } else {
    // Fallback: distribución típica (lunes a viernes)
    weekdayFactors = {
      0: 0.0,   // Domingo - no entrena
      1: 0.20,  // Lunes - 20% de la semana
      2: 0.40,  // Martes - 40% de la semana  
      3: 0.60,  // Miércoles - 60% de la semana
      4: 0.80,  // Jueves - 80% de la semana
      5: 1.0,   // Viernes - 100% de la semana
      6: 1.0    // Sábado - 100% de la semana (no entrena)
    };
  }

  const weekdayFactor = weekdayFactors[currentWeekday] || 1.0;

  // Si estamos a mitad de semana, proyectar el valor completo de la semana actual
  const normalizedCurrent = weekdayFactor > 0 ? currentWeekValue / weekdayFactor : currentWeekValue;

  // La semana de comparación ya está completa, no necesita normalización
  const normalizedComparison = comparisonWeekValue;

  return {
    normalizedCurrent,
    normalizedComparison,
    weekdayFactor
  };
}; 