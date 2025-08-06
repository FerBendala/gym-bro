import type { WorkoutRecord } from '@/interfaces';
import { getDaysDifference } from '@/utils/functions/date.utils';
import { getCategoryFromExercise } from '@/utils/functions/exercise-categories.utils';
import { startOfWeek, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CategoryWeeklyData, ProcessedUserData, WeeklyData } from './balance-types';

/**
 * Procesa todos los datos de usuario en una sola pasada para optimizar performance
 * @param records - Registros de entrenamiento
 * @returns Datos procesados para cálculos posteriores
 */
export const processUserDataInSinglePass = (records: WorkoutRecord[]): ProcessedUserData => {
  // Validación inicial
  if (!records || records.length === 0) {
    return {
      weeklyWorkouts: new Map(),
      exerciseMaxWeights: new Map(),
      exerciseVolumes: new Map(),
      lastWorkoutByCategory: new Map(),
      personalRecordsByCategory: new Map(),
      totalVolume: 0,
      totalWorkouts: 0,
    };
  }

  const weeklyWorkouts = new Map<string, Set<string>>();
  const exerciseMaxWeights = new Map<string, number>();
  const exerciseVolumes = new Map<string, number>();
  const lastWorkoutByCategory = new Map<string, Date>();
  const personalRecordsByCategory = new Map<string, number>();

  let totalVolume = 0;
  let totalWorkouts = 0;

  // Procesamiento optimizado en una sola pasada
  for (const record of records) {
    // Procesar datos semanales para consistencia y frecuencia
    const weekStart = startOfWeek(record.date, { locale: es });
    const weekKey = weekStart.toISOString().split('T')[0];
    const sessionKey = record.date.toDateString();

    if (!weeklyWorkouts.has(weekKey)) {
      weeklyWorkouts.set(weekKey, new Set());
    }
    weeklyWorkouts.get(weekKey)!.add(sessionKey);

    // Procesar datos de ejercicio para intensidad
    const exerciseKey = record.exerciseId;
    const currentMax = exerciseMaxWeights.get(exerciseKey) || 0;
    exerciseMaxWeights.set(exerciseKey, Math.max(currentMax, record.weight));

    // Procesar volúmenes por categoría
    const category = getCategoryFromExercise(record.exerciseId);
    const currentVolume = exerciseVolumes.get(category) || 0;
    exerciseVolumes.set(category, currentVolume + (record.weight * record.reps * record.sets));

    // Actualizar último entrenamiento por categoría
    const lastWorkout = lastWorkoutByCategory.get(category);
    if (!lastWorkout || record.date > lastWorkout) {
      lastWorkoutByCategory.set(category, record.date);
    }

    // Detectar récords personales
    const currentPR = personalRecordsByCategory.get(category) || 0;
    if (record.weight > currentPR) {
      personalRecordsByCategory.set(category, record.weight);
    }

    totalVolume += record.weight * record.reps * record.sets;
    totalWorkouts++;
  }

  return {
    weeklyWorkouts,
    exerciseMaxWeights,
    exerciseVolumes,
    lastWorkoutByCategory,
    personalRecordsByCategory,
    totalVolume,
    totalWorkouts,
  };
};

/**
 * Calcula datos semanales reales para cada categoría
 * @param records - Registros de entrenamiento
 * @param processedData - Datos procesados
 * @returns Datos semanales por categoría
 */
export const calculateCategoryWeeklyData = (records: WorkoutRecord[], processedData: ProcessedUserData): Map<string, CategoryWeeklyData> => {
  const categoryData = new Map<string, CategoryWeeklyData>();
  const { lastWorkoutByCategory, personalRecordsByCategory } = processedData;

  // Agrupar registros por categoría y semana
  const categoryWeeklyRecords = new Map<string, Map<string, WorkoutRecord[]>>();

  records.forEach(record => {
    const category = getCategoryFromExercise(record.exerciseId);
    const weekStart = startOfWeek(record.date, { locale: es });
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!categoryWeeklyRecords.has(category)) {
      categoryWeeklyRecords.set(category, new Map());
    }
    if (!categoryWeeklyRecords.get(category)!.has(weekKey)) {
      categoryWeeklyRecords.get(category)!.set(weekKey, []);
    }
    categoryWeeklyRecords.get(category)!.get(weekKey)!.push(record);
  });

  // Calcular datos semanales para cada categoría
  categoryWeeklyRecords.forEach((weeklyRecords, category) => {
    const weeklyData: WeeklyData[] = [];

    weeklyRecords.forEach((records, weekKey) => {
      const weekVolume = records.reduce((sum, record) => sum + (record.weight * record.reps * record.sets), 0);
      const exercises = [...new Set(records.map(r => r.exerciseId))];

      weeklyData.push({
        weekStart: weekKey,
        volume: weekVolume,
        workouts: new Set(records.map(r => r.date.toDateString())).size,
        exercises,
      });
    });

    // Ordenar por fecha
    weeklyData.sort((a, b) => a.weekStart.localeCompare(b.weekStart));

    // Calcular volúmenes de semana actual y anterior usando utils generales
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { locale: es });
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { locale: es });

    const currentWeekKey = currentWeekStart.toISOString().split('T')[0];
    const lastWeekKey = lastWeekStart.toISOString().split('T')[0];

    const currentWeekData = weeklyData.find(w => w.weekStart === currentWeekKey);
    const lastWeekData = weeklyData.find(w => w.weekStart === lastWeekKey);

    const currentWeekVolume = currentWeekData?.volume || 0;
    const lastWeekVolume = lastWeekData?.volume || 0;
    const changePercent = lastWeekVolume > 0 ? ((currentWeekVolume - lastWeekVolume) / lastWeekVolume) * 100 : 0;

    // Calcular días desde último entrenamiento usando utils generales
    const lastWorkout = lastWorkoutByCategory.get(category);
    const daysSinceLastWorkout = lastWorkout ? Math.floor(getDaysDifference(new Date(), lastWorkout)) : 0;

    categoryData.set(category, {
      category,
      weeklyData,
      lastWeekVolume,
      currentWeekVolume,
      changePercent,
      lastWorkout: lastWorkout || null,
      personalRecords: personalRecordsByCategory.get(category) || 0,
      daysSinceLastWorkout,
    });
  });

  return categoryData;
};

// Re-exportar tipos necesarios
export type { WeeklyData } from './balance-types';
