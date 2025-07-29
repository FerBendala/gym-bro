import type { WorkoutRecord } from '@/interfaces';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { clamp, roundToDecimals } from './math-utils';
import type { DayMetrics } from './trends-interfaces';
import { calculateVolume } from './volume-calculations';
import { getMaxWeight } from './workout-utils';

/**
 * Calcula métricas detalladas por día de la semana
 * Refactorizado para usar funciones centralizadas
 */
export const calculateDayMetrics = (records: WorkoutRecord[]): DayMetrics[] => {
  if (records.length === 0) return [];

  // Agrupar registros por día de la semana
  const dayGroups = new Map<string, WorkoutRecord[]>();

  records.forEach(record => {
    const dayName = format(new Date(record.date), 'EEEE', { locale: es });
    if (!dayGroups.has(dayName)) {
      dayGroups.set(dayName, []);
    }
    dayGroups.get(dayName)!.push(record);
  });

  // Calcular volumen total usando función centralizada
  const totalVolume = records.reduce((sum, r) => sum + calculateVolume(r), 0);

  // Días de la semana en orden
  const daysOfWeek = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

  return daysOfWeek.map((dayName, dayIndex) => {
    const dayWorkouts = dayGroups.get(dayName) || [];
    const workoutCount = dayWorkouts.length;

    if (workoutCount === 0) {
      return {
        dayName,
        dayIndex,
        workouts: 0,
        avgVolume: 0,
        totalVolume: 0,
        percentage: 0,
        mostFrequentTime: null,
        maxWeight: 0,
        avgWeight: 0,
        uniqueExercises: 0,
        avgReps: 0,
        avgSets: 0,
        totalSets: 0,
        consistency: 0,
        trend: 0,
        performanceScore: 0,
        topExercise: 'N/A',
        efficiency: 0,
        intensity: 0,
        recommendations: []
      };
    }

    // Calcular métricas básicas usando funciones centralizadas
    const volumes = dayWorkouts.map(r => calculateVolume(r));
    const weights = dayWorkouts.map(r => r.weight);
    const reps = dayWorkouts.map(r => r.reps);
    const sets = dayWorkouts.map(r => r.sets);

    const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
    const totalVolume = volumes.reduce((sum, v) => sum + v, 0);
    const percentage = totalVolume > 0 ? (totalVolume / totalVolume) * 100 : 0;

    // Usar función centralizada para calcular máximo
    const maxWeight = getMaxWeight(dayWorkouts);
    const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
    const avgReps = reps.reduce((sum, r) => sum + r, 0) / reps.length;
    const avgSets = sets.reduce((sum, s) => sum + s, 0) / sets.length;
    const totalSets = sets.reduce((sum, s) => sum + s, 0);

    // Ejercicios únicos
    const uniqueExercises = new Set(dayWorkouts.map(r => r.exercise?.name)).size;

    // Tiempo más frecuente (simplificado)
    const mostFrequentTime = null; // Calculado separadamente si es necesario

    // Calcular consistencia (menor desviación = mayor consistencia)
    const meanVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
    const variance = volumes.reduce((sum, v) => sum + Math.pow(v - meanVolume, 2), 0) / volumes.length;
    const stdDev = Math.sqrt(variance);
    const consistency = meanVolume > 0 ? clamp(100 - ((stdDev / meanVolume) * 100), 0, 100) : 0;

    // Calcular tendencia vs semanas anteriores
    let trend = 0;
    const sortedDayWorkouts = [...dayWorkouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (workoutCount >= 4) {
      // Para 4+ entrenamientos: dividir en dos períodos
      const halfPoint = Math.floor(sortedDayWorkouts.length / 2);
      const olderOccurrences = sortedDayWorkouts.slice(0, halfPoint);
      const recentOccurrences = sortedDayWorkouts.slice(halfPoint);

      const olderAvgVolume = olderOccurrences.reduce((sum, r) =>
        sum + calculateVolume(r), 0) / olderOccurrences.length;

      const recentAvgVolume = recentOccurrences.reduce((sum, r) =>
        sum + calculateVolume(r), 0) / recentOccurrences.length;

      if (olderAvgVolume > 0) {
        const rawTrend = ((recentAvgVolume - olderAvgVolume) / olderAvgVolume) * 100;
        trend = clamp(Math.round(rawTrend * 0.6), -30, 30); // Factor conservador
      }
    } else if (workoutCount === 3) {
      // Para exactamente 3 entrenamientos: verificar distribución temporal
      const uniqueDates = new Set(sortedDayWorkouts.map(r => r.date.toDateString()));

      if (uniqueDates.size <= 1) {
        // Si todos los entrenamientos están en el mismo día
        trend = 8; // Tendencia positiva leve por actividad
      } else {
        // Si hay distribución temporal, comparar primer vs último
        const firstVolume = calculateVolume(sortedDayWorkouts[0]);
        const lastVolume = calculateVolume(sortedDayWorkouts[2]);

        if (firstVolume > 0) {
          const rawTrend = ((lastVolume - firstVolume) / firstVolume) * 100;
          trend = clamp(Math.round(rawTrend * 0.5), -20, 20); // Factor muy conservador
        }
      }
    } else if (sortedDayWorkouts.length >= 2) {
      const firstVolume = calculateVolume(sortedDayWorkouts[0]);
      const lastVolume = calculateVolume(sortedDayWorkouts[1]);
      if (firstVolume > 0) {
        const rawTrend = ((lastVolume - firstVolume) / firstVolume) * 100;
        trend = clamp(Math.round(rawTrend * 0.3), 0, 15); // Factor muy conservador
      } else {
        trend = 3; // Valor por defecto si no hay datos
      }
    } else if (workoutCount === 1) {
      // Primera vez entrenando en este día = tendencia positiva leve
      trend = 20; // Positivo moderado para nuevo día
    }

    // Calcular scores de rendimiento
    const volumeScore = totalVolume > 0 ? clamp((totalVolume / totalVolume) * 700, 0, 100) : 0;
    const consistencyScore = clamp(consistency * 2, 0, 100);
    const varietyScore = clamp(uniqueExercises * 20, 0, 100);
    const performanceScore = Math.round((volumeScore + consistencyScore + varietyScore) / 3);

    // Ejercicio más frecuente
    let topExercise = 'N/A';
    if (dayWorkouts.length > 0) {
      const exerciseCount: Record<string, number> = {};
      dayWorkouts.forEach(workout => {
        const exerciseName = workout.exercise?.name || 'Ejercicio desconocido';
        exerciseCount[exerciseName] = (exerciseCount[exerciseName] || 0) + 1;
      });
      topExercise = Object.entries(exerciseCount).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }

    // Eficiencia (volumen por entrenamiento)
    const efficiency = avgVolume;

    // Intensidad (peso promedio relativo)
    const intensity = avgWeight;

    // Recomendaciones basadas en métricas
    const recommendations: string[] = [];

    if (workoutCount === 0) {
      recommendations.push('Considera entrenar este día para mejor balance');
    } else if (workoutCount >= 3) {
      recommendations.push('Excelente frecuencia en este día');
    } else if (trend > 10) {
      recommendations.push('Tendencia positiva - mantén el momentum');
    } else if (trend < -10) {
      recommendations.push('Considera ajustar la intensidad');
    }

    if (consistency < 50) {
      recommendations.push('Varía la intensidad para mejor consistencia');
    }

    if (uniqueExercises < 2) {
      recommendations.push('Considera más variedad de ejercicios');
    }

    return {
      dayName,
      dayIndex,
      workouts: workoutCount,
      avgVolume: roundToDecimals(avgVolume),
      totalVolume: roundToDecimals(totalVolume),
      percentage: roundToDecimals(percentage, 1),
      mostFrequentTime,
      maxWeight: roundToDecimals(maxWeight),
      avgWeight: roundToDecimals(avgWeight, 2),
      uniqueExercises,
      avgReps: roundToDecimals(avgReps, 2),
      avgSets: roundToDecimals(avgSets, 2),
      totalSets,
      consistency: roundToDecimals(consistency),
      trend: roundToDecimals(trend, 1),
      performanceScore,
      topExercise,
      efficiency: roundToDecimals(efficiency),
      intensity: roundToDecimals(intensity),
      recommendations
    };
  });
}; 