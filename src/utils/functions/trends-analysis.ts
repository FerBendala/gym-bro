import { endOfWeek, format, getDay, getHours, startOfWeek, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import type { WorkoutRecord } from '../../interfaces';

/**
 * Calcula el volumen real de un registro usando series individuales si están disponibles
 */
const calculateRealVolume = (record: WorkoutRecord): number => {
  // Si tiene series individuales, calcular volumen sumando cada serie
  if (record.individualSets && record.individualSets.length > 0) {
    return record.individualSets.reduce((total, set) => {
      return total + (set.weight * set.reps);
    }, 0);
  }

  // Fallback: usar valores agregados
  return record.weight * record.reps * record.sets;
};

/**
 * Interfaz para métricas por día de la semana mejorada
 */
export interface DayMetrics {
  dayName: string;
  dayIndex: number;
  workouts: number;
  avgVolume: number;
  totalVolume: number;
  percentage: number;
  mostFrequentTime: string | null;
  // Nuevas métricas
  maxWeight: number;
  avgWeight: number;
  uniqueExercises: number;
  avgReps: number;
  avgSets: number;
  totalSets: number;
  consistency: number; // Score de consistencia para este día
  trend: number; // Cambio vs semanas anteriores
  performanceScore: number; // Score combinado 0-100
  topExercise: string; // Ejercicio más frecuente
  efficiency: number; // Volumen por entrenamiento
  intensity: number; // Peso promedio relativo
  recommendations: string[];
}

/**
 * Interfaz para tendencias temporales mejorada
 */
export interface TemporalTrend {
  period: string;
  fullDate: string;
  workouts: number;
  volume: number;
  avgWeight: number;
  maxWeight: number;
  weekNumber: number;
  // Nuevas métricas
  volumeChange: number; // Cambio vs semana anterior
  volumeChangePercent: number; // Cambio porcentual
  workoutChange: number; // Cambio en número de entrenamientos
  consistency: number; // Consistencia dentro de la semana
  momentum: 'Creciente' | 'Estable' | 'Decreciente'; // Tendencia general
  performanceScore: number; // Score combinado 0-100
  uniqueExercises: number; // Variedad de ejercicios
  avgReps: number; // Repeticiones promedio
  avgSets: number; // Series promedio
  totalSets: number; // Total de series
  weeklyStrength: number; // Fuerza promedio de la semana
}

/**
 * Interfaz para análisis de evolución temporal
 */
export interface TemporalEvolution {
  trends: TemporalTrend[];
  overallTrend: 'Mejorando' | 'Estable' | 'Declinando';
  growthRate: number; // Tasa de crecimiento semanal
  volatility: number; // Volatilidad del rendimiento
  predictions: {
    nextWeekVolume: number;
    nextWeekWorkouts: number;
    confidence: number;
    trend: 'Alcista' | 'Bajista' | 'Lateral';
  };
  cycles: {
    hasWeeklyCycle: boolean;
    peakDay: string;
    lowDay: string;
    cyclePeriod: number;
  };
  milestones: {
    bestWeek: TemporalTrend | null;
    worstWeek: TemporalTrend | null;
    mostConsistentWeek: TemporalTrend | null;
    biggestImprovement: TemporalTrend | null;
  };
  periodComparisons: {
    last4Weeks: { volume: number; workouts: number; avgWeight: number };
    previous4Weeks: { volume: number; workouts: number; avgWeight: number };
    improvement: { volume: number; workouts: number; avgWeight: number };
  };
  insights: string[];
  warnings: string[];
}

/**
 * Interfaz para hábitos de entrenamiento mejorada
 */
export interface WorkoutHabits {
  preferredDay: string;
  preferredTime: string;
  avgSessionDuration: number; // Estimado en minutos
  consistencyScore: number; // 0-100
  peakProductivityHours: string[];
  restDayPattern: string;
  // Nuevas métricas
  weeklyFrequency: number; // Entrenamientos por semana
  habitStrength: 'Muy Débil' | 'Débil' | 'Moderado' | 'Fuerte' | 'Muy Fuerte';
  scheduleFlexibility: 'Muy Rígido' | 'Rígido' | 'Flexible' | 'Muy Flexible';
  motivationPattern: 'Inconsistente' | 'Creciente' | 'Estable' | 'Decreciente';
  bestPerformanceDay: string;
  bestPerformanceTime: string;
  workoutStreaks: {
    current: number; // Días consecutivos actual
    longest: number; // Racha más larga
    average: number; // Promedio de rachas
  };
  behaviorInsights: string[];
  recommendations: string[];
  riskFactors: string[];
}

/**
 * Interfaz para análisis completo de tendencias
 */
export interface TrendsAnalysis {
  dayMetrics: DayMetrics[];
  dayMetricsOrdered: DayMetrics[]; // Ordenado Lunes a Domingo
  temporalTrends: TemporalTrend[];
  temporalEvolution: TemporalEvolution;
  workoutHabits: WorkoutHabits;
  volumeTrendByDay: { day: string; trend: number }[];
  bestPerformancePeriod: string;
}

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

  const totalWorkouts = sortedRecords.length;
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

/**
 * Calcula tendencias temporales mejoradas por semana
 */
export const calculateTemporalTrends = (records: WorkoutRecord[], weeksCount: number = 12): TemporalTrend[] => {
  if (records.length === 0) return [];

  const now = new Date();
  const trends: TemporalTrend[] = [];

  for (let i = 0; i < weeksCount; i++) {
    const weekStart = startOfWeek(subWeeks(now, i), { locale: es });
    const weekEnd = endOfWeek(weekStart, { locale: es });

    const weekRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= weekStart && recordDate <= weekEnd;
    });

    if (weekRecords.length > 0) {
      const totalVolume = weekRecords.reduce((sum, record) =>
        sum + (record.weight * record.reps * record.sets), 0
      );

      const weights = weekRecords.map(record => record.weight);
      const avgWeight = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
      const maxWeight = Math.max(...weights);

      // Calcular métricas adicionales
      const uniqueExercises = new Set(weekRecords.map(r => r.exerciseId)).size;
      const totalReps = weekRecords.reduce((sum, r) => sum + r.reps, 0);
      const totalSets = weekRecords.reduce((sum, r) => sum + r.sets, 0);
      const avgReps = totalReps / weekRecords.length;
      const avgSets = totalSets / weekRecords.length;

      // Calcular consistencia de la semana (distribución de entrenamientos)
      const dailyWorkouts = Array(7).fill(0);
      weekRecords.forEach(record => {
        const dayIndex = getDay(new Date(record.date));
        dailyWorkouts[dayIndex]++;
      });
      const workoutDays = dailyWorkouts.filter(count => count > 0).length;
      const consistency = Math.round((workoutDays / 7) * 100);

      // Calcular fuerza promedio (peso promedio ponderado por volumen)
      const weeklyStrength = weekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0) / totalVolume;

      const trend: TemporalTrend = {
        period: format(weekStart, 'dd/MM', { locale: es }),
        fullDate: format(weekStart, 'yyyy-MM-dd', { locale: es }),
        workouts: weekRecords.length,
        volume: Math.round(totalVolume),
        avgWeight: Math.round(avgWeight * 100) / 100,
        maxWeight: Math.round(maxWeight * 100) / 100,
        weekNumber: weeksCount - i,
        volumeChange: 0, // Se calculará después
        volumeChangePercent: 0, // Se calculará después
        workoutChange: 0, // Se calculará después
        consistency,
        momentum: 'Estable', // Se calculará después
        performanceScore: 0, // Se calculará después
        uniqueExercises,
        avgReps: Math.round(avgReps * 100) / 100,
        avgSets: Math.round(avgSets * 100) / 100,
        totalSets,
        weeklyStrength: Math.round(weeklyStrength * 100) / 100
      };

      trends.push(trend);
    }
  }

  // Ordenar por fecha (más antiguo primero)
  trends.sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  // **CORRECCIÓN CLAVE**: Calcular cambios usando volumen promedio por sesión
  for (let i = 1; i < trends.length; i++) {
    const current = trends[i];
    const previous = trends[i - 1];

    // Calcular volumen promedio por sesión para comparación justa
    const currentAvgVolume = current.workouts > 0 ? current.volume / current.workouts : 0;
    const previousAvgVolume = previous.workouts > 0 ? previous.volume / previous.workouts : 0;

    // Cambio absoluto en volumen promedio por sesión
    current.volumeChange = Math.round(currentAvgVolume - previousAvgVolume);

    // Cambio porcentual basado en volumen promedio por sesión
    current.volumeChangePercent = previousAvgVolume > 0 ?
      Math.round(((currentAvgVolume - previousAvgVolume) / previousAvgVolume) * 100) : 0;

    current.workoutChange = current.workouts - previous.workouts;

    // **CORRECCIÓN CLAVE**: Calcular momentum usando volumen promedio por sesión
    if (i >= 2) {
      const trend1 = trends[i - 2];
      const trend2 = trends[i - 1];
      const trend3 = trends[i];

      const avgVolume1 = trend1.workouts > 0 ? trend1.volume / trend1.workouts : 0;
      const avgVolume2 = trend2.workouts > 0 ? trend2.volume / trend2.workouts : 0;
      const avgVolume3 = trend3.workouts > 0 ? trend3.volume / trend3.workouts : 0;

      const change1 = avgVolume2 - avgVolume1;
      const change2 = avgVolume3 - avgVolume2;

      if (change1 > 0 && change2 > 0) current.momentum = 'Creciente';
      else if (change1 < 0 && change2 < 0) current.momentum = 'Decreciente';
      else current.momentum = 'Estable';
    }

    // Calcular performance score (0-100)
    const volumeScore = Math.min(100, (current.volume / 10000) * 100);
    const consistencyScore = current.consistency;
    const varietyScore = Math.min(100, (current.uniqueExercises / 10) * 100);
    current.performanceScore = Math.round((volumeScore + consistencyScore + varietyScore) / 3);
  }

  return trends.slice(-8); // Últimas 8 semanas con datos
};

/**
 * Calcula las rachas de entrenamientos
 */
const calculateWorkoutStreaks = (records: WorkoutRecord[]): { current: number; longest: number; average: number } => {
  if (records.length === 0) {
    return { current: 0, longest: 0, average: 0 };
  }

  // Ordenar registros por fecha
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Obtener fechas únicas de entrenamiento
  const uniqueDates = [...new Set(sortedRecords.map(r => new Date(r.date).toDateString()))];
  const workoutDates = uniqueDates.map(date => new Date(date));

  // Calcular rachas
  const streaks: number[] = [];
  let currentStreak = 1;
  let longestStreak = 1;

  for (let i = 1; i < workoutDates.length; i++) {
    const daysDiff = Math.floor((workoutDates[i].getTime() - workoutDates[i - 1].getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      // Día consecutivo
      currentStreak++;
    } else {
      // Se rompió la racha
      streaks.push(currentStreak);
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
    }
  }

  // Añadir la última racha
  streaks.push(currentStreak);
  longestStreak = Math.max(longestStreak, currentStreak);

  // Calcular racha actual (días desde último entrenamiento)
  const lastWorkoutDate = workoutDates[workoutDates.length - 1];
  const daysSinceLastWorkout = Math.floor((new Date().getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentActiveStreak = daysSinceLastWorkout === 0 ? currentStreak : 0;

  // Calcular promedio de rachas
  const averageStreak = streaks.length > 0 ? Math.round(streaks.reduce((sum, streak) => sum + streak, 0) / streaks.length) : 0;

  return {
    current: currentActiveStreak,
    longest: longestStreak,
    average: averageStreak
  };
};

/**
 * Analiza hábitos de entrenamiento
 */
export const analyzeWorkoutHabits = (records: WorkoutRecord[]): WorkoutHabits => {
  if (records.length === 0) {
    return {
      preferredDay: 'N/A',
      preferredTime: 'N/A',
      avgSessionDuration: 0,
      consistencyScore: 0,
      peakProductivityHours: [],
      restDayPattern: 'N/A',
      weeklyFrequency: 0,
      habitStrength: 'Muy Débil',
      scheduleFlexibility: 'Muy Rígido',
      motivationPattern: 'Inconsistente',
      bestPerformanceDay: 'N/A',
      bestPerformanceTime: 'N/A',
      workoutStreaks: { current: 0, longest: 0, average: 0 },
      behaviorInsights: [],
      recommendations: [],
      riskFactors: []
    };
  }

  const dayMetrics = calculateDayMetrics(records);

  // Día preferido
  const preferredDay = dayMetrics[0]?.dayName || 'N/A';

  // Hora preferida basada en análisis simple de horarios
  const hourCounts: Record<string, number> = {};
  records.forEach(record => {
    const hour = getHours(new Date(record.date));
    let timeRange: string;
    if (hour >= 6 && hour < 12) timeRange = 'Mañana';
    else if (hour >= 12 && hour < 18) timeRange = 'Tarde';
    else if (hour >= 18 && hour < 22) timeRange = 'Noche';
    else timeRange = 'Madrugada';

    hourCounts[timeRange] = (hourCounts[timeRange] || 0) + 1;
  });

  const preferredTime = Object.entries(hourCounts).reduce((a, b) =>
    hourCounts[a[0]] > hourCounts[b[0]] ? a : b
  )?.[0] || 'N/A';

  // Duración promedio estimada (mejorado)
  const avgVolume = records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0) / records.length;
  const exerciseCount = records.length;
  const avgExercisesPerSession = Math.max(1, Math.round(exerciseCount / Math.max(1, new Set(records.map(r => r.date)).size)));
  const avgSessionDuration = Math.round(Math.max(30, Math.min(180, avgExercisesPerSession * 8 + 15))); // Entre 30-180 minutos

  // Score de consistencia (variabilidad entre días)
  const dayWorkouts = dayMetrics.map(d => d.workouts);
  const maxWorkouts = Math.max(...dayWorkouts);
  const minWorkouts = Math.min(...dayWorkouts.filter(w => w > 0));
  const consistencyScore = maxWorkouts > 0 ? Math.round((minWorkouts / maxWorkouts) * 100) : 0;

  // Horas de mayor productividad (simplificado)
  const sortedHourRanges = Object.entries(hourCounts).sort((a, b) => b[1] - a[1]);
  const topTimePatterns = sortedHourRanges.slice(0, 2).map(([timeRange]) => timeRange);

  // Patrón de descanso
  const workoutDays = dayMetrics.filter(d => d.workouts > 0).length;
  const restDayPattern = workoutDays <= 3 ? '4+ días descanso' :
    workoutDays <= 5 ? '1-2 días descanso' : 'Entrenamiento diario';

  // Nuevas métricas - Calcular frecuencia semanal correctamente
  const uniqueDates = new Set(records.map(r => new Date(r.date).toDateString()));

  // **CORRECCIÓN CLAVE**: Calcular frecuencia semanal de entrenamientos (no días)
  const weeklyData = new Map<string, number>();

  records.forEach(record => {
    const date = new Date(record.date);
    // Obtener el lunes de la semana
    const monday = new Date(date);
    monday.setDate(date.getDate() - date.getDay() + 1);
    const weekKey = monday.toISOString().split('T')[0];

    if (!weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, 0);
    }
    weeklyData.set(weekKey, weeklyData.get(weekKey)! + 1);
  });

  // Calcular promedio de entrenamientos por semana (no días)
  const weeklyFrequency = weeklyData.size > 0
    ? Math.round((Array.from(weeklyData.values()).reduce((sum, workouts) => sum + workouts, 0) / weeklyData.size) * 100) / 100
    : 0;

  // Calcular fuerza del hábito basado en consistencia y frecuencia
  let habitStrength: WorkoutHabits['habitStrength'];
  const combinedScore = (consistencyScore + (weeklyFrequency * 20)) / 2;
  if (combinedScore >= 80) habitStrength = 'Muy Fuerte';
  else if (combinedScore >= 65) habitStrength = 'Fuerte';
  else if (combinedScore >= 45) habitStrength = 'Moderado';
  else if (combinedScore >= 25) habitStrength = 'Débil';
  else habitStrength = 'Muy Débil';

  // Calcular flexibilidad del horario
  let scheduleFlexibility: WorkoutHabits['scheduleFlexibility'];
  const timeVariety = Object.keys(hourCounts).length;
  if (timeVariety >= 4) scheduleFlexibility = 'Muy Flexible';
  else if (timeVariety >= 3) scheduleFlexibility = 'Flexible';
  else if (timeVariety >= 2) scheduleFlexibility = 'Rígido';
  else scheduleFlexibility = 'Muy Rígido';

  // Calcular patrón de motivación (basado en tendencia reciente vs histórica)
  let motivationPattern: WorkoutHabits['motivationPattern'];
  const recentRecords = records.slice(-14); // Últimas 2 semanas
  const olderRecords = records.slice(-28, -14); // 2 semanas anteriores
  const recentFreq = recentRecords.length / 2;
  const olderFreq = olderRecords.length / 2;

  if (Math.abs(recentFreq - olderFreq) < 0.5) motivationPattern = 'Estable';
  else if (recentFreq > olderFreq) motivationPattern = 'Creciente';
  else if (recentFreq < olderFreq) motivationPattern = 'Decreciente';
  else motivationPattern = 'Inconsistente';

  // Mejor día y hora de rendimiento (basado en volumen promedio)
  const bestPerformanceDay = dayMetrics.length > 0 ? dayMetrics.reduce((best, current) =>
    current.avgVolume > best.avgVolume ? current : best
  ).dayName : 'N/A';

  // Mejor hora de rendimiento basado en volumen por rango horario
  let bestPerformanceTime = 'N/A';
  if (Object.keys(hourCounts).length > 0) {
    const hourVolumes: Record<string, { volume: number; count: number }> = {};
    records.forEach(record => {
      const hour = getHours(new Date(record.date));
      let timeRange: string;
      if (hour >= 6 && hour < 12) timeRange = 'Mañana';
      else if (hour >= 12 && hour < 18) timeRange = 'Tarde';
      else if (hour >= 18 && hour < 22) timeRange = 'Noche';
      else timeRange = 'Madrugada';

      const volume = record.weight * record.reps * record.sets;
      if (!hourVolumes[timeRange]) hourVolumes[timeRange] = { volume: 0, count: 0 };
      hourVolumes[timeRange].volume += volume;
      hourVolumes[timeRange].count++;
    });

    bestPerformanceTime = Object.entries(hourVolumes).reduce((best, [timeRange, data]) => {
      const avgVolume = data.volume / data.count;
      const bestAvgVolume = hourVolumes[best].volume / hourVolumes[best].count;
      return avgVolume > bestAvgVolume ? timeRange : best;
    }, Object.keys(hourVolumes)[0]);
  }

  // Calcular rachas de entrenamiento
  const workoutStreaks = calculateWorkoutStreaks(records);

  // Generar insights de comportamiento
  const behaviorInsights: string[] = [];
  if (consistencyScore >= 70) {
    behaviorInsights.push('Tienes hábitos de entrenamiento muy consistentes');
  } else if (consistencyScore >= 50) {
    behaviorInsights.push('Tus hábitos de entrenamiento son moderadamente consistentes');
  } else {
    behaviorInsights.push('Tus hábitos de entrenamiento necesitan más consistencia');
  }

  if (timeVariety >= 3) {
    behaviorInsights.push('Tienes flexibilidad en tus horarios de entrenamiento');
  } else {
    behaviorInsights.push('Prefieres entrenar en horarios específicos');
  }

  if (workoutStreaks.longest >= 7) {
    behaviorInsights.push(`Tu racha más larga fue de ${workoutStreaks.longest} días`);
  }

  // Generar recomendaciones personalizadas
  const recommendations: string[] = [];
  if (consistencyScore < 50) {
    recommendations.push('Establece horarios fijos para crear rutina');
  }
  if (weeklyFrequency < 3) {
    recommendations.push('Intenta aumentar a 3-4 entrenamientos por semana');
  }
  if (scheduleFlexibility === 'Muy Rígido') {
    recommendations.push('Prueba entrenar en diferentes horarios para más flexibilidad');
  }
  if (motivationPattern === 'Decreciente') {
    recommendations.push('Considera variar tu rutina para mantener la motivación');
  }
  if (workoutStreaks.current === 0) {
    recommendations.push('Enfócate en crear una nueva racha de entrenamientos');
  }

  // Identificar factores de riesgo
  const riskFactors: string[] = [];
  if (consistencyScore < 30) {
    riskFactors.push('Baja consistencia puede llevar a pérdida de progreso');
  }
  if (weeklyFrequency < 2) {
    riskFactors.push('Frecuencia muy baja puede no generar adaptaciones');
  }
  if (motivationPattern === 'Decreciente') {
    riskFactors.push('Patrón decreciente sugiere riesgo de abandono');
  }
  if (workoutStreaks.current === 0 && workoutStreaks.longest > 7) {
    riskFactors.push('Has perdido rachas largas anteriores');
  }

  return {
    preferredDay,
    preferredTime: preferredTime.split(' (')[0], // Solo la parte del nombre
    avgSessionDuration,
    consistencyScore,
    peakProductivityHours: topTimePatterns,
    restDayPattern,
    weeklyFrequency,
    habitStrength,
    scheduleFlexibility,
    motivationPattern,
    bestPerformanceDay,
    bestPerformanceTime,
    workoutStreaks,
    behaviorInsights,
    recommendations,
    riskFactors
  };
};

/**
 * Calcula tendencia de volumen por día de la semana
 * CORREGIDO: Comparación justa de volumen promedio por sesión del mismo día
 */
export const calculateVolumeTrendByDay = (records: WorkoutRecord[]): { day: string; trend: number }[] => {
  if (records.length === 0) return [];

  // Asegurar que los registros estén ordenados cronológicamente
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const trends: { day: string; trend: number }[] = [];

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    // Obtener todos los entrenamientos de este día específico
    const dayRecords = sortedRecords.filter(r => getDay(new Date(r.date)) === dayIndex);

    let trend = 0;

    if (dayRecords.length >= 3) {
      // Calcular tendencias con 3+ entrenamientos usando lógica realista
      const sortedDayRecords = dayRecords.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (dayRecords.length >= 4) {
        // CORRECCIÓN CLAVE: Verificar si hay distribución temporal real
        const uniqueDates = new Set(sortedDayRecords.map(r => r.date.toDateString()));

        if (uniqueDates.size <= 2) {
          // Si todos los entrenamientos están en 1-2 días, no calcular tendencia temporal
          trend = 10; // Tendencia positiva leve por actividad consistente
        } else {
          // Solo si hay distribución temporal real, calcular tendencia
          const halfPoint = Math.floor(sortedDayRecords.length / 2);
          const olderOccurrences = sortedDayRecords.slice(0, halfPoint);
          const recentOccurrences = sortedDayRecords.slice(halfPoint);

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
        const uniqueDates = new Set(sortedDayRecords.map(r => r.date.toDateString()));

        if (uniqueDates.size <= 1) {
          // Si todos los entrenamientos están en el mismo día
          trend = 8; // Tendencia positiva leve por actividad
        } else {
          // Si hay distribución temporal, comparar primer vs último
          const firstVolume = calculateRealVolume(sortedDayRecords[0]);
          const lastVolume = calculateRealVolume(sortedDayRecords[2]);

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
    } else if (dayRecords.length === 2) {
      // Para 2 entrenamientos: verificar si están en días diferentes
      const sortedDayRecords = dayRecords.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const uniqueDates = new Set(sortedDayRecords.map(r => r.date.toDateString()));

      if (uniqueDates.size <= 1) {
        // Si ambos entrenamientos están en el mismo día
        trend = 6; // Tendencia positiva leve por actividad
      } else {
        // Si están en días diferentes, comparar con mucha cautela
        const firstVolume = calculateRealVolume(sortedDayRecords[0]);
        const lastVolume = calculateRealVolume(sortedDayRecords[1]);

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
    } else if (dayRecords.length === 1) {
      // Primera vez entrenando en este día = tendencia positiva leve
      trend = 20; // Positivo moderado para nuevo día
    }

    trends.push({
      day: dayNames[dayIndex],
      trend
    });
  }

  return trends;
};

/**
 * Encuentra el mejor período de rendimiento
 */
export const findBestPerformancePeriod = (records: WorkoutRecord[]): string => {
  if (records.length === 0) return 'N/A';

  const trends = calculateTemporalTrends(records, 8);
  if (trends.length === 0) return 'N/A';

  const bestWeek = trends.reduce((best, current) =>
    current.volume > best.volume ? current : best
  );

  return `Semana del ${bestWeek.period}`;
};

/**
 * Calcula análisis temporal completo con evolución avanzada
 */
export const calculateTemporalEvolution = (records: WorkoutRecord[]): TemporalEvolution => {
  const trends = calculateTemporalTrends(records);

  if (trends.length === 0) {
    return {
      trends: [],
      overallTrend: 'Estable',
      growthRate: 0,
      volatility: 0,
      predictions: {
        nextWeekVolume: 0,
        nextWeekWorkouts: 0,
        confidence: 0,
        trend: 'Lateral'
      },
      cycles: {
        hasWeeklyCycle: false,
        peakDay: 'N/A',
        lowDay: 'N/A',
        cyclePeriod: 0
      },
      milestones: {
        bestWeek: null,
        worstWeek: null,
        mostConsistentWeek: null,
        biggestImprovement: null
      },
      periodComparisons: {
        last4Weeks: { volume: 0, workouts: 0, avgWeight: 0 },
        previous4Weeks: { volume: 0, workouts: 0, avgWeight: 0 },
        improvement: { volume: 0, workouts: 0, avgWeight: 0 }
      },
      insights: [],
      warnings: []
    };
  }

  // **CORRECCIÓN CLAVE**: Calcular tendencia usando volumen promedio por sesión
  const firstWeek = trends[0];
  const lastWeek = trends[trends.length - 1];

  // Calcular volumen promedio por sesión para comparación justa
  const firstWeekAvgVolume = firstWeek.workouts > 0 ? firstWeek.volume / firstWeek.workouts : 0;
  const lastWeekAvgVolume = lastWeek.workouts > 0 ? lastWeek.volume / lastWeek.workouts : 0;

  const avgVolumeGrowth = lastWeekAvgVolume - firstWeekAvgVolume;
  const overallTrend = avgVolumeGrowth > 0 ? 'Mejorando' : avgVolumeGrowth < 0 ? 'Declinando' : 'Estable';

  // Calcular tasa de crecimiento promedio por sesión (no dividir por trends.length)
  const growthRate = firstWeekAvgVolume > 0 ? ((avgVolumeGrowth / firstWeekAvgVolume) * 100) : 0;

  // Calcular volatilidad (desviación estándar de cambios porcentuales)
  const changes = trends.slice(1).map(t => t.volumeChangePercent);
  const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
  const volatility = Math.sqrt(changes.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / changes.length) / 100;

  // Predicciones simples basadas en tendencia
  const recentTrends = trends.slice(-3);
  const avgRecentVolume = recentTrends.reduce((sum, t) => sum + t.volume, 0) / recentTrends.length;
  const avgRecentWorkouts = recentTrends.reduce((sum, t) => sum + t.workouts, 0) / recentTrends.length;
  const recentGrowth = recentTrends.length > 1 ?
    recentTrends[recentTrends.length - 1].volume - recentTrends[0].volume : 0;

  const predictions = {
    nextWeekVolume: Math.round(avgRecentVolume + (recentGrowth / 2)),
    nextWeekWorkouts: Math.round(avgRecentWorkouts),
    confidence: Math.max(0.3, Math.min(0.9, 0.7 - volatility)),
    trend: recentGrowth > 0 ? 'Alcista' as const : recentGrowth < 0 ? 'Bajista' as const : 'Lateral' as const
  };

  // Análisis de ciclos (usando análisis de días existente)
  const dayMetrics = calculateDayMetrics(records);
  const sortedDays = [...dayMetrics].sort((a, b) => b.totalVolume - a.totalVolume);
  const cycles = {
    hasWeeklyCycle: dayMetrics.some(d => d.workouts > 0),
    peakDay: sortedDays[0]?.dayName || 'N/A',
    lowDay: sortedDays[sortedDays.length - 1]?.dayName || 'N/A',
    cyclePeriod: 7 // Ciclo semanal
  };

  // Encontrar hitos
  const bestWeek = trends.reduce((best, current) =>
    current.performanceScore > best.performanceScore ? current : best
  );
  const worstWeek = trends.reduce((worst, current) =>
    current.performanceScore < worst.performanceScore ? current : worst
  );
  const mostConsistentWeek = trends.reduce((most, current) =>
    current.consistency > most.consistency ? current : most
  );
  const biggestImprovement = trends.reduce((biggest, current) =>
    current.volumeChangePercent > biggest.volumeChangePercent ? current : biggest
  );

  // Comparaciones por períodos
  const last4Weeks = trends.slice(-4);
  const previous4Weeks = trends.slice(-8, -4);

  // **CORRECCIÓN CLAVE**: Calcular volumen promedio por sesión para comparación justa
  const last4WeeksStats = {
    volume: last4Weeks.length > 0 ? Math.round(
      last4Weeks.reduce((sum, t) => sum + (t.workouts > 0 ? t.volume / t.workouts : 0), 0) / last4Weeks.length
    ) : 0,
    workouts: Math.round(last4Weeks.reduce((sum, t) => sum + t.workouts, 0) / last4Weeks.length),
    avgWeight: Math.round(last4Weeks.reduce((sum, t) => sum + t.avgWeight, 0) / last4Weeks.length * 100) / 100
  };

  const previous4WeeksStats = {
    volume: previous4Weeks.length > 0 ? Math.round(
      previous4Weeks.reduce((sum, t) => sum + (t.workouts > 0 ? t.volume / t.workouts : 0), 0) / previous4Weeks.length
    ) : 0,
    workouts: previous4Weeks.length > 0 ? Math.round(previous4Weeks.reduce((sum, t) => sum + t.workouts, 0) / previous4Weeks.length) : 0,
    avgWeight: previous4Weeks.length > 0 ? Math.round(previous4Weeks.reduce((sum, t) => sum + t.avgWeight, 0) / previous4Weeks.length * 100) / 100 : 0
  };

  const improvement = {
    volume: last4WeeksStats.volume - previous4WeeksStats.volume,
    workouts: last4WeeksStats.workouts - previous4WeeksStats.workouts,
    avgWeight: Math.round((last4WeeksStats.avgWeight - previous4WeeksStats.avgWeight) * 100) / 100
  };

  // Generar insights
  const insights: string[] = [];
  if (overallTrend === 'Mejorando') {
    insights.push(`Tu volumen ha crecido un ${Math.round(growthRate * 100)}% por semana`);
  }
  if (bestWeek.performanceScore > 80) {
    insights.push(`Tu mejor semana fue la del ${bestWeek.period} con ${bestWeek.volume}kg`);
  }
  if (improvement.volume > 0) {
    insights.push(`Has mejorado ${improvement.volume}kg en promedio vs las 4 semanas anteriores`);
  }
  if (volatility < 0.2) {
    insights.push('Tu entrenamiento muestra consistencia muy estable');
  }
  if (predictions.trend === 'Alcista') {
    insights.push('Las predicciones indican un crecimiento continuo');
  }

  // Generar advertencias
  const warnings: string[] = [];
  if (volatility > 0.5) {
    warnings.push('Tu rendimiento muestra alta volatilidad');
  }
  if (overallTrend === 'Declinando') {
    warnings.push('Tu volumen de entrenamiento está declinando');
  }
  if (improvement.volume < -500) {
    warnings.push('Has tenido una caída significativa vs el período anterior');
  }
  if (predictions.confidence < 0.5) {
    warnings.push('Las predicciones tienen baja confianza debido a inconsistencias');
  }

  return {
    trends,
    overallTrend,
    growthRate: Math.round(growthRate * 100) / 100,
    volatility: Math.round(volatility * 100) / 100,
    predictions,
    cycles,
    milestones: {
      bestWeek,
      worstWeek,
      mostConsistentWeek,
      biggestImprovement
    },
    periodComparisons: {
      last4Weeks: last4WeeksStats,
      previous4Weeks: previous4WeeksStats,
      improvement
    },
    insights,
    warnings
  };
};

/**
 * Calcula análisis completo de tendencias
 */
export const calculateTrendsAnalysis = (records: WorkoutRecord[]): TrendsAnalysis => {
  return {
    dayMetrics: calculateDayMetrics(records),
    dayMetricsOrdered: getDayMetricsOrderedByWeek(records),
    temporalTrends: calculateTemporalTrends(records),
    temporalEvolution: calculateTemporalEvolution(records),
    workoutHabits: analyzeWorkoutHabits(records),
    volumeTrendByDay: calculateVolumeTrendByDay(records),
    bestPerformancePeriod: findBestPerformancePeriod(records)
  };
};

/**
 * Obtiene métricas ordenadas por día de la semana (Lunes a Domingo)
 */
export const getDayMetricsOrderedByWeek = (records: WorkoutRecord[]): DayMetrics[] => {
  const allMetrics = calculateDayMetrics(records);

  // Crear un mapa por índice de día
  const metricsMap: Record<number, DayMetrics> = {};
  allMetrics.forEach(metric => {
    metricsMap[metric.dayIndex] = metric;
  });

  // Ordenar Lunes (1) a Domingo (0), con Domingo al final
  const weekOrder = [1, 2, 3, 4, 5, 6, 0]; // Lunes a Domingo
  const orderedMetrics: DayMetrics[] = [];

  weekOrder.forEach(dayIndex => {
    if (metricsMap[dayIndex]) {
      orderedMetrics.push(metricsMap[dayIndex]);
    } else {
      // Crear entrada vacía para días sin datos
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      orderedMetrics.push({
        dayName: dayNames[dayIndex],
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
        recommendations: ['Considera añadir entrenamientos en este día']
      });
    }
  });

  return orderedMetrics;
}; 