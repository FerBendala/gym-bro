import type { WorkoutRecord } from '@/interfaces';
import { determineExperienceLevel } from './determine-experience-level.utils';
import { clamp } from './math-utils';
import { calculateVolume } from './volume-calculations';

/**
 * Analiza el balance de grupos musculares
 */
export const analyzeMuscleGroupBalance = (records: WorkoutRecord[]) => {
  const categoryAnalysis: { [key: string]: number } = {};

  records.forEach(record => {
    const category = record.exercise?.name.split(' ')[0]; // Simplificado
    categoryAnalysis[category || ''] = (categoryAnalysis[category || ''] || 0) + (record.weight * record.reps * record.sets);
  });

  return categoryAnalysis;
};

/**
 * Analiza patrones de entrenamiento diarios
 */
export const analyzeDailyTrainingPatterns = (records: WorkoutRecord[]) => {
  const dailyPatterns: { [key: string]: number } = {};

  records.forEach(record => {
    const day = new Date(record.date).toLocaleDateString('es-ES', { weekday: 'long' });
    dailyPatterns[day] = (dailyPatterns[day] || 0) + 1;
  });

  return dailyPatterns;
};

/**
 * Analiza rangos de repeticiones
 */
export const analyzeRepRanges = (records: WorkoutRecord[]) => {
  let lowRep = 0;
  let highRep = 0;
  let total = 0;

  records.forEach(record => {
    total += record.reps;
    if (record.reps <= 6) lowRep += record.reps;
    if (record.reps >= 12) highRep += record.reps;
  });

  return { lowRep, highRep, total };
};

/**
 * Analiza consistencia temporal
 */
export const analyzeTemporalConsistency = (records: WorkoutRecord[]) => {
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const daysBetween = sortedRecords.length > 1 ?
    (new Date(sortedRecords[sortedRecords.length - 1].date).getTime() - new Date(sortedRecords[0].date).getTime()) / (1000 * 60 * 60 * 24) : 0;

  const consistencyScore = clamp((records.length / Math.max(1, daysBetween / 7)) * 100, 0, 100);

  return { consistencyScore };
};

/**
 * Analiza sobrecarga progresiva
 */
export const analyzeProgressiveOverload = (records: WorkoutRecord[]) => {
  if (records.length < 2) return { overloadScore: 0 };

  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let progressionCount = 0;

  for (let i = 1; i < sortedRecords.length; i++) {
    if (sortedRecords[i].weight > sortedRecords[i - 1].weight) {
      progressionCount++;
    }
  }

  const overloadScore = (progressionCount / (sortedRecords.length - 1)) * 100;
  return { overloadScore };
};

/**
 * Analiza patrones de recuperación
 */
export const analyzeRecoveryPatterns = (records: WorkoutRecord[]) => {
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let consecutiveDays = 0;
  let maxConsecutive = 0;

  for (let i = 1; i < sortedRecords.length; i++) {
    const daysDiff = (new Date(sortedRecords[i].date).getTime() - new Date(sortedRecords[i - 1].date).getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff <= 1) {
      consecutiveDays++;
      maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
    } else {
      consecutiveDays = 0;
    }
  }

  const recoveryScore = maxConsecutive <= 3 ? 100 : Math.max(0, 100 - (maxConsecutive - 3) * 20);
  return { recoveryScore };
};

/**
 * Analiza volumen óptimo
 */
export const analyzeOptimalVolume = (records: WorkoutRecord[]) => {
  const totalVolume = records.reduce((sum, r) => sum + calculateVolume(r), 0);
  const avgVolume = totalVolume / records.length;

  // Volumen óptimo depende del nivel de experiencia
  const experienceLevel = determineExperienceLevel(records);
  let optimalVolume = 1000;

  if (experienceLevel === 'intermediate') optimalVolume = 2000;
  if (experienceLevel === 'advanced') optimalVolume = 3000;

  const volumeScore = Math.min(100, (avgVolume / optimalVolume) * 100);
  return { volumeScore };
};

/**
 * Analiza patrones de seguridad
 */
export const analyzeSafetyPatterns = (records: WorkoutRecord[]) => {
  if (records.length < 2) return { safetyScore: 50 };

  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let safeProgression = 0;

  for (let i = 1; i < sortedRecords.length; i++) {
    const weightIncrease = ((sortedRecords[i].weight - sortedRecords[i - 1].weight) / sortedRecords[i - 1].weight) * 100;
    if (weightIncrease <= 10) safeProgression++;
  }

  const safetyScore = (safeProgression / (sortedRecords.length - 1)) * 100;
  return { safetyScore };
};

/**
 * Analiza especificidad de objetivos
 */
export const analyzeGoalSpecificity = (records: WorkoutRecord[]) => {
  const repRanges = analyzeRepRanges(records);
  const avgReps = repRanges.total / records.length;

  // Especificidad basada en rangos de repeticiones
  let specificityScore = 50;

  if (avgReps >= 8 && avgReps <= 12) specificityScore = 80; // Hipertrofia
  else if (avgReps >= 3 && avgReps <= 6) specificityScore = 80; // Fuerza
  else if (avgReps >= 12) specificityScore = 70; // Resistencia

  return { specificityScore };
};

/**
 * Analiza demandas energéticas
 */
export const analyzeEnergyDemands = (records: WorkoutRecord[]) => {
  const totalVolume = records.reduce((sum, r) => sum + calculateVolume(r), 0);
  const avgVolume = totalVolume / records.length;

  // Demandas energéticas basadas en volumen e intensidad
  const energyScore = clamp(100 - (avgVolume / 100), 0, 100);
  return { energyScore };
}; 