import type { WorkoutRecord } from '@/interfaces';
import { getDay, getHours } from 'date-fns';
import type { DayMetrics } from './trends-interfaces';
import { calculateRealVolume } from './volume-calculations';

/**
 * Calcula métricas avanzadas por día de la semana
 * CORREGIDO: Comparación justa entre mismo día de semanas diferentes
 */
export const calculateDayMetrics = (records: WorkoutRecord[]): DayMetrics[] => {
  if (records.length === 0) return [];

  // Asegurar que los registros estén ordenados cronológicamente (más antiguos primero)
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dayStats: Record<number, { workouts: WorkoutRecord[]; volumes: number[]; times: number[]; weights: number[]; exercises: string[] }> = {};

  // Inicializar estadísticas por día
  for (let i = 0; i < 7; i++) {
    dayStats[i] = { workouts: [], volumes: [], times: [], weights: [], exercises: [] };
  }

  // Agrupar por día de la semana
  sortedRecords.forEach(record => {
    const dayIndex = getDay(new Date(record.date));
    const volume = record.weight * record.reps * record.sets;
    const hour = getHours(new Date(record.date));

    dayStats[dayIndex].workouts.push(record);
    dayStats[dayIndex].volumes.push(volume);
    dayStats[dayIndex].times.push(hour);
    dayStats[dayIndex].weights.push(record.weight);
    if (record.exercise) {
      dayStats[dayIndex].exercises.push(record.exercise.name);
    }
  });

  const totalVolume = sortedRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

  const dayMetrics: DayMetrics[] = [];

  for (let i = 0; i < 7; i++) {
    const dayWorkouts = dayStats[i].workouts;
    const dayVolumes = dayStats[i].volumes;
    const dayWeights = dayStats[i].weights;
    const dayTimes = dayStats[i].times;
    const dayExercises = dayStats[i].exercises;

    const workoutCount = dayWorkouts.length;
    const dayTotalVolume = dayVolumes.reduce((sum, vol) => sum + vol, 0);
    const avgVolume = workoutCount > 0 ? dayTotalVolume / workoutCount : 0;
    const percentage = totalVolume > 0 ? (dayTotalVolume / totalVolume) * 100 : 0;

    // Calcular métricas básicas
    const maxWeight = dayWeights.length > 0 ? Math.max(...dayWeights) : 0;
    const avgWeight = dayWeights.length > 0 ? dayWeights.reduce((sum, w) => sum + w, 0) / dayWeights.length : 0;
    const uniqueExercises = new Set(dayExercises).size;

    // Calcular repeticiones y series promedio
    const totalReps = dayWorkouts.reduce((sum, w) => sum + w.reps, 0);
    const totalSets = dayWorkouts.reduce((sum, w) => sum + w.sets, 0);
    const avgReps = workoutCount > 0 ? totalReps / workoutCount : 0;
    const avgSets = workoutCount > 0 ? totalSets / workoutCount : 0;

    // Calcular hora más frecuente
    let mostFrequentTime = null;
    if (dayTimes.length > 0) {
      const timeGroups: Record<string, number> = {};
      dayTimes.forEach(time => {
        const timeRange = time < 6 ? 'Madrugada' : time < 12 ? 'Mañana' : time < 18 ? 'Tarde' : 'Noche';
        timeGroups[timeRange] = (timeGroups[timeRange] || 0) + 1;
      });
      mostFrequentTime = Object.entries(timeGroups).reduce((a, b) => timeGroups[a[0]] > timeGroups[b[0]] ? a : b)[0];
    }

    // Calcular consistencia como frecuencia semanal de este día
    const totalDays = sortedRecords.length > 0 ?
      Math.max(1, Math.ceil((new Date(sortedRecords[sortedRecords.length - 1].date).getTime() -
        new Date(sortedRecords[0].date).getTime()) / (1000 * 60 * 60 * 24 * 7))) : 1;

    // CORREGIDO: Limitar consistencia máxima a 100%
    const rawConsistency = (workoutCount / totalDays) * 100;
    const consistency = Math.min(100, Math.round(rawConsistency));

    // **CORRECCIÓN CLAVE**: Tendencia comparando mismo día de semanas diferentes
    let trend = 0;

    if (workoutCount >= 3) {
      // Calcular tendencias con 3+ entrenamientos usando lógica realista
      const thisDayRecords = dayWorkouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (workoutCount >= 4) {
        // CORRECCIÓN CLAVE: Verificar si hay distribución temporal real
        const uniqueDates = new Set(thisDayRecords.map(r => r.date.toDateString()));

        if (uniqueDates.size <= 2) {
          // Si todos los entrenamientos están en 1-2 días, no calcular tendencia temporal
          trend = 10; // Tendencia positiva leve por actividad consistente
        } else {
          // Solo si hay distribución temporal real, calcular tendencia
          const halfPoint = Math.floor(thisDayRecords.length / 2);
          const olderOccurrences = thisDayRecords.slice(0, halfPoint);
          const recentOccurrences = thisDayRecords.slice(halfPoint);

          const olderAvgVolume = olderOccurrences.reduce((sum, r) =>
            sum + calculateRealVolume(r), 0) / olderOccurrences.length;

          const recentAvgVolume = recentOccurrences.reduce((sum, r) =>
            sum + calculateRealVolume(r), 0) / recentOccurrences.length;

          if (olderAvgVolume > 0) {
            const rawTrend = ((recentAvgVolume - olderAvgVolume) / olderAvgVolume) * 100;
            // Aplicar threshold realista para detectar cambios significativos
            if (Math.abs(rawTrend) >= 8) {
              trend = Math.max(-30, Math.min(30, Math.round(rawTrend * 0.6))); // Factor conservador
            } else {
              trend = 5; // Tendencia positiva leve por defecto
            }
          } else if (recentAvgVolume > 0) {
            trend = 25; // Comenzó a entrenar en este día
          }
        }
      } else {
        // Para exactamente 3 entrenamientos: verificar distribución temporal
        const uniqueDates = new Set(thisDayRecords.map(r => r.date.toDateString()));

        if (uniqueDates.size <= 1) {
          // Si todos los entrenamientos están en el mismo día
          trend = 8; // Tendencia positiva leve por actividad
        } else {
          // Si hay distribución temporal, comparar primer vs último
          const firstVolume = calculateRealVolume(thisDayRecords[0]);
          const lastVolume = calculateRealVolume(thisDayRecords[2]);

          if (firstVolume > 0) {
            const rawTrend = ((lastVolume - firstVolume) / firstVolume) * 100;
            // Threshold más bajo para pocos datos
            if (Math.abs(rawTrend) >= 12) {
              trend = Math.max(-20, Math.min(20, Math.round(rawTrend * 0.5))); // Factor muy conservador
            } else {
              trend = 5; // Leve positivo por defecto con pocos datos
            }
          } else {
            trend = 5;
          }
        }
      }
    } else if (workoutCount === 2) {
      // Para 2 entrenamientos: verificar si están en días diferentes
      const thisDayRecords = dayWorkouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const uniqueDates = new Set(thisDayRecords.map(r => r.date.toDateString()));

      if (uniqueDates.size <= 1) {
        // Si ambos entrenamientos están en el mismo día
        trend = 6; // Tendencia positiva leve por actividad
      } else {
        // Si están en días diferentes, comparar con mucha cautela
        const firstVolume = calculateRealVolume(thisDayRecords[0]);
        const lastVolume = calculateRealVolume(thisDayRecords[1]);

        if (firstVolume > 0) {
          const rawTrend = ((lastVolume - firstVolume) / firstVolume) * 100;
          // Solo marcar tendencia si hay cambio muy significativo
          if (rawTrend > 25) {
            trend = Math.min(15, Math.round(rawTrend * 0.3)); // Factor muy conservador
          } else if (rawTrend < -30) {
            trend = Math.max(-10, Math.round(rawTrend * 0.3));
          } else {
            trend = 3; // Muy leve positivo por defecto
          }
        } else {
          trend = 3;
        }
      }
    } else if (workoutCount === 1) {
      // Primera vez entrenando en este día = tendencia positiva leve
      trend = 20; // Positivo moderado para nuevo día
    }

    // Performance score (0-100) basado en volumen, consistencia y variedad
    const volumeScore = totalVolume > 0 ? Math.min(100, (dayTotalVolume / totalVolume) * 700) : 0;
    const consistencyScore = Math.min(100, consistency * 2);
    const varietyScore = Math.min(100, uniqueExercises * 20);
    const performanceScore = Math.round((volumeScore + consistencyScore + varietyScore) / 3);

    // Ejercicio más frecuente
    let topExercise = 'N/A';
    if (dayExercises.length > 0) {
      const exerciseCount: Record<string, number> = {};
      dayExercises.forEach(ex => {
        exerciseCount[ex] = (exerciseCount[ex] || 0) + 1;
      });
      topExercise = Object.entries(exerciseCount).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }

    // Eficiencia (volumen por entrenamiento)
    const efficiency = avgVolume;

    // Intensidad (peso promedio relativo al máximo del día)
    const intensity = maxWeight > 0 ? (avgWeight / maxWeight) * 100 : 0;

    // Generar recomendaciones específicas
    const recommendations: string[] = [];

    if (workoutCount === 0) {
      recommendations.push(`Considera añadir entrenamientos los ${dayNames[i].toLowerCase()} para equilibrar tu rutina semanal.`);
    } else {
      if (trend > 0) {
        recommendations.push(`¡Excelente progreso en ${dayNames[i].toLowerCase()}! Continúa con esta tendencia.`);
      } else if (trend < -10) {
        recommendations.push(`Tu rendimiento en ${dayNames[i].toLowerCase()} ha disminuido. Revisa tu recuperación y técnica.`);
      }

      if (consistency < 30) {
        recommendations.push(`Mejora la consistencia entrenando más regularmente los ${dayNames[i].toLowerCase()}.`);
      }

      if (uniqueExercises <= 1 && workoutCount > 2) {
        recommendations.push(`Añade variedad de ejercicios en tus entrenamientos de ${dayNames[i].toLowerCase()}.`);
      }
    }

    dayMetrics.push({
      dayName: dayNames[i],
      dayIndex: i,
      workouts: workoutCount,
      avgVolume,
      totalVolume: dayTotalVolume,
      percentage,
      mostFrequentTime,
      maxWeight,
      avgWeight,
      uniqueExercises,
      avgReps,
      avgSets,
      totalSets,
      consistency,
      trend,
      performanceScore,
      topExercise,
      efficiency,
      intensity,
      recommendations
    });
  }

  return dayMetrics;
}; 