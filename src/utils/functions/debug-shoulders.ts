import { endOfWeek, startOfWeek, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import type { WorkoutRecord } from '../../interfaces';
import { calculateCategoryEffortDistribution } from './exercise-utils';

/**
 * FUNCIÓN DE DEBUGGING: Analiza exactamente qué está pasando con los cálculos de hombros
 * Esta función nos ayudará a entender por qué sale -8% cuando deberían haber aumentado
 */
export const debugShoulderCalculations = (records: WorkoutRecord[]): {
  shoulderExercises: Array<{
    exerciseName: string;
    categories: string[];
    records: Array<{
      date: string;
      weight: number;
      reps: number;
      sets: number;
      totalVolume: number;
      shoulderVolume: number;
      effortDistribution: Record<string, number>;
    }>;
  }>;
  totalShoulderVolume: number;
  volumeProgression: {
    method: string;
    firstHalfAvg: number;
    secondHalfAvg: number;
    progression: number;
    recentWeeksAvg?: number;
    previousWeeksAvg?: number;
    temporalProgression?: number;
  };
  summary: string[];
} => {
  const debug: any = {
    shoulderExercises: [],
    totalShoulderVolume: 0,
    volumeProgression: {},
    summary: []
  };

  // 1. Identificar todos los ejercicios que afectan hombros
  const shoulderRecords: WorkoutRecord[] = [];
  const exerciseGroups: Record<string, WorkoutRecord[]> = {};

  records.forEach(record => {
    const categories = record.exercise?.categories || [];
    if (categories.includes('Hombros')) {
      shoulderRecords.push(record);

      const exerciseName = record.exercise?.name || 'Ejercicio sin nombre';
      if (!exerciseGroups[exerciseName]) {
        exerciseGroups[exerciseName] = [];
      }
      exerciseGroups[exerciseName].push(record);
    }
  });

  debug.summary.push(`Total de registros de hombros encontrados: ${shoulderRecords.length}`);
  debug.summary.push(`Ejercicios únicos que afectan hombros: ${Object.keys(exerciseGroups).length}`);

  // 2. Analizar cada ejercicio
  let totalShoulderVolume = 0;

  Object.entries(exerciseGroups).forEach(([exerciseName, exerciseRecords]) => {
    const categories = exerciseRecords[0]?.exercise?.categories || [];
    const effortDistribution = calculateCategoryEffortDistribution(categories, exerciseName);
    const shoulderEffort = effortDistribution['Hombros'] || 0;

    const processedRecords = exerciseRecords.map(record => {
      const totalVolume = record.weight * record.reps * record.sets;
      const shoulderVolume = totalVolume * shoulderEffort;
      totalShoulderVolume += shoulderVolume;

      return {
        date: record.date.toISOString().split('T')[0],
        weight: record.weight,
        reps: record.reps,
        sets: record.sets,
        totalVolume,
        shoulderVolume,
        effortDistribution
      };
    });

    debug.shoulderExercises.push({
      exerciseName,
      categories,
      records: processedRecords
    });
  });

  debug.totalShoulderVolume = totalShoulderVolume;

  // 3. Calcular progresión usando ambos métodos
  if (shoulderRecords.length >= 2) {
    const sortedRecords = [...shoulderRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // MÉTODO ORIGINAL: Primera mitad vs segunda mitad
    const midpoint = Math.floor(sortedRecords.length / 2);
    const firstHalf = sortedRecords.slice(0, midpoint);
    const secondHalf = sortedRecords.slice(midpoint);

    const firstHalfVolumes = firstHalf.map(r => {
      const categories = r.exercise?.categories || [];
      const effortDistribution = calculateCategoryEffortDistribution(categories, r.exercise?.name);
      const shoulderEffort = effortDistribution['Hombros'] || 0;
      return (r.weight * r.reps * r.sets) * shoulderEffort;
    });

    const secondHalfVolumes = secondHalf.map(r => {
      const categories = r.exercise?.categories || [];
      const effortDistribution = calculateCategoryEffortDistribution(categories, r.exercise?.name);
      const shoulderEffort = effortDistribution['Hombros'] || 0;
      return (r.weight * r.reps * r.sets) * shoulderEffort;
    });

    const firstHalfAvg = firstHalfVolumes.reduce((sum, vol) => sum + vol, 0) / firstHalfVolumes.length;
    const secondHalfAvg = secondHalfVolumes.reduce((sum, vol) => sum + vol, 0) / secondHalfVolumes.length;
    const progression = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

    debug.volumeProgression = {
      method: 'Primera mitad vs Segunda mitad',
      firstHalfAvg,
      secondHalfAvg,
      progression
    };

    // MÉTODO TEMPORAL: Últimas 2 semanas vs 2 semanas anteriores
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { locale: es });

    const recentWeeksStart = startOfWeek(subWeeks(currentWeekStart, 2), { locale: es });
    const recentWeeksEnd = endOfWeek(subWeeks(currentWeekStart, 1), { locale: es });

    const previousWeeksStart = startOfWeek(subWeeks(currentWeekStart, 4), { locale: es });
    const previousWeeksEnd = endOfWeek(subWeeks(currentWeekStart, 3), { locale: es });

    const recentRecords = sortedRecords.filter(r => {
      const date = new Date(r.date);
      return date >= recentWeeksStart && date <= recentWeeksEnd;
    });

    const previousRecords = sortedRecords.filter(r => {
      const date = new Date(r.date);
      return date >= previousWeeksStart && date <= previousWeeksEnd;
    });

    if (recentRecords.length >= 1 && previousRecords.length >= 1) {
      const recentVolumes = recentRecords.map(r => {
        const categories = r.exercise?.categories || [];
        const effortDistribution = calculateCategoryEffortDistribution(categories, r.exercise?.name);
        const shoulderEffort = effortDistribution['Hombros'] || 0;
        return (r.weight * r.reps * r.sets) * shoulderEffort;
      });

      const previousVolumes = previousRecords.map(r => {
        const categories = r.exercise?.categories || [];
        const effortDistribution = calculateCategoryEffortDistribution(categories, r.exercise?.name);
        const shoulderEffort = effortDistribution['Hombros'] || 0;
        return (r.weight * r.reps * r.sets) * shoulderEffort;
      });

      const recentAvg = recentVolumes.reduce((sum, vol) => sum + vol, 0) / recentVolumes.length;
      const previousAvg = previousVolumes.reduce((sum, vol) => sum + vol, 0) / previousVolumes.length;
      const temporalProgression = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

      debug.volumeProgression.recentWeeksAvg = recentAvg;
      debug.volumeProgression.previousWeeksAvg = previousAvg;
      debug.volumeProgression.temporalProgression = temporalProgression;
    }

    debug.summary.push(`Progresión método original: ${progression.toFixed(1)}%`);
    if (debug.volumeProgression.temporalProgression !== undefined) {
      debug.summary.push(`Progresión método temporal: ${debug.volumeProgression.temporalProgression.toFixed(1)}%`);
    }
  }

  return debug;
}; 