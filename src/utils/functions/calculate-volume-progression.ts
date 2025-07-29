import { calculateCategoryEffortDistribution } from './exercise-patterns';
import { normalizeByWeekday } from './normalize-by-weekday';
import { calculateVolume } from './volume-calculations';

import type { WorkoutRecord } from '@/interfaces';

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

  // **CORRECCIÓN CRÍTICA**: Usar volumen ponderado por esfuerzo de categoría
  const firstHalfAvgVolume = firstHalf.reduce((sum, r) => {
    const categories = r.exercise?.categories || [];
    const effortDistribution = calculateCategoryEffortDistribution(categories, r.exercise?.name);
    const categoryEffort = effortDistribution[categoryName] || 0;
    const totalVolume = calculateVolume(r);
    const categoryVolume = totalVolume * categoryEffort;
    return sum + categoryVolume;
  }, 0) / firstHalf.length;

  const secondHalfAvgVolume = secondHalf.reduce((sum, r) => {
    const categories = r.exercise?.categories || [];
    const effortDistribution = calculateCategoryEffortDistribution(categories, r.exercise?.name);
    const categoryEffort = effortDistribution[categoryName] || 0;
    const totalVolume = calculateVolume(r);
    const categoryVolume = totalVolume * categoryEffort;
    return sum + categoryVolume;
  }, 0) / secondHalf.length;

  if (firstHalfAvgVolume === 0) return 0;

  // **MEJORA CRÍTICA**: Normalizar por día de la semana para comparaciones justas
  const currentDate = new Date();
  const { normalizedCurrent: normalizedSecondHalf, normalizedComparison: normalizedFirstHalf } = normalizeByWeekday(
    secondHalfAvgVolume,
    firstHalfAvgVolume,
    currentDate,
    categoryRecords, // Pasar registros para detectar patrón
  );

  const densityProgression = normalizedFirstHalf > 0 ? ((normalizedSecondHalf - normalizedFirstHalf) / normalizedFirstHalf) * 100 : 0;

  // **MEJORA HÍBRIDA**: Combinar densidad de entrenamiento + progresión individual de ejercicios
  const individualExerciseProgressions: number[] = [];

  // Calcular progresión de volumen de cada ejercicio individual
  const exerciseNames = [...new Set(sortedRecords.map(r => r.exercise?.name).filter(Boolean))];
  exerciseNames.forEach(exerciseName => {
    const exerciseRecords = sortedRecords.filter(r => r.exercise?.name === exerciseName);
    if (exerciseRecords.length >= 2) {
      const exerciseFirstHalf = firstHalf.filter(r => r.exercise?.name === exerciseName);
      const exerciseSecondHalf = secondHalf.filter(r => r.exercise?.name === exerciseName);

      if (exerciseFirstHalf.length > 0 && exerciseSecondHalf.length > 0) {
        const firstAvgVolume = exerciseFirstHalf.reduce((sum, r) => {
          const totalVolume = calculateVolume(r);
          return sum + totalVolume;
        }, 0) / exerciseFirstHalf.length;

        const secondAvgVolume = exerciseSecondHalf.reduce((sum, r) => {
          const totalVolume = calculateVolume(r);
          return sum + totalVolume;
        }, 0) / exerciseSecondHalf.length;

        if (firstAvgVolume > 0) {
          const exerciseProgression = ((secondAvgVolume - firstAvgVolume) / firstAvgVolume) * 100;
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

  // **LÍMITE DE SEGURIDAD**: Progresiones >250% son sospechosas
  if (Math.abs(progression) > 250) {
    progression = Math.sign(progression) * 250;
  }

  return Math.round(progression);
};
