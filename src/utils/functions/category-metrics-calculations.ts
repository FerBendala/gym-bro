import type { ExerciseAssignment, WorkoutRecord } from '../../interfaces';
import { calculateCategoryEffortDistribution } from './exercise-patterns';
import { normalizeByWeekday } from './normalize-weekday-functions';

/**
 * Calcula el número de récords personales en una categoría
 */
export const calculatePersonalRecords = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length === 0) return 0;

  const prCount = new Set();
  const sortedRecords = [...categoryRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let currentMax = 0;
  sortedRecords.forEach(record => {
    if (record.weight > currentMax) {
      currentMax = record.weight;
      prCount.add(record.id);
    }
  });

  return prCount.size;
};

/**
 * Calcula la progresión de peso para una categoría
 * CORREGIDO: Aplica distribuciones de esfuerzo, detecta cambios de ejercicios y limita valores extremos
 */
export const calculateWeightProgression = (categoryRecords: WorkoutRecord[], targetCategory?: string, allAssignments?: ExerciseAssignment[]): number => {
  if (categoryRecords.length < 2) return 0;

  const sortedRecords = [...categoryRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Detectar la categoría objetivo si no se proporciona
  const categoryName = targetCategory || sortedRecords[0]?.exercise?.categories?.[0];
  if (!categoryName) return 0;

  // **CORRECCIÓN FUNDAMENTAL**: División cronológica real, no por cantidad de registros
  const firstDate = new Date(sortedRecords[0].date);
  const lastDate = new Date(sortedRecords[sortedRecords.length - 1].date);
  const timeSpan = lastDate.getTime() - firstDate.getTime();
  const midpointTime = firstDate.getTime() + (timeSpan / 2);

  const firstHalf = sortedRecords.filter(r => new Date(r.date).getTime() <= midpointTime);
  const secondHalf = sortedRecords.filter(r => new Date(r.date).getTime() > midpointTime);

  // Asegurar que ambos períodos tengan al menos un registro
  if (firstHalf.length === 0 || secondHalf.length === 0) {
    // Fallback: división por registros solo si la cronológica falla
    const midpoint = Math.floor(sortedRecords.length / 2);
    const fallbackFirstHalf = sortedRecords.slice(0, Math.max(1, midpoint));
    const fallbackSecondHalf = sortedRecords.slice(Math.max(1, midpoint));

    if (fallbackFirstHalf.length === 0 || fallbackSecondHalf.length === 0) return 0;

    firstHalf.length = 0;
    firstHalf.push(...fallbackFirstHalf);
    secondHalf.length = 0;
    secondHalf.push(...fallbackSecondHalf);
  }

  // **MEJORA INTELIGENTE**: Detectar si hay cambio significativo de ejercicios
  const firstHalfExercises = new Set(firstHalf.map(r => r.exercise?.name).filter(Boolean));
  const secondHalfExercises = new Set(secondHalf.map(r => r.exercise?.name).filter(Boolean));
  const commonExercises = [...firstHalfExercises].filter(ex => secondHalfExercises.has(ex));

  // Si hay pocos ejercicios comunes, usar análisis más conservador
  const hasSignificantExerciseChange = commonExercises.length < Math.min(firstHalfExercises.size, secondHalfExercises.size) * 0.5;

  // **CORRECCIÓN CRÍTICA**: Usar 1RM ponderado por esfuerzo de categoría
  const firstHalfAvg1RM = firstHalf.reduce((sum, r) => {
    const categories = r.exercise?.categories || [];
    const effortDistribution = calculateCategoryEffortDistribution(categories, r.exercise?.name);
    const categoryEffort = effortDistribution[categoryName] || 0;
    const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
    const weightedOneRM = oneRM * categoryEffort;
    return sum + weightedOneRM;
  }, 0) / firstHalf.length;

  const secondHalfAvg1RM = secondHalf.reduce((sum, r) => {
    const categories = r.exercise?.categories || [];
    const effortDistribution = calculateCategoryEffortDistribution(categories, r.exercise?.name);
    const categoryEffort = effortDistribution[categoryName] || 0;
    const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
    const weightedOneRM = oneRM * categoryEffort;
    return sum + weightedOneRM;
  }, 0) / secondHalf.length;

  if (firstHalfAvg1RM === 0) return 0;

  // **MEJORA CRÍTICA**: Normalizar por día de la semana para comparaciones justas
  const currentDate = new Date();
  const { normalizedCurrent: normalizedSecondHalf, normalizedComparison: normalizedFirstHalf } = normalizeByWeekday(
    secondHalfAvg1RM,
    firstHalfAvg1RM,
    currentDate,
    allAssignments // Pasar asignaciones para detectar patrón
  );

  const densityProgression = normalizedFirstHalf > 0 ? ((normalizedSecondHalf - normalizedFirstHalf) / normalizedFirstHalf) * 100 : 0;

  // **MEJORA HÍBRIDA**: Combinar densidad de entrenamiento + progresión individual de ejercicios
  const exerciseNames = [...new Set(sortedRecords.map(r => r.exercise?.name).filter(Boolean))];
  const individualExerciseProgressions: number[] = [];

  // Calcular progresión de cada ejercicio individual
  exerciseNames.forEach(exerciseName => {
    const exerciseRecords = sortedRecords.filter(r => r.exercise?.name === exerciseName);
    if (exerciseRecords.length >= 2) {
      const exerciseFirstHalf = firstHalf.filter(r => r.exercise?.name === exerciseName);
      const exerciseSecondHalf = secondHalf.filter(r => r.exercise?.name === exerciseName);

      if (exerciseFirstHalf.length > 0 && exerciseSecondHalf.length > 0) {
        const firstAvg = exerciseFirstHalf.reduce((sum, r) => {
          const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
          return sum + oneRM;
        }, 0) / exerciseFirstHalf.length;

        const secondAvg = exerciseSecondHalf.reduce((sum, r) => {
          const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
          return sum + oneRM;
        }, 0) / exerciseSecondHalf.length;

        if (firstAvg > 0) {
          const exerciseProgression = ((secondAvg - firstAvg) / firstAvg) * 100;
          individualExerciseProgressions.push(exerciseProgression);
        }
      }
    }
  });

  // Calcular progresión promedio de ejercicios individuales
  const avgIndividualProgression = individualExerciseProgressions.length > 0
    ? individualExerciseProgressions.reduce((sum, p) => sum + p, 0) / individualExerciseProgressions.length
    : 0;

  // **HÍBRIDO INTELIGENTE**: 60% densidad + 40% progresión individual
  // Esto da crédito a mejoras reales en ejercicios aunque la densidad por sesión baje
  let progression = (densityProgression * 0.6) + (avgIndividualProgression * 0.4);

  // **MEJORA ESPECÍFICA PARA PECHO**: Considerar que el volumen es igual de importante
  if (categoryName === 'Pecho') {
    // Para pecho, dar más peso al progreso individual y ser más tolerante con aumentos de volumen
    progression = (densityProgression * 0.4) + (avgIndividualProgression * 0.6);

    // Si hay progreso individual significativo, no penalizar tanto por densidad
    if (avgIndividualProgression > 10) {
      progression = Math.max(progression, avgIndividualProgression * 0.8);
    }
  }

  // **FILTRO INTELIGENTE**: Limitar progresiones extremas causadas por cambio de ejercicios
  if (hasSignificantExerciseChange && Math.abs(progression) > 100) {
    // Si hay cambio significativo de ejercicios y progresión extrema, ser más conservador
    progression = Math.sign(progression) * Math.min(Math.abs(progression), 50);
  }

  // **LÍMITE DE SEGURIDAD**: Progresiones >200% son sospechosas
  if (Math.abs(progression) > 200) {
    progression = Math.sign(progression) * 200;
  }

  return Math.round(progression);
};

/**
 * Calcula la progresión de volumen para una categoría
 * CORREGIDO: Aplica distribuciones de esfuerzo, detecta cambios de ejercicios y limita valores extremos
 */
export const calculateVolumeProgression = (categoryRecords: WorkoutRecord[], targetCategory?: string): number => {
  if (categoryRecords.length < 2) return 0;

  const sortedRecords = [...categoryRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Detectar la categoría objetivo si no se proporciona
  const categoryName = targetCategory || sortedRecords[0]?.exercise?.categories?.[0];
  if (!categoryName) return 0;

  // **CORRECCIÓN FUNDAMENTAL**: División cronológica real
  const firstDate = new Date(sortedRecords[0].date);
  const lastDate = new Date(sortedRecords[sortedRecords.length - 1].date);
  const timeSpan = lastDate.getTime() - firstDate.getTime();
  const midpointTime = firstDate.getTime() + (timeSpan / 2);

  const firstHalf = sortedRecords.filter(r => new Date(r.date).getTime() <= midpointTime);
  const secondHalf = sortedRecords.filter(r => new Date(r.date).getTime() > midpointTime);

  // Asegurar que ambos períodos tengan al menos un registro
  if (firstHalf.length === 0 || secondHalf.length === 0) {
    const midpoint = Math.floor(sortedRecords.length / 2);
    const fallbackFirstHalf = sortedRecords.slice(0, Math.max(1, midpoint));
    const fallbackSecondHalf = sortedRecords.slice(Math.max(1, midpoint));

    if (fallbackFirstHalf.length === 0 || fallbackSecondHalf.length === 0) return 0;

    firstHalf.length = 0;
    firstHalf.push(...fallbackFirstHalf);
    secondHalf.length = 0;
    secondHalf.push(...fallbackSecondHalf);
  }

  // **CORRECCIÓN CRÍTICA**: Usar volumen ponderado por esfuerzo de categoría
  const firstHalfVolume = firstHalf.reduce((sum, r) => {
    const categories = r.exercise?.categories || [];
    const effortDistribution = calculateCategoryEffortDistribution(categories, r.exercise?.name);
    const categoryEffort = effortDistribution[categoryName] || 0;
    const volume = r.weight * r.reps * r.sets;
    const weightedVolume = volume * categoryEffort;
    return sum + weightedVolume;
  }, 0);

  const secondHalfVolume = secondHalf.reduce((sum, r) => {
    const categories = r.exercise?.categories || [];
    const effortDistribution = calculateCategoryEffortDistribution(categories, r.exercise?.name);
    const categoryEffort = effortDistribution[categoryName] || 0;
    const volume = r.weight * r.reps * r.sets;
    const weightedVolume = volume * categoryEffort;
    return sum + weightedVolume;
  }, 0);

  if (firstHalfVolume === 0) return 0;

  // **MEJORA CRÍTICA**: Normalizar por día de la semana
  const currentDate = new Date();
  const { normalizedCurrent: normalizedSecondHalf, normalizedComparison: normalizedFirstHalf } = normalizeByWeekday(
    secondHalfVolume,
    firstHalfVolume,
    currentDate
  );

  const volumeProgression = normalizedFirstHalf > 0 ? ((normalizedSecondHalf - normalizedFirstHalf) / normalizedFirstHalf) * 100 : 0;

  // **LÍMITE DE SEGURIDAD**: Progresiones >300% son sospechosas
  if (Math.abs(volumeProgression) > 300) {
    return Math.sign(volumeProgression) * 300;
  }

  return Math.round(volumeProgression);
};

/**
 * Calcula el score de intensidad para una categoría
 */
export const calculateIntensityScore = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length === 0) return 0;

  const maxWeight = Math.max(...categoryRecords.map(r => r.weight));
  if (maxWeight === 0) return 0;

  const avgWeight = categoryRecords.reduce((sum, r) => sum + r.weight, 0) / categoryRecords.length;
  const intensityRatio = avgWeight / maxWeight;

  // Convertir a score de 0-100
  return Math.round(intensityRatio * 100);
};

/**
 * Calcula el score de eficiencia para una categoría
 */
export const calculateEfficiencyScore = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length === 0) return 0;

  const totalVolume = categoryRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const totalSets = categoryRecords.reduce((sum, r) => sum + r.sets, 0);

  if (totalSets === 0) return 0;

  const volumePerSet = totalVolume / totalSets;

  // Normalizar a un score de 0-100 (ajustar según tus métricas)
  return Math.round(Math.min(100, volumePerSet / 10));
};