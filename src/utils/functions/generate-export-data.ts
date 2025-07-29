import { format, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

import { calculateOptimal1RM } from './calculate-1rm.utils';
import type { ExportData } from './export-interfaces';
import { roundToDecimals } from './math-utils';
import { calculateVolume } from './volume-calculations';
import { getMaxWeight } from './workout-utils';

import type { Exercise, WorkoutRecord } from '@/interfaces';

/**
 * Genera datos de exportación completos
 * Refactorizado para usar funciones centralizadas
 */
export const generateExportData = async (
  exercises: Exercise[],
  workoutRecords: WorkoutRecord[],
): Promise<ExportData> => {
  const now = new Date();

  // Ordenar registros por fecha
  const sortedRecords = [...workoutRecords].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Metadata usando función centralizada para calcular volumen total
  const totalVolume = sortedRecords.reduce((sum, record) =>
    sum + calculateVolume(record), 0,
  );

  const metadata = {
    exportDate: format(now, 'dd/MM/yyyy HH:mm', { locale: es }),
    totalExercises: exercises.length,
    totalWorkouts: sortedRecords.length,
    totalVolume,
    dateRange: {
      from: sortedRecords.length > 0 ? format(new Date(sortedRecords[0].date), 'dd/MM/yyyy', { locale: es }) : '',
      to: sortedRecords.length > 0 ? format(new Date(sortedRecords[sortedRecords.length - 1].date), 'dd/MM/yyyy', { locale: es }) : '',
    },
    appVersion: '1.0.0',
  };

  // Interfaces para estadísticas de ejercicios
  interface ExerciseStats {
    workouts: number;
    totalVolume: number;
    weights: number[];
    lastDate: Date;
    firstWeight: number;
    lastWeight: number;
  }

  interface DayExerciseStats {
    exerciseName: string;
    categories: string[];
    frequency: number;
    totalVolume: number;
    volumes: number[];
  }

  // Exercises con estadísticas
  const exerciseStats = new Map<string, ExerciseStats>();
  sortedRecords.forEach(record => {
    const { exerciseId } = record;
    if (!exerciseStats.has(exerciseId)) {
      exerciseStats.set(exerciseId, {
        workouts: 0,
        totalVolume: 0,
        weights: [],
        lastDate: new Date(0),
        firstWeight: 0,
        lastWeight: 0,
      });
    }

    const stats = exerciseStats.get(exerciseId);
    if (stats) {
      stats.workouts++;
      // Usar función centralizada para calcular volumen
      stats.totalVolume += calculateVolume(record);
      stats.weights.push(record.weight);

      if (new Date(record.date) > stats.lastDate) {
        stats.lastDate = new Date(record.date);
        stats.lastWeight = record.weight;
      }

      if (stats.firstWeight === 0) {
        stats.firstWeight = record.weight;
      }
    }
  });

  const exercisesData = exercises.map(exercise => {
    const stats = exerciseStats.get(exercise.id) || {
      workouts: 0, totalVolume: 0, weights: [], lastDate: new Date(0),
      firstWeight: 0, lastWeight: 0,
    };

    const averageWeight = stats.weights.length > 0 ?
      stats.weights.reduce((sum: number, w: number) => sum + w, 0) / stats.weights.length : 0;
    // Usar función centralizada para calcular máximo
    const maxWeight = stats.weights.length > 0 ? getMaxWeight(stats.weights.map(w => ({ weight: w } as WorkoutRecord))) : 0;

    const progressPercentage = stats.firstWeight > 0 ?
      ((stats.lastWeight - stats.firstWeight) / stats.firstWeight) * 100 : 0;

    return {
      id: exercise.id,
      name: exercise.name,
      categories: exercise.categories || [],
      description: exercise.description,
      url: exercise.url,
      totalWorkouts: stats.workouts,
      totalVolume: roundToDecimals(stats.totalVolume),
      averageWeight: roundToDecimals(averageWeight),
      maxWeight,
      lastWorkout: stats.lastDate.getTime() > 0 ?
        format(stats.lastDate, 'dd/MM/yyyy', { locale: es }) : 'Nunca',
      progressPercentage: roundToDecimals(progressPercentage),
    };
  });

  // Workout Records con datos enriquecidos
  const workoutRecordsData = sortedRecords.map(record => {
    // Usar función centralizada para calcular volumen
    const volume = calculateVolume(record);

    return {
      id: record.id,
      exerciseName: record.exercise?.name || 'Ejercicio desconocido',
      exerciseCategories: record.exercise?.categories || [],
      weight: record.weight,
      reps: record.reps,
      sets: record.sets,
      volume: roundToDecimals(volume),
      date: format(new Date(record.date), 'dd/MM/yyyy', { locale: es }),
      dayOfWeek: format(new Date(record.date), 'EEEE', { locale: es }),
      estimated1RM: roundToDecimals(calculateOptimal1RM(record.weight, record.reps)),
      individualSets: record.individualSets?.map(set => ({
        weight: set.weight,
        reps: set.reps,
        volume: roundToDecimals(set.weight * set.reps),
      })),
    };
  });

  // Exercises by Day
  const exercisesByDay = new Map<string, DayExerciseStats>();
  sortedRecords.forEach(record => {
    const dayOfWeek = format(new Date(record.date), 'EEEE', { locale: es });
    const exerciseName = record.exercise?.name || 'Ejercicio desconocido';
    const categories = record.exercise?.categories || [];

    if (!exercisesByDay.has(dayOfWeek)) {
      exercisesByDay.set(dayOfWeek, {
        exerciseName,
        categories,
        frequency: 0,
        totalVolume: 0,
        volumes: [],
      });
    }

    const dayStats = exercisesByDay.get(dayOfWeek);
    if (dayStats) {
      dayStats.frequency++;
      // Usar función centralizada para calcular volumen
      const volume = calculateVolume(record);
      dayStats.totalVolume += volume;
      dayStats.volumes.push(volume);
    }
  });

  const exercisesByDayData = Array.from(exercisesByDay.entries()).map(([dayOfWeek, stats]) => ({
    dayOfWeek,
    exercises: [{
      exerciseName: stats.exerciseName,
      categories: stats.categories,
      frequency: stats.frequency,
      averageVolume: stats.volumes.length > 0 ? roundToDecimals(stats.volumes.reduce((sum, v) => sum + v, 0) / stats.volumes.length) : 0,
      totalVolume: roundToDecimals(stats.totalVolume),
    }],
    totalVolume: roundToDecimals(stats.totalVolume),
    averageVolume: stats.volumes.length > 0 ? roundToDecimals(stats.volumes.reduce((sum, v) => sum + v, 0) / stats.volumes.length) : 0,
    workoutCount: stats.frequency,
  }));

  // Volume Analysis
  const volumeByCategory = new Map<string, { volume: number; count: number }>();
  const volumeByExercise = new Map<string, { volume: number; count: number; categories: string[] }>();

  sortedRecords.forEach(record => {
    // Usar función centralizada para calcular volumen
    const volume = calculateVolume(record);
    const exerciseName = record.exercise?.name || 'Ejercicio desconocido';
    const categories = record.exercise?.categories || [];

    // Por categoría
    categories.forEach(category => {
      const current = volumeByCategory.get(category) || { volume: 0, count: 0 };
      current.volume += volume;
      current.count++;
      volumeByCategory.set(category, current);
    });

    // Por ejercicio
    const current = volumeByExercise.get(exerciseName) || { volume: 0, count: 0, categories };
    current.volume += volume;
    current.count++;
    volumeByExercise.set(exerciseName, current);
  });

  const volumeAnalysis = {
    totalVolume: roundToDecimals(totalVolume),
    volumeByCategory: Array.from(volumeByCategory.entries()).map(([category, stats]) => ({
      category,
      volume: roundToDecimals(stats.volume),
      percentage: roundToDecimals((stats.volume / totalVolume) * 100),
      averagePerWorkout: roundToDecimals(stats.volume / stats.count),
    })),
    volumeByExercise: Array.from(volumeByExercise.entries()).map(([exerciseName, stats]) => ({
      exerciseName,
      volume: roundToDecimals(stats.volume),
      percentage: roundToDecimals((stats.volume / totalVolume) * 100),
      averagePerWorkout: roundToDecimals(stats.volume / stats.count),
      categories: stats.categories,
    })),
  };

  // Weekly Data
  const weeklyData = new Map<string, { volume: number; workouts: number; exercises: Set<string> }>();

  sortedRecords.forEach(record => {
    const weekStart = startOfWeek(new Date(record.date), { locale: es });
    const weekKey = format(weekStart, 'yyyy-MM-dd', { locale: es });

    const current = weeklyData.get(weekKey) || { volume: 0, workouts: 0, exercises: new Set<string>() };
    // Usar función centralizada para calcular volumen
    current.volume += calculateVolume(record);
    current.workouts++;
    current.exercises.add(record.exercise?.name || 'Ejercicio desconocido');
    weeklyData.set(weekKey, current);
  });

  const weeklyDataArray = Array.from(weeklyData.entries()).map(([weekStart, stats]) => ({
    weekStart,
    weekEnd: format(new Date(weekStart), 'dd/MM/yyyy', { locale: es }),
    totalVolume: roundToDecimals(stats.volume),
    workoutCount: stats.workouts,
    averageVolumePerWorkout: roundToDecimals(stats.volume / stats.workouts),
    uniqueExercises: stats.exercises.size,
    categoryBreakdown: [], // Simplificado para este ejemplo
  }));

  // Category Metrics
  const categoryMetrics = Array.from(volumeByCategory.entries()).map(([category, stats]) => ({
    category,
    totalVolume: roundToDecimals(stats.volume),
    percentage: roundToDecimals((stats.volume / totalVolume) * 100),
    workouts: stats.count,
    averageWeight: 0, // Calculado separadamente si es necesario
    maxWeight: 0, // Calculado separadamente si es necesario
    weeklyFrequency: 0, // Calculado separadamente si es necesario
    trend: 'stable' as const,
    progressPercentage: 0, // Calculado separadamente si es necesario
    recommendations: [],
  }));

  // Monthly Stats
  const monthlyStats = new Map<string, { volume: number; workouts: number; exercises: Set<string> }>();

  sortedRecords.forEach(record => {
    const monthKey = format(new Date(record.date), 'yyyy-MM', { locale: es });

    const current = monthlyStats.get(monthKey) || { volume: 0, workouts: 0, exercises: new Set<string>() };
    // Usar función centralizada para calcular volumen
    current.volume += calculateVolume(record);
    current.workouts++;
    current.exercises.add(record.exercise?.name || 'Ejercicio desconocido');
    monthlyStats.set(monthKey, current);
  });

  const monthlyStatsArray = Array.from(monthlyStats.entries()).map(([monthKey, stats]) => ({
    month: format(new Date(`${monthKey}-01`), 'MMMM yyyy', { locale: es }),
    year: new Date(`${monthKey}-01`).getFullYear(),
    totalVolume: roundToDecimals(stats.volume),
    workoutCount: stats.workouts,
    uniqueExercises: stats.exercises.size,
    averageVolumePerWorkout: roundToDecimals(stats.volume / stats.workouts),
    strongestCategory: 'N/A', // Calculado separadamente si es necesario
    improvementAreas: [], // Calculado separadamente si es necesario
  }));

  // Progress Summary
  const progressSummary = {
    overallProgress: 0, // Calculado separadamente
    strengthGains: 0, // Calculado separadamente
    volumeIncrease: 0, // Calculado separadamente
    consistencyScore: 0, // Calculado separadamente
    topPerformingCategories: [], // Calculado separadamente
    areasForImprovement: [], // Calculado separadamente
    personalRecords: [], // Calculado separadamente
  };

  return {
    metadata,
    exercises: exercisesData,
    workoutRecords: workoutRecordsData,
    exercisesByDay: exercisesByDayData,
    volumeAnalysis,
    weeklyData: weeklyDataArray,
    categoryMetrics,
    monthlyStats: monthlyStatsArray,
    progressSummary,
  };
};
