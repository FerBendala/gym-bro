import { endOfWeek, format, getDay, getHours, startOfWeek, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import type { WorkoutRecord } from '../../interfaces';

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
 * Interfaz para análisis de tendencias completo
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

  // Calcular tendencias comparando con semanas anteriores
  // Ajustar según la cantidad de datos disponibles para evitar comparaciones erróneas
  const totalRecords = sortedRecords.length;

  let recentRecords: WorkoutRecord[];
  let olderRecords: WorkoutRecord[];

  if (totalRecords < 20) {
    // Con pocos datos, comparar segunda mitad vs primera mitad
    const midpoint = Math.floor(totalRecords / 2);
    if (midpoint >= 2) {
      recentRecords = sortedRecords.slice(midpoint);
      olderRecords = sortedRecords.slice(0, midpoint);
    } else {
      // Si hay muy pocos datos, no hacer comparaciones
      recentRecords = sortedRecords;
      olderRecords = [];
    }
  } else if (totalRecords < 40) {
    // Con datos moderados, comparar primera mitad vs segunda mitad
    const midpoint = Math.floor(totalRecords / 2);
    recentRecords = sortedRecords.slice(midpoint);
    olderRecords = sortedRecords.slice(0, midpoint);
  } else {
    // Con suficientes datos, usar lógica original de 4 semanas
    recentRecords = sortedRecords.slice(-28); // Últimas 4 semanas
    olderRecords = sortedRecords.slice(-56, -28); // 4 semanas anteriores
  }

  const dayMetrics: DayMetrics[] = [];

  for (let i = 0; i < 7; i++) {
    const stats = dayStats[i];
    const workoutCount = stats.workouts.length;
    const dayTotalVolume = stats.volumes.reduce((sum, vol) => sum + vol, 0);
    const avgVolume = workoutCount > 0 ? dayTotalVolume / workoutCount : 0;

    // Calcular hora más frecuente
    let mostFrequentTime: string | null = null;
    if (stats.times.length > 0) {
      const timeFreq: Record<number, number> = {};
      stats.times.forEach(hour => {
        timeFreq[hour] = (timeFreq[hour] || 0) + 1;
      });
      const mostFreqHour = Object.entries(timeFreq).reduce((a, b) =>
        timeFreq[parseInt(a[0])] > timeFreq[parseInt(b[0])] ? a : b
      )[0];

      const hourNum = parseInt(mostFreqHour);
      if (hourNum >= 6 && hourNum < 12) mostFrequentTime = 'Mañana';
      else if (hourNum >= 12 && hourNum < 18) mostFrequentTime = 'Tarde';
      else if (hourNum >= 18 && hourNum < 22) mostFrequentTime = 'Noche';
      else mostFrequentTime = 'Madrugada';
    }

    // Nuevas métricas
    const maxWeight = stats.weights.length > 0 ? Math.max(...stats.weights) : 0;
    const avgWeight = stats.weights.length > 0 ?
      Math.round((stats.weights.reduce((sum, w) => sum + w, 0) / stats.weights.length) * 100) / 100 : 0;

    const uniqueExercises = new Set(stats.exercises).size;

    const totalReps = stats.workouts.reduce((sum, w) => sum + w.reps, 0);
    const totalSets = stats.workouts.reduce((sum, w) => sum + w.sets, 0);
    const avgReps = workoutCount > 0 ? Math.round((totalReps / stats.workouts.length) * 100) / 100 : 0;
    const avgSets = workoutCount > 0 ? Math.round((totalSets / stats.workouts.length) * 100) / 100 : 0;

    // Consistencia: frecuencia de entrenamientos en este día
    const weeksWithData = Math.max(1, Math.ceil(sortedRecords.length / 35)); // Estimación de semanas
    const consistency = Math.round((workoutCount / weeksWithData) * 100);

    // Tendencia: comparar volumen reciente vs anterior
    const recentDayVolume = recentRecords
      .filter(r => getDay(new Date(r.date)) === i)
      .reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
    const olderDayVolume = olderRecords
      .filter(r => getDay(new Date(r.date)) === i)
      .reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

    let trend = 0;

    // Calcular tendencia con diferentes estrategias según la situación
    if (olderRecords.length === 0) {
      // Sin datos anteriores, no mostrar tendencia
      trend = 0;
    } else if (olderDayVolume > 0 && recentDayVolume > 0) {
      // Ambos períodos tienen volumen, usar cálculo porcentual normal
      const rawTrend = Math.round(((recentDayVolume - olderDayVolume) / olderDayVolume) * 100);
      // Usar threshold más bajo para ser menos conservador
      if (Math.abs(rawTrend) >= 5) {
        trend = rawTrend;
      }
    } else if (olderDayVolume === 0 && recentDayVolume > 0) {
      // Comenzó a entrenar en este día - tendencia muy positiva
      trend = 100; // Máximo positivo
    } else if (olderDayVolume > 0 && recentDayVolume === 0) {
      // Dejó de entrenar en este día - tendencia muy negativa
      trend = -100; // Máximo negativo
    } else {
      // Sin entrenamientos en ningún período para este día
      trend = 0;
    }

    // Para datos muy limitados, ser aún más conservador
    if (totalRecords < 10) {
      trend = 0; // No mostrar tendencias con muy pocos datos
    }



    // Performance score (0-100) basado en volumen, consistencia y variedad
    const volumeScore = totalVolume > 0 ? Math.min(100, (dayTotalVolume / totalVolume) * 700) : 0; // Normalize to week
    const consistencyScore = Math.min(100, consistency * 2);
    const varietyScore = Math.min(100, uniqueExercises * 20);
    const performanceScore = Math.round((volumeScore + consistencyScore + varietyScore) / 3);

    // Ejercicio más frecuente
    let topExercise = 'N/A';
    if (stats.exercises.length > 0) {
      const exerciseFreq: Record<string, number> = {};
      stats.exercises.forEach(ex => {
        exerciseFreq[ex] = (exerciseFreq[ex] || 0) + 1;
      });
      topExercise = Object.entries(exerciseFreq).reduce((a, b) =>
        exerciseFreq[a[0]] > exerciseFreq[b[0]] ? a : b
      )[0];
    }

    // Eficiencia: volumen promedio por entrenamiento
    const efficiency = Math.round(avgVolume);

    // Intensidad: 1RM estimado promedio relativo al máximo del usuario (más preciso)
    const oneRMs = sortedRecords.map(r => r.weight * (1 + Math.min(r.reps, 20) / 30));
    const userMaxOneRM = Math.max(...oneRMs);
    const avgOneRM = oneRMs.reduce((sum, orm) => sum + orm, 0) / oneRMs.length;
    const intensity = userMaxOneRM > 0 ? Math.round((avgOneRM / userMaxOneRM) * 100) : 0;

    // Recomendaciones específicas para el día
    const recommendations: string[] = [];
    if (workoutCount === 0) {
      recommendations.push('Considera añadir entrenamientos en este día');
    } else {
      if (performanceScore < 50) {
        recommendations.push('Aumenta el volumen o la variedad de ejercicios');
      }
      if (consistency < 50) {
        recommendations.push('Trata de ser más regular en este día');
      }
      if (uniqueExercises < 2) {
        recommendations.push('Añade más variedad de ejercicios');
      }
      // Solo mostrar mensaje de declive si hay suficientes datos y es una tendencia significativa
      if (trend <= -20 && totalRecords >= 15) {
        recommendations.push('Tu rendimiento ha disminuido recientemente');
      }
      // Mostrar mensaje positivo para mejoras significativas
      if (trend >= 20 && totalRecords >= 10) {
        recommendations.push('¡Excelente progreso en este día!');
      }
      if (efficiency < avgVolume * 0.7) {
        recommendations.push('Optimiza la intensidad de tus entrenamientos');
      }
    }

    dayMetrics.push({
      dayName: dayNames[i],
      dayIndex: i,
      workouts: workoutCount,
      avgVolume: Math.round(avgVolume),
      totalVolume: Math.round(dayTotalVolume),
      percentage: totalWorkouts > 0 ? Math.round((workoutCount / totalWorkouts) * 100) : 0,
      mostFrequentTime,
      maxWeight: Math.round(maxWeight * 100) / 100,
      avgWeight,
      uniqueExercises,
      avgReps,
      avgSets,
      totalSets,
      consistency: Math.min(100, consistency),
      trend,
      performanceScore: Math.max(0, Math.min(100, performanceScore)),
      topExercise,
      efficiency,
      intensity,
      recommendations
    });
  }

  return dayMetrics.sort((a, b) => b.workouts - a.workouts);
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

  // Calcular cambios y momentum
  for (let i = 1; i < trends.length; i++) {
    const current = trends[i];
    const previous = trends[i - 1];

    current.volumeChange = current.volume - previous.volume;
    current.volumeChangePercent = previous.volume > 0 ?
      Math.round(((current.volume - previous.volume) / previous.volume) * 100) : 0;
    current.workoutChange = current.workouts - previous.workouts;

    // Calcular momentum basado en las últimas 3 semanas
    if (i >= 2) {
      const trend1 = trends[i - 2];
      const trend2 = trends[i - 1];
      const trend3 = trends[i];

      const change1 = trend2.volume - trend1.volume;
      const change2 = trend3.volume - trend2.volume;

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

  // Agrupar por semanas para calcular frecuencia semanal real
  const weeklyData = new Map<string, Set<string>>();

  records.forEach(record => {
    const date = new Date(record.date);
    // Obtener el lunes de la semana
    const monday = new Date(date);
    monday.setDate(date.getDate() - date.getDay() + 1);
    const weekKey = monday.toISOString().split('T')[0];

    if (!weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, new Set());
    }
    weeklyData.get(weekKey)!.add(record.date.toDateString());
  });

  // Calcular promedio de días por semana solo para semanas con entrenamientos
  const weeklyFrequency = weeklyData.size > 0
    ? Math.round((Array.from(weeklyData.values()).reduce((sum, daysSet) => sum + daysSet.size, 0) / weeklyData.size) * 100) / 100
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
 */
export const calculateVolumeTrendByDay = (records: WorkoutRecord[]): { day: string; trend: number }[] => {
  if (records.length === 0) return [];

  // Asegurar que los registros estén ordenados cronológicamente
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Usar la misma lógica adaptativa que en calculateDayMetrics
  const totalRecords = sortedRecords.length;
  let recentRecords: WorkoutRecord[];
  let olderRecords: WorkoutRecord[];

  if (totalRecords < 20) {
    // Con pocos datos, comparar segunda mitad vs primera mitad
    const midpoint = Math.floor(totalRecords / 2);
    if (midpoint >= 2) {
      recentRecords = sortedRecords.slice(midpoint);
      olderRecords = sortedRecords.slice(0, midpoint);
    } else {
      // Si hay muy pocos datos, no hacer comparaciones
      recentRecords = sortedRecords;
      olderRecords = [];
    }
  } else if (totalRecords < 40) {
    // Con datos moderados, comparar primera mitad vs segunda mitad
    const midpoint = Math.floor(totalRecords / 2);
    recentRecords = sortedRecords.slice(midpoint);
    olderRecords = sortedRecords.slice(0, midpoint);
  } else {
    // Con suficientes datos, usar lógica original de 4 semanas
    recentRecords = sortedRecords.slice(-28); // Últimas 4 semanas
    olderRecords = sortedRecords.slice(-56, -28); // 4 semanas anteriores
  }

  const trends: { day: string; trend: number }[] = [];

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const recentVolume = recentRecords
      .filter(r => getDay(new Date(r.date)) === dayIndex)
      .reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

    const olderVolume = olderRecords
      .filter(r => getDay(new Date(r.date)) === dayIndex)
      .reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

    let trend = 0;

    // Usar la misma lógica de tendencias que en calculateDayMetrics
    if (olderRecords.length === 0) {
      // Sin datos anteriores, no mostrar tendencia
      trend = 0;
    } else if (olderVolume > 0 && recentVolume > 0) {
      // Ambos períodos tienen volumen, usar cálculo porcentual normal
      const rawTrend = ((recentVolume - olderVolume) / olderVolume) * 100;
      // Usar threshold más bajo para ser menos conservador
      if (Math.abs(rawTrend) >= 5) {
        trend = rawTrend;
      }
    } else if (olderVolume === 0 && recentVolume > 0) {
      // Comenzó a entrenar en este día - tendencia muy positiva
      trend = 100; // Máximo positivo
    } else if (olderVolume > 0 && recentVolume === 0) {
      // Dejó de entrenar en este día - tendencia muy negativa
      trend = -100; // Máximo negativo
    } else {
      // Sin entrenamientos en ningún período para este día
      trend = 0;
    }

    // Para datos muy limitados, ser aún más conservador
    if (totalRecords < 10) {
      trend = 0; // No mostrar tendencias con muy pocos datos
    }

    trends.push({
      day: dayNames[dayIndex],
      trend: Math.round(trend)
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

  // Calcular tendencia general
  const firstWeek = trends[0];
  const lastWeek = trends[trends.length - 1];
  const totalGrowth = lastWeek.volume - firstWeek.volume;
  const overallTrend = totalGrowth > 0 ? 'Mejorando' : totalGrowth < 0 ? 'Declinando' : 'Estable';

  // Calcular tasa de crecimiento promedio
  const growthRate = firstWeek.volume > 0 ? (totalGrowth / firstWeek.volume) / trends.length : 0;

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

  const last4WeeksStats = {
    volume: Math.round(last4Weeks.reduce((sum, t) => sum + t.volume, 0) / last4Weeks.length),
    workouts: Math.round(last4Weeks.reduce((sum, t) => sum + t.workouts, 0) / last4Weeks.length),
    avgWeight: Math.round(last4Weeks.reduce((sum, t) => sum + t.avgWeight, 0) / last4Weeks.length * 100) / 100
  };

  const previous4WeeksStats = {
    volume: previous4Weeks.length > 0 ? Math.round(previous4Weeks.reduce((sum, t) => sum + t.volume, 0) / previous4Weeks.length) : 0,
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
    growthRate: Math.round(growthRate * 10000) / 100,
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