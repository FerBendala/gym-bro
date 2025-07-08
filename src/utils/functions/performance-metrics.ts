import { endOfWeek, format, startOfWeek, subDays, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import type { WorkoutRecord } from '../../interfaces';

/**
 * Interfaz para records personales
 */
export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: Date;
  volume: number;
}

/**
 * Interfaz para progresión semanal
 */
export interface WeeklyProgress {
  week: string;
  volume: number;
  workouts: number;
  avgWeight: number; // Ahora representa 1RM estimado promedio
  maxWeight: number; // Ahora representa 1RM estimado máximo
}

/**
 * Interfaz para análisis de consistencia
 */
export interface ConsistencyAnalysis {
  currentStreak: number;
  longestStreak: number;
  workoutsThisWeek: number;
  workoutsLastWeek: number;
  avgWorkoutsPerWeek: number;
  missedDays: number;
}

/**
 * Interfaz para métricas de rendimiento
 */
export interface PerformanceMetrics {
  personalRecords: PersonalRecord[];
  weeklyProgress: WeeklyProgress[];
  consistency: ConsistencyAnalysis;
  totalVolumeTrend: number; // Porcentaje de cambio vs período anterior
  strengthGains: number; // Porcentaje de incremento peso promedio
}

/**
 * Calcula records personales por ejercicio
 */
export const calculatePersonalRecords = (records: WorkoutRecord[]): PersonalRecord[] => {
  if (records.length === 0) return [];

  const recordsByExercise = records.reduce((acc, record) => {
    const key = record.exerciseId;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(record);
    return acc;
  }, {} as Record<string, WorkoutRecord[]>);

  const personalRecords: PersonalRecord[] = [];

  Object.entries(recordsByExercise).forEach(([exerciseId, exerciseRecords]) => {
    // Record de peso máximo
    const maxWeightRecord = exerciseRecords.reduce((max, current) =>
      current.weight > max.weight ? current : max
    );

    // Record de volumen máximo (peso × reps × sets)
    const maxVolumeRecord = exerciseRecords.reduce((max, current) => {
      const currentVolume = current.weight * current.reps * current.sets;
      const maxVolume = max.weight * max.reps * max.sets;
      return currentVolume > maxVolume ? current : max;
    });

    // Agregar record de peso
    personalRecords.push({
      exerciseId,
      exerciseName: maxWeightRecord.exercise?.name || 'Ejercicio desconocido',
      weight: maxWeightRecord.weight,
      reps: maxWeightRecord.reps,
      date: maxWeightRecord.date,
      volume: maxWeightRecord.weight * maxWeightRecord.reps * maxWeightRecord.sets
    });

    // Si el record de volumen es diferente al de peso, agregarlo también
    if (maxVolumeRecord.id !== maxWeightRecord.id) {
      personalRecords.push({
        exerciseId,
        exerciseName: maxVolumeRecord.exercise?.name || 'Ejercicio desconocido',
        weight: maxVolumeRecord.weight,
        reps: maxVolumeRecord.reps,
        date: maxVolumeRecord.date,
        volume: maxVolumeRecord.weight * maxVolumeRecord.reps * maxVolumeRecord.sets
      });
    }
  });

  // Ordenar por fecha descendente
  return personalRecords.sort((a, b) => b.date.getTime() - a.date.getTime());
};

/**
 * Calcula progresión semanal
 */
export const calculateWeeklyProgress = (records: WorkoutRecord[], weeksCount: number = 8): WeeklyProgress[] => {
  if (records.length === 0) return [];

  const now = new Date();
  const weeks: WeeklyProgress[] = [];

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

      // Calcular 1RM estimado para métricas más precisas
      const estimated1RMs = weekRecords.map(record =>
        record.weight * (1 + Math.min(record.reps, 20) / 30)
      );
      const avgWeight = estimated1RMs.reduce((sum, oneRM) => sum + oneRM, 0) / estimated1RMs.length;
      const maxWeight = Math.max(...estimated1RMs);

      weeks.push({
        week: format(weekStart, 'dd/MM', { locale: es }),
        volume: totalVolume,
        workouts: weekRecords.length,
        avgWeight: Math.round(avgWeight * 100) / 100,
        maxWeight
      });
    }
  }

  return weeks.reverse(); // Más antiguo primero
};

/**
 * Calcula análisis de consistencia
 */
export const calculateConsistency = (records: WorkoutRecord[]): ConsistencyAnalysis => {
  if (records.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      workoutsThisWeek: 0,
      workoutsLastWeek: 0,
      avgWorkoutsPerWeek: 0,
      missedDays: 0
    };
  }

  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Obtener fechas únicas de entrenamiento
  const workoutDates = Array.from(new Set(
    sortedRecords.map(record => format(new Date(record.date), 'yyyy-MM-dd'))
  )).map(dateStr => new Date(dateStr)).sort((a, b) => a.getTime() - b.getTime());

  // Calcular racha actual
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  const today = new Date();

  // Calcular rachas
  for (let i = workoutDates.length - 1; i >= 0; i--) {
    const date = workoutDates[i];
    const daysDifference = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference <= 1 && currentStreak === 0) {
      currentStreak = 1;
      tempStreak = 1;
    } else if (i < workoutDates.length - 1) {
      const nextDate = workoutDates[i + 1];
      const daysBetween = Math.floor((nextDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

      if (daysBetween <= 2) { // Máximo 1 día sin entrenar
        tempStreak++;
        if (daysDifference <= 1) currentStreak = tempStreak;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  // Entrenamientos esta semana (lunes a domingo)
  const thisWeekStart = startOfWeek(today, { locale: es });
  const thisWeekEnd = endOfWeek(today, { locale: es });
  const workoutsThisWeek = records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= thisWeekStart && recordDate <= thisWeekEnd;
  }).length;

  // Entrenamientos semana pasada (lunes a domingo)
  const lastWeekStart = startOfWeek(subWeeks(today, 1), { locale: es });
  const lastWeekEnd = endOfWeek(lastWeekStart, { locale: es });
  const workoutsLastWeek = records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= lastWeekStart && recordDate <= lastWeekEnd;
  }).length;

  // Promedio semanal (últimas 8 semanas)
  const weeksToAnalyze = 8;
  let totalWeeklyWorkouts = 0;
  let weeksWithData = 0;

  for (let i = 0; i < weeksToAnalyze; i++) {
    const weekStart = startOfWeek(subWeeks(today, i), { locale: es });
    const weekEnd = endOfWeek(weekStart, { locale: es });

    const weekWorkouts = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= weekStart && recordDate <= weekEnd;
    }).length;

    if (weekWorkouts > 0) {
      totalWeeklyWorkouts += weekWorkouts;
      weeksWithData++;
    }
  }

  const avgWorkoutsPerWeek = weeksWithData > 0 ?
    Math.round((totalWeeklyWorkouts / weeksWithData) * 100) / 100 : 0;

  return {
    currentStreak,
    longestStreak,
    workoutsThisWeek,
    workoutsLastWeek,
    avgWorkoutsPerWeek,
    missedDays: 0 // TODO: Implementar cálculo de días perdidos
  };
};

/**
 * Calcula tendencia de volumen total
 */
export const calculateVolumeTrend = (records: WorkoutRecord[]): number => {
  if (records.length === 0) return 0;

  const now = new Date();
  const lastMonthStart = subDays(now, 30);
  const previousMonthStart = subDays(now, 60);

  const lastMonthRecords = records.filter(record =>
    new Date(record.date) >= lastMonthStart
  );

  const previousMonthRecords = records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= previousMonthStart && recordDate < lastMonthStart;
  });

  const lastMonthVolume = lastMonthRecords.reduce((sum, record) =>
    sum + (record.weight * record.reps * record.sets), 0
  );

  const previousMonthVolume = previousMonthRecords.reduce((sum, record) =>
    sum + (record.weight * record.reps * record.sets), 0
  );

  if (previousMonthVolume === 0) return lastMonthVolume > 0 ? 100 : 0;

  return Math.round(((lastMonthVolume - previousMonthVolume) / previousMonthVolume) * 100);
};

/**
 * Calcula ganancia de fuerza considerando peso y repeticiones
 */
export const calculateStrengthGains = (records: WorkoutRecord[]): number => {
  if (records.length === 0) return 0;

  const now = new Date();
  const lastMonthStart = subDays(now, 30);
  const previousMonthStart = subDays(now, 60);

  const lastMonthRecords = records.filter(record =>
    new Date(record.date) >= lastMonthStart
  );

  const previousMonthRecords = records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= previousMonthStart && recordDate < lastMonthStart;
  });

  if (lastMonthRecords.length === 0 || previousMonthRecords.length === 0) return 0;

  // Calcular promedio de índices de fuerza (considera peso y repeticiones)
  const lastMonthAvgStrength = lastMonthRecords.reduce((sum, record) => {
    const oneRM = record.weight * (1 + Math.min(record.reps, 20) / 30);
    return sum + oneRM;
  }, 0) / lastMonthRecords.length;

  const previousMonthAvgStrength = previousMonthRecords.reduce((sum, record) => {
    const oneRM = record.weight * (1 + Math.min(record.reps, 20) / 30);
    return sum + oneRM;
  }, 0) / previousMonthRecords.length;

  return Math.round(((lastMonthAvgStrength - previousMonthAvgStrength) / previousMonthAvgStrength) * 100);
};

/**
 * Calcula todas las métricas de rendimiento
 */
export const calculatePerformanceMetrics = (records: WorkoutRecord[]): PerformanceMetrics => {
  return {
    personalRecords: calculatePersonalRecords(records),
    weeklyProgress: calculateWeeklyProgress(records),
    consistency: calculateConsistency(records),
    totalVolumeTrend: calculateVolumeTrend(records),
    strengthGains: calculateStrengthGains(records)
  };
}; 