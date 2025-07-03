import { endOfWeek, format, getDay, getHours, startOfWeek, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import type { WorkoutRecord } from '../../interfaces';

/**
 * Interfaz para métricas por día de la semana
 */
export interface DayMetrics {
  dayName: string;
  dayIndex: number;
  workouts: number;
  avgVolume: number;
  totalVolume: number;
  percentage: number;
  mostFrequentTime: string | null;
}

/**
 * Interfaz para patrones horarios
 */
export interface TimePattern {
  hour: number;
  timeRange: string;
  workouts: number;
  percentage: number;
  avgVolume: number;
}

/**
 * Interfaz para tendencias temporales
 */
export interface TemporalTrend {
  period: string;
  workouts: number;
  volume: number;
  avgWeight: number;
  weekNumber: number;
}

/**
 * Interfaz para hábitos de entrenamiento
 */
export interface WorkoutHabits {
  preferredDay: string;
  preferredTime: string;
  avgSessionDuration: number; // Estimado
  consistencyScore: number; // 0-100
  peakProductivityHours: string[];
  restDayPattern: string;
}

/**
 * Interfaz para análisis de tendencias completo
 */
export interface TrendsAnalysis {
  dayMetrics: DayMetrics[];
  timePatterns: TimePattern[];
  temporalTrends: TemporalTrend[];
  workoutHabits: WorkoutHabits;
  volumeTrendByDay: { day: string; trend: number }[];
  bestPerformancePeriod: string;
}

/**
 * Calcula métricas por día de la semana
 */
export const calculateDayMetrics = (records: WorkoutRecord[]): DayMetrics[] => {
  if (records.length === 0) return [];

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dayStats: Record<number, { workouts: WorkoutRecord[]; volumes: number[]; times: number[] }> = {};

  // Inicializar estadísticas por día
  for (let i = 0; i < 7; i++) {
    dayStats[i] = { workouts: [], volumes: [], times: [] };
  }

  // Agrupar por día de la semana
  records.forEach(record => {
    const dayIndex = getDay(new Date(record.date));
    const volume = record.weight * record.reps * record.sets;
    const hour = getHours(new Date(record.date));

    dayStats[dayIndex].workouts.push(record);
    dayStats[dayIndex].volumes.push(volume);
    dayStats[dayIndex].times.push(hour);
  });

  const totalWorkouts = records.length;
  const dayMetrics: DayMetrics[] = [];

  for (let i = 0; i < 7; i++) {
    const stats = dayStats[i];
    const workoutCount = stats.workouts.length;
    const totalVolume = stats.volumes.reduce((sum, vol) => sum + vol, 0);
    const avgVolume = workoutCount > 0 ? totalVolume / workoutCount : 0;

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

    dayMetrics.push({
      dayName: dayNames[i],
      dayIndex: i,
      workouts: workoutCount,
      avgVolume: Math.round(avgVolume),
      totalVolume: Math.round(totalVolume),
      percentage: totalWorkouts > 0 ? Math.round((workoutCount / totalWorkouts) * 100) : 0,
      mostFrequentTime
    });
  }

  return dayMetrics.sort((a, b) => b.workouts - a.workouts);
};

/**
 * Analiza patrones horarios de entrenamiento
 */
export const analyzeTimePatterns = (records: WorkoutRecord[]): TimePattern[] => {
  if (records.length === 0) return [];

  const timeRanges = [
    { start: 6, end: 9, label: 'Mañana temprano (6-9h)' },
    { start: 9, end: 12, label: 'Media mañana (9-12h)' },
    { start: 12, end: 15, label: 'Mediodía (12-15h)' },
    { start: 15, end: 18, label: 'Tarde (15-18h)' },
    { start: 18, end: 21, label: 'Noche (18-21h)' },
    { start: 21, end: 24, label: 'Noche tardía (21-24h)' }
  ];

  const timeStats: Record<string, { workouts: number; volumes: number[] }> = {};

  // Inicializar estadísticas
  timeRanges.forEach(range => {
    timeStats[range.label] = { workouts: 0, volumes: [] };
  });

  // Clasificar entrenamientos por rango horario
  records.forEach(record => {
    const hour = getHours(new Date(record.date));
    const volume = record.weight * record.reps * record.sets;

    const range = timeRanges.find(r => hour >= r.start && hour < r.end);
    if (range) {
      timeStats[range.label].workouts++;
      timeStats[range.label].volumes.push(volume);
    }
  });

  const totalWorkouts = records.length;
  const patterns: TimePattern[] = [];

  Object.entries(timeStats).forEach(([timeRange, stats]) => {
    const avgVolume = stats.volumes.length > 0
      ? stats.volumes.reduce((sum, vol) => sum + vol, 0) / stats.volumes.length
      : 0;

    // Extraer la hora de inicio del rango
    const hourMatch = timeRange.match(/\((\d+)-/);
    const hour = hourMatch ? parseInt(hourMatch[1]) : 0;

    patterns.push({
      hour,
      timeRange,
      workouts: stats.workouts,
      percentage: totalWorkouts > 0 ? Math.round((stats.workouts / totalWorkouts) * 100) : 0,
      avgVolume: Math.round(avgVolume)
    });
  });

  return patterns.filter(p => p.workouts > 0).sort((a, b) => b.workouts - a.workouts);
};

/**
 * Calcula tendencias temporales por semana
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

      trends.push({
        period: format(weekStart, 'dd/MM', { locale: es }),
        workouts: weekRecords.length,
        volume: Math.round(totalVolume),
        avgWeight: Math.round(avgWeight * 100) / 100,
        weekNumber: weeksCount - i
      });
    }
  }

  return trends.reverse().slice(-8); // Últimas 8 semanas con datos
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
      restDayPattern: 'N/A'
    };
  }

  const dayMetrics = calculateDayMetrics(records);
  const timePatterns = analyzeTimePatterns(records);

  // Día preferido
  const preferredDay = dayMetrics[0]?.dayName || 'N/A';

  // Hora preferida
  const preferredTime = timePatterns[0]?.timeRange || 'N/A';

  // Duración promedio estimada (basada en volumen)
  const avgVolume = records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0) / records.length;
  const avgSessionDuration = Math.round((avgVolume / 100) * 60); // Estimación muy básica

  // Score de consistencia (variabilidad entre días)
  const dayWorkouts = dayMetrics.map(d => d.workouts);
  const maxWorkouts = Math.max(...dayWorkouts);
  const minWorkouts = Math.min(...dayWorkouts.filter(w => w > 0));
  const consistencyScore = maxWorkouts > 0 ? Math.round((minWorkouts / maxWorkouts) * 100) : 0;

  // Horas de mayor productividad
  const topTimePatterns = timePatterns.slice(0, 2).map(p => p.timeRange.split(' (')[0]);

  // Patrón de descanso
  const workoutDays = dayMetrics.filter(d => d.workouts > 0).length;
  const restDayPattern = workoutDays <= 3 ? '4+ días descanso' :
    workoutDays <= 5 ? '1-2 días descanso' : 'Entrenamiento diario';

  return {
    preferredDay,
    preferredTime: preferredTime.split(' (')[0], // Solo la parte del nombre
    avgSessionDuration,
    consistencyScore,
    peakProductivityHours: topTimePatterns,
    restDayPattern
  };
};

/**
 * Calcula tendencia de volumen por día de la semana
 */
export const calculateVolumeTrendByDay = (records: WorkoutRecord[]): { day: string; trend: number }[] => {
  if (records.length === 0) return [];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const recentRecords = records.slice(-28); // Últimas 4 semanas
  const olderRecords = records.slice(-56, -28); // 4 semanas anteriores

  const trends: { day: string; trend: number }[] = [];

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const recentVolume = recentRecords
      .filter(r => getDay(new Date(r.date)) === dayIndex)
      .reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

    const olderVolume = olderRecords
      .filter(r => getDay(new Date(r.date)) === dayIndex)
      .reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

    const trend = olderVolume > 0 ? ((recentVolume - olderVolume) / olderVolume) * 100 : 0;

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
 * Calcula análisis completo de tendencias
 */
export const calculateTrendsAnalysis = (records: WorkoutRecord[]): TrendsAnalysis => {
  return {
    dayMetrics: calculateDayMetrics(records),
    timePatterns: analyzeTimePatterns(records),
    temporalTrends: calculateTemporalTrends(records),
    workoutHabits: analyzeWorkoutHabits(records),
    volumeTrendByDay: calculateVolumeTrendByDay(records),
    bestPerformancePeriod: findBestPerformancePeriod(records)
  };
}; 