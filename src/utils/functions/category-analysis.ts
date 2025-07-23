import { differenceInDays, endOfMonth, endOfWeek, format, getDay, startOfMonth, startOfWeek, subMonths, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { EXERCISE_CATEGORIES, IDEAL_VOLUME_DISTRIBUTION, calculateCategoryEffortDistribution } from '../../constants/exercise-categories';
import type { ExerciseAssignment, WorkoutRecord } from '../../interfaces';

/**
 * Parejas de grupos musculares antagonistas
 */
const ANTAGONIST_PAIRS: Record<string, string> = {
  'Pecho': 'Espalda',
  'Espalda': 'Pecho',
  'Brazos': 'Piernas', // Simplificado
  'Piernas': 'Brazos',
  'Hombros': 'Core',
  'Core': 'Hombros'
};

/**
 * Obtiene la fecha "actual" basada en los datos reales del usuario
 * En lugar de usar new Date() que puede estar en un año diferente
 */
const getCurrentDateFromRecords = (records: WorkoutRecord[]): Date => {
  if (records.length === 0) {
    return new Date(); // Fallback a fecha del sistema si no hay datos
  }

  // Usar la fecha más reciente de los entrenamientos
  const latestDate = new Date(Math.max(...records.map(r => new Date(r.date).getTime())));

  // En lugar de verificar si es "muy antigua", simplemente usar la fecha más reciente
  // esto maneja tanto datos pasados como futuros correctamente
  return latestDate;
};

/**
 * Normaliza métricas semanales basándose en el día actual de la semana
 * CRÍTICO: Evita comparaciones injustas entre semanas incompletas vs completas
 */
export const normalizeByWeekday = (
  currentWeekValue: number,
  comparisonWeekValue: number,
  currentDate: Date = new Date(),
  allAssignments?: ExerciseAssignment[] // Usar asignaciones en lugar de registros
): {
  normalizedCurrent: number;
  normalizedComparison: number;
  weekdayFactor: number;
} => {
  const currentWeekday = getDay(currentDate); // 0 = domingo, 6 = sábado

  // **MEJORA**: Detectar patrón de entrenamiento basado en asignaciones configuradas
  let weekdayFactors: Record<number, number>;

  if (allAssignments && allAssignments.length > 0) {
    // Analizar distribución de asignaciones por día
    const weekdayDistribution = new Array(7).fill(0);
    const totalAssignments = allAssignments.length;

    allAssignments.forEach(assignment => {
      // Mapear DayOfWeek a índice numérico (0-6)
      const dayMap: Record<string, number> = {
        'domingo': 0,
        'lunes': 1,
        'martes': 2,
        'miércoles': 3,
        'jueves': 4,
        'viernes': 5,
        'sábado': 6
      };
      const weekday = dayMap[assignment.dayOfWeek];
      if (weekday !== undefined) {
        weekdayDistribution[weekday]++;
      }
    });

    // Calcular porcentajes de asignaciones por día
    const weekdayPercentages = weekdayDistribution.map(count => count / totalAssignments);

    // Crear factores basados en distribución de asignaciones
    const cumulativePercentages = weekdayPercentages.map((_, index) =>
      weekdayPercentages.slice(0, index + 1).reduce((sum, p) => sum + p, 0)
    );

    weekdayFactors = {
      0: cumulativePercentages[0], // Domingo
      1: cumulativePercentages[1], // Lunes
      2: cumulativePercentages[2], // Martes
      3: cumulativePercentages[3], // Miércoles
      4: cumulativePercentages[4], // Jueves
      5: cumulativePercentages[5], // Viernes
      6: cumulativePercentages[6]  // Sábado
    };

    // **DEBUG**: Log del patrón detectado
    if (currentWeekday === 1 || currentWeekday === 2) { // Lunes o martes
      console.log('[PATRÓN DE ASIGNACIONES DETECTADO]', {
        weekdayDistribution,
        weekdayPercentages,
        cumulativePercentages,
        weekdayFactors,
        currentWeekday,
        totalAssignments
      });
    }
  } else {
    // Fallback: distribución típica (lunes a viernes)
    weekdayFactors = {
      0: 0.0,   // Domingo - no entrena
      1: 0.20,  // Lunes - 20% de la semana
      2: 0.40,  // Martes - 40% de la semana  
      3: 0.60,  // Miércoles - 60% de la semana
      4: 0.80,  // Jueves - 80% de la semana
      5: 1.0,   // Viernes - 100% de la semana
      6: 1.0    // Sábado - 100% de la semana (no entrena)
    };
  }

  const weekdayFactor = weekdayFactors[currentWeekday] || 1.0;

  // Si estamos a mitad de semana, proyectar el valor completo de la semana actual
  const normalizedCurrent = weekdayFactor > 0 ? currentWeekValue / weekdayFactor : currentWeekValue;

  // La semana de comparación ya está completa, no necesita normalización
  const normalizedComparison = comparisonWeekValue;

  return {
    normalizedCurrent,
    normalizedComparison,
    weekdayFactor
  };
};

/**
 * Normaliza tendencias de volumen considerando el día de la semana
 * ESENCIAL: Corrige el problema de "tendencia negativa falsa" los lunes
 */
export const normalizeVolumeTrend = (
  thisWeekVolume: number,
  lastWeekVolume: number,
  currentDate: Date = new Date(),
  allAssignments?: ExerciseAssignment[]
): number => {
  const { normalizedCurrent, normalizedComparison } = normalizeByWeekday(
    thisWeekVolume,
    lastWeekVolume,
    currentDate,
    allAssignments
  );

  if (normalizedComparison === 0) return 0;

  return ((normalizedCurrent - normalizedComparison) / normalizedComparison) * 100;
};

/**
 * Calcula porcentajes de volumen normalizados por día de la semana
 */
export const calculateNormalizedWeeklyPercentage = (
  categoryVolume: number,
  totalVolume: number,
  currentDate: Date = new Date(),
  allAssignments?: ExerciseAssignment[]
): number => {
  const { normalizedCurrent: normalizedCategoryVolume } = normalizeByWeekday(
    categoryVolume,
    categoryVolume, // Solo normalizamos, no comparamos
    currentDate,
    allAssignments
  );

  const { normalizedCurrent: normalizedTotalVolume } = normalizeByWeekday(
    totalVolume,
    totalVolume,
    currentDate,
    allAssignments
  );

  if (normalizedTotalVolume === 0) return 0;
  return (normalizedCategoryVolume / normalizedTotalVolume) * 100;
};

/**
 * Interfaz para métricas por categoría avanzadas
 */
export interface CategoryMetrics {
  category: string;
  workouts: number;
  totalVolume: number;
  avgWeight: number;
  maxWeight: number;
  avgWorkoutsPerWeek: number;
  lastWorkout: Date | null;
  percentage: number; // Porcentaje del volumen total de entrenamiento
  // Nuevas métricas avanzadas
  minWeight: number;
  avgSets: number;
  avgReps: number;
  totalSets: number;
  totalReps: number;
  personalRecords: number;
  estimatedOneRM: number;
  weightProgression: number; // Porcentaje de progreso vs período anterior
  volumeProgression: number; // Porcentaje de progreso vs período anterior
  intensityScore: number; // 0-100 basado en peso vs máximo
  efficiencyScore: number; // Volumen por sesión
  consistencyScore: number; // Regularidad de entrenamientos
  daysSinceLastWorkout: number;
  trend: 'improving' | 'stable' | 'declining';
  strengthLevel: 'beginner' | 'intermediate' | 'advanced';
  recentImprovement: boolean; // Indica si hay mejora reciente en frecuencia
  volumeDistribution: {
    thisWeek: number;
    lastWeek: number;
    thisMonth: number;
    lastMonth: number;
  };
  performanceMetrics: {
    bestSession: {
      date: Date;
      volume: number;
      maxWeight: number;
    };
    averageSessionVolume: number;
    volumePerWorkout: number;
    sessionsAboveAverage: number;
  };
  recommendations: string[];
  warnings: string[];
}

/**
 * Interfaz para balance muscular avanzado
 */
export interface MuscleBalance {
  category: string;
  volume: number;
  percentage: number;
  isBalanced: boolean;
  recommendation: string;
  // Nuevas métricas avanzadas
  idealPercentage: number;
  deviation: number;
  symmetryScore: number;
  antagonistRatio: number;
  strengthIndex: number;
  progressTrend: 'improving' | 'stable' | 'declining';
  lastImprovement: Date | null;
  priorityLevel: 'low' | 'medium' | 'high' | 'critical';
  developmentStage: 'beginner' | 'intermediate' | 'advanced' | 'neglected';
  weeklyFrequency: number;
  intensityScore: number;
  balanceHistory: {
    trend: 'improving' | 'stable' | 'declining';
    consistency: number;
    volatility: number;
  };
  specificRecommendations: string[];
  warnings: string[];
}

/**
 * Interfaz para análisis de categorías
 */
export interface CategoryAnalysis {
  categoryMetrics: CategoryMetrics[];
  muscleBalance: MuscleBalance[];
  dominantCategory: string | null;
  leastTrainedCategory: string | null;
  balanceScore: number; // 0-100, donde 100 es perfectamente balanceado
}

/**
 * Calcula el número de PRs para una categoría
 */
const calculatePersonalRecords = (categoryRecords: WorkoutRecord[]): number => {
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
const calculateWeightProgression = (categoryRecords: WorkoutRecord[], targetCategory?: string, allAssignments?: ExerciseAssignment[]): number => {
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
  const { normalizedCurrent: normalizedSecondHalf, normalizedComparison: normalizedFirstHalf, weekdayFactor } = normalizeByWeekday(
    secondHalfAvg1RM,
    firstHalfAvg1RM,
    currentDate,
    allAssignments // Pasar asignaciones para detectar patrón
  );

  const densityProgression = normalizedFirstHalf > 0 ? ((normalizedSecondHalf - normalizedFirstHalf) / normalizedFirstHalf) * 100 : 0;

  // **DEBUG**: Log para verificar la normalización
  if (categoryName === 'Pecho' || categoryName === 'Espalda' || categoryName === 'Piernas') {
    console.log(`[NORMALIZACIÓN WEIGHT ${categoryName}]`, {
      originalSecondHalf: secondHalfAvg1RM,
      originalFirstHalf: firstHalfAvg1RM,
      normalizedSecondHalf,
      normalizedFirstHalf,
      weekdayFactor,
      densityProgression,
      currentWeekday: currentDate.getDay()
    });
  }

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
 */
/**
 * Calcula la progresión de volumen para una categoría
 * CORREGIDO: Aplica distribuciones de esfuerzo, detecta cambios de ejercicios y limita valores extremos
 */
const calculateVolumeProgression = (categoryRecords: WorkoutRecord[], targetCategory?: string): number => {
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
    const totalVolume = r.weight * r.reps * r.sets;
    const categoryVolume = totalVolume * categoryEffort;
    return sum + categoryVolume;
  }, 0) / firstHalf.length;

  const secondHalfAvgVolume = secondHalf.reduce((sum, r) => {
    const categories = r.exercise?.categories || [];
    const effortDistribution = calculateCategoryEffortDistribution(categories, r.exercise?.name);
    const categoryEffort = effortDistribution[categoryName] || 0;
    const totalVolume = r.weight * r.reps * r.sets;
    const categoryVolume = totalVolume * categoryEffort;
    return sum + categoryVolume;
  }, 0) / secondHalf.length;

  if (firstHalfAvgVolume === 0) return 0;

  // **MEJORA CRÍTICA**: Normalizar por día de la semana para comparaciones justas
  const currentDate = new Date();
  const { normalizedCurrent: normalizedSecondHalf, normalizedComparison: normalizedFirstHalf, weekdayFactor } = normalizeByWeekday(
    secondHalfAvgVolume,
    firstHalfAvgVolume,
    currentDate,
    categoryRecords // Pasar registros para detectar patrón
  );

  const densityProgression = normalizedFirstHalf > 0 ? ((normalizedSecondHalf - normalizedFirstHalf) / normalizedFirstHalf) * 100 : 0;

  // **DEBUG**: Log para verificar la normalización
  if (categoryName === 'Pecho' || categoryName === 'Espalda' || categoryName === 'Piernas') {
    console.log(`[NORMALIZACIÓN VOLUME ${categoryName}]`, {
      originalSecondHalf: secondHalfAvgVolume,
      originalFirstHalf: firstHalfAvgVolume,
      normalizedSecondHalf,
      normalizedFirstHalf,
      weekdayFactor,
      densityProgression,
      currentWeekday: currentDate.getDay()
    });
  }

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
          const totalVolume = r.weight * r.reps * r.sets;
          return sum + totalVolume;
        }, 0) / exerciseFirstHalf.length;

        const secondAvgVolume = exerciseSecondHalf.reduce((sum, r) => {
          const totalVolume = r.weight * r.reps * r.sets;
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

/**
 * Calcula el score de intensidad para una categoría
 * Exportada para uso en múltiples componentes
 */
export const calculateIntensityScore = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length === 0) return 0;

  // Calcular 1RM estimado para cada registro
  const oneRMs = categoryRecords.map(r => r.weight * (1 + Math.min(r.reps, 20) / 30));

  const maxOneRM = Math.max(...oneRMs);
  const avgOneRM = oneRMs.reduce((sum, orm) => sum + orm, 0) / oneRMs.length;

  if (maxOneRM === 0) return 0;

  // Intensidad basada en % de 1RM (más precisa)
  const intensityPercentage = (avgOneRM / maxOneRM) * 100;
  return Math.round(intensityPercentage);
};

/**
 * Calcula el score de eficiencia para una categoría
 */
const calculateEfficiencyScore = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length === 0) return 0;

  const totalVolume = categoryRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const avgVolumePerWorkout = totalVolume / categoryRecords.length;

  // Normalizar a escala 0-100 basado en volumen promedio esperado
  return Math.min(100, Math.round((avgVolumePerWorkout / 500) * 100));
};

/**
 * Calcula la consistencia de entrenamiento para una categoría
 * Mejorado: separa frecuencia de regularidad y penaliza menos los patrones sistemáticos
 */
const calculateTrainingConsistency = (categoryRecords: WorkoutRecord[], avgWorkoutsPerWeek: number): {
  frequencyScore: number;
  regularityScore: number;
  overallScore: number;
} => {
  if (categoryRecords.length === 0) {
    return { frequencyScore: 0, regularityScore: 0, overallScore: 0 };
  }

  // 1. Score de frecuencia (basado en frecuencia óptima por categoría)
  const optimalFrequency = getOptimalFrequency(categoryRecords[0]?.exercise?.categories?.[0] || '');
  const frequencyScore = Math.min(100, (avgWorkoutsPerWeek / optimalFrequency) * 100);

  // 2. Score de regularidad (mejorado para no penalizar patrones sistemáticos)
  const regularityScore = calculateRegularityScore(categoryRecords);

  // 3. Score general (ponderado)
  const overallScore = Math.round((frequencyScore * 0.6) + (regularityScore * 0.4));

  return {
    frequencyScore: Math.round(frequencyScore),
    regularityScore: Math.round(regularityScore),
    overallScore
  };
};

/**
 * Obtiene la frecuencia óptima de entrenamiento por categoría muscular
 */
const getOptimalFrequency = (category: string): number => {
  const frequencies: Record<string, number> = {
    'Pecho': 2.5,      // 2-3 veces por semana
    'Espalda': 2.5,    // 2-3 veces por semana  
    'Piernas': 2.0,    // 2 veces por semana (recuperación lenta)
    'Hombros': 3.0,    // 3 veces por semana (recuperación rápida)
    'Brazos': 3.0,     // 3 veces por semana (recuperación rápida)
    'Core': 3.5       // 3-4 veces por semana (recuperación muy rápida)
  };

  return frequencies[category] || 2.5; // Default 2.5 veces por semana
};

/**
 * Calcula score de regularidad mejorado que no penaliza patrones sistemáticos
 * MEJORADO: Considera el día de la semana actual para evaluaciones más justas
 */
const calculateRegularityScore = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length < 3) return 50; // Score neutral para pocos datos

  const currentDate = getCurrentDateFromRecords(categoryRecords);
  const sortedRecords = [...categoryRecords].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // **MEJORA**: Considerar si la evaluación es en día temprano de la semana
  const currentWeekday = getDay(currentDate);
  const isEarlyWeek = currentWeekday <= 2; // Lunes o Martes

  const daysBetweenWorkouts: number[] = [];
  for (let i = 1; i < sortedRecords.length; i++) {
    const days = Math.floor(
      (new Date(sortedRecords[i].date).getTime() -
        new Date(sortedRecords[i - 1].date).getTime()) / (1000 * 60 * 60 * 24)
    );
    daysBetweenWorkouts.push(days);
  }

  // Detectar si hay un patrón sistemático
  const avgInterval = daysBetweenWorkouts.reduce((sum, days) => sum + days, 0) / daysBetweenWorkouts.length;
  const variance = daysBetweenWorkouts.reduce((sum, days) =>
    sum + Math.pow(days - avgInterval, 2), 0
  ) / daysBetweenWorkouts.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = avgInterval > 0 ? stdDev / avgInterval : 1;

  // **MEJORA**: Ajustar tolerancia basada en el día de la semana
  let toleranceThreshold = 0.3; // Umbral base
  if (isEarlyWeek) {
    // Ser más tolerante al inicio de la semana
    toleranceThreshold = 0.4;
  }

  // **MEJORA**: Considerar el último entrenamiento en el contexto del día actual
  const lastRecordDate = new Date(sortedRecords[sortedRecords.length - 1].date);
  const daysSinceLastWorkout = Math.floor(
    (currentDate.getTime() - lastRecordDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Si el último entrenamiento fue muy reciente y estamos al inicio de la semana,
  // no penalizar la consistencia
  if (isEarlyWeek && daysSinceLastWorkout <= 2) {
    toleranceThreshold = 0.5; // Aún más tolerante
  }

  // Mejorado: No penalizar patrones sistemáticos
  // Si el CV es bajo (< toleranceThreshold), es un patrón regular = buena puntuación
  if (coefficientOfVariation < toleranceThreshold) {
    return Math.min(100, 90 + (10 * (toleranceThreshold - coefficientOfVariation) / toleranceThreshold));
  }

  // Para mayor variabilidad, reducir puntuación gradualmente
  let regularityScore = Math.max(20, 90 - (coefficientOfVariation * 100));

  // **MEJORA**: Bonus por entrenamientos recientes al inicio de semana
  if (isEarlyWeek && daysSinceLastWorkout <= 1) {
    regularityScore = Math.min(100, regularityScore * 1.1); // 10% bonus
  }

  return Math.round(regularityScore);
};

/**
 * Métricas de consistencia independientes
 * Cada eje se mide por separado sin mezclar conceptos
 */
interface ConsistencyMetrics {
  balanceConsistency: number;      // 0-100: Estabilidad del % de volumen
  activityConsistency: number;     // 0-100: Regularidad de actividad
  frequencyConsistency: number;    // 0-100: Estabilidad de frecuencia semanal
  globalConsistency: number;       // 0-100: Promedio ponderado
}

/**
 * Estándares de fuerza por categoría muscular (1RM estimado en kg)
 * Basados en estándares de powerlifting y levantamiento de pesas
 */
const STRENGTH_STANDARDS: Record<string, {
  beginner: number;
  intermediate: number;
  advanced: number;
  elite: number;
}> = {
  'Pecho': {
    beginner: 40,      // Press de banca
    intermediate: 70,
    advanced: 100,
    elite: 130
  },
  'Espalda': {
    beginner: 50,      // Peso muerto / Dominadas lastradas
    intermediate: 80,
    advanced: 120,
    elite: 160
  },
  'Piernas': {
    beginner: 60,      // Sentadilla
    intermediate: 100,
    advanced: 140,
    elite: 180
  },
  'Hombros': {
    beginner: 25,      // Press militar
    intermediate: 45,
    advanced: 65,
    elite: 85
  },
  'Brazos': {
    beginner: 30,      // Curl de bíceps / Press francés
    intermediate: 50,
    advanced: 70,
    elite: 90
  },
  'Core': {
    beginner: 20,      // Plancha con peso / Crunch con disco
    intermediate: 40,
    advanced: 60,
    elite: 80
  }
};

/**
 * Calcula la consistencia específica del balance muscular
 * Mide qué tan estable se mantiene la distribución de volumen de una categoría
 */
const calculateBalanceConsistency = (
  categoryRecords: WorkoutRecord[],
  allRecords: WorkoutRecord[]
): number => {
  if (categoryRecords.length === 0 || allRecords.length === 0) return 0;

  // Agrupar por semanas
  const weeklyData = groupRecordsByWeek(allRecords);
  const categoryWeeklyData = groupRecordsByWeek(categoryRecords);

  // Necesitamos mínimo 4-5 semanas para una medición confiable
  if (weeklyData.length < 4) return 0;

  // Calcular % de volumen de esta categoría cada semana
  const weeklyPercentages = weeklyData.map(week => {
    const weekTotalVolume = week.reduce((sum, record) => sum + (record.weight * record.reps), 0);
    const categoryVolume = categoryWeeklyData
      .find(catWeek => isSameWeek(catWeek[0]?.date.toString(), week[0]?.date.toString()))
      ?.reduce((sum, record) => sum + (record.weight * record.reps), 0) || 0;

    return weekTotalVolume > 0 ? (categoryVolume / weekTotalVolume) * 100 : 0;
  });

  // Calcular desviación estándar
  const mean = weeklyPercentages.reduce((sum, val) => sum + val, 0) / weeklyPercentages.length;
  const variance = weeklyPercentages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / weeklyPercentages.length;
  const stdDev = Math.sqrt(variance);

  // Límites lógicos:
  // - Si stdDev = 0 → score = 100 (perfecta consistencia)
  // - Si stdDev > 20 → score = 0 (muy inconsistente)
  // - Escala entre 0-20 de stdDev a 100-0 de score
  const maxAcceptableStdDev = 20; // 20% de desviación es el límite
  const score = Math.max(0, Math.min(100, 100 - (stdDev / maxAcceptableStdDev) * 100));

  return Math.round(score);
};

/**
 * Calcula la consistencia de actividad (regularidad de entrenamiento)
 * Mide qué tan regularmente se entrena esta categoría
 */
const calculateActivityConsistency = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length === 0) return 0;

  // Agrupar por semanas
  const weeklyData = groupRecordsByWeek(categoryRecords);

  // Necesitamos mínimo 4 semanas para una medición confiable
  if (weeklyData.length < 4) return 0;

  // Calcular semanas totales en el período
  const firstWeek = weeklyData[0][0].date;
  const lastWeek = weeklyData[weeklyData.length - 1][0].date;
  const totalWeeks = Math.ceil((new Date(lastWeek).getTime() - new Date(firstWeek).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

  // Contar semanas activas (con al menos 1 entrenamiento)
  const activeWeeks = weeklyData.length;

  // % de semanas con actividad en esta categoría
  const activityRate = (activeWeeks / totalWeeks) * 100;

  return Math.round(Math.min(100, activityRate));
};

/**
 * Calcula la consistencia de frecuencia (estabilidad de entrenamientos/semana)
 * Mide qué tan estable es el número de entrenamientos por semana
 */
const calculateFrequencyConsistency = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length === 0) return 0;

  // Agrupar por semanas y contar entrenamientos
  const weeklyData = groupRecordsByWeek(categoryRecords);

  // Necesitamos mínimo 4 semanas para una medición confiable
  if (weeklyData.length < 4) return 0;

  // Contar entrenamientos por semana
  const weeklyFrequencies = weeklyData.map(week => {
    // Contar días únicos de entrenamiento en la semana
    const uniqueDays = Array.from(new Set(week.map(record => new Date(record.date).toDateString())));
    return uniqueDays.length;
  });

  // Calcular desviación estándar de la frecuencia
  const mean = weeklyFrequencies.reduce((sum, val) => sum + val, 0) / weeklyFrequencies.length;
  const variance = weeklyFrequencies.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / weeklyFrequencies.length;
  const stdDev = Math.sqrt(variance);

  // Límites lógicos:
  // - Si stdDev = 0 → score = 100 (frecuencia perfectamente estable)
  // - Si stdDev > 2 → score = 0 (frecuencia muy variable)
  // - Escala entre 0-2 de stdDev a 100-0 de score
  const maxAcceptableStdDev = 2; // 2 días de desviación es el límite
  const score = Math.max(0, Math.min(100, 100 - (stdDev / maxAcceptableStdDev) * 100));

  return Math.round(score);
};

/**
 * Calcula todas las métricas de consistencia de forma independiente
 * Cada eje se mide por separado sin mezclar conceptos
 */
const calculateConsistencyMetrics = (
  categoryRecords: WorkoutRecord[],
  allRecords: WorkoutRecord[]
): ConsistencyMetrics => {
  // Calcular cada métrica de forma independiente
  const balanceConsistency = calculateBalanceConsistency(categoryRecords, allRecords);
  const activityConsistency = calculateActivityConsistency(categoryRecords);
  const frequencyConsistency = calculateFrequencyConsistency(categoryRecords);

  // Promedio ponderado con pesos claros
  const weights = {
    balance: 0.4,      // 40% - Lo más importante para balance muscular
    activity: 0.35,    // 35% - Regularidad de entrenamiento
    frequency: 0.25    // 25% - Estabilidad de frecuencia
  };

  const globalConsistency = Math.round(
    (balanceConsistency * weights.balance) +
    (activityConsistency * weights.activity) +
    (frequencyConsistency * weights.frequency)
  );

  return {
    balanceConsistency,
    activityConsistency,
    frequencyConsistency,
    globalConsistency
  };
};

/**
 * Función auxiliar para agrupar registros por semana
 */
const groupRecordsByWeek = (records: WorkoutRecord[]): WorkoutRecord[][] => {
  const weekGroups: { [key: string]: WorkoutRecord[] } = {};

  records.forEach(record => {
    const date = new Date(record.date);
    const weekKey = `${date.getFullYear()}-W${getWeekNumber(date)}`;

    if (!weekGroups[weekKey]) {
      weekGroups[weekKey] = [];
    }
    weekGroups[weekKey].push(record);
  });

  return Object.values(weekGroups).sort((a, b) =>
    new Date(a[0].date).getTime() - new Date(b[0].date).getTime()
  );
};

/**
 * Función auxiliar para obtener el número de semana
 */
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

/**
 * Función auxiliar para verificar si dos fechas están en la misma semana
 */
const isSameWeek = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const week1 = getWeekNumber(d1);
  const week2 = getWeekNumber(d2);
  return d1.getFullYear() === d2.getFullYear() && week1 === week2;
};



/**
 * Calcula porcentajes de volumen por semana para análisis de balance
 */
const calculateWeeklyBalancePercentages = (categoryRecords: WorkoutRecord[], allRecords: WorkoutRecord[]) => {
  const weeklyData: Record<string, { categoryVolume: number; totalVolume: number }> = {};

  // Agrupar todos los registros por semana
  allRecords.forEach(record => {
    const date = new Date(record.date);
    const monday = new Date(date);
    monday.setDate(date.getDate() - date.getDay() + 1);
    const weekKey = monday.toISOString().split('T')[0];

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { categoryVolume: 0, totalVolume: 0 };
    }

    const recordVolume = record.weight * record.reps * record.sets;
    weeklyData[weekKey].totalVolume += recordVolume;

    // Si es de la categoría específica, añadir al volumen de categoría
    const recordCategories = record.exercise?.categories || [];
    const targetCategory = categoryRecords[0]?.exercise?.categories?.[0];
    if (recordCategories.includes(targetCategory || '')) {
      // Usar distribución de esfuerzo si es multi-categoría
      const effortDistribution = calculateCategoryEffortDistribution(recordCategories);
      const categoryEffort = effortDistribution[targetCategory || ''] || 1;
      weeklyData[weekKey].categoryVolume += recordVolume * categoryEffort;
    }
  });

  // Convertir a array con porcentajes
  return Object.entries(weeklyData)
    .filter(([_, data]) => data.totalVolume > 0)
    .map(([week, data]) => ({
      week,
      percentage: (data.categoryVolume / data.totalVolume) * 100,
      categoryVolume: data.categoryVolume,
      totalVolume: data.totalVolume
    }))
    .sort((a, b) => a.week.localeCompare(b.week));
};

/**
 * Analiza la tendencia hacia el balance ideal
 */
const analyzeTrendTowardsIdeal = (weeklyData: any[], idealPercentage: number): number => {
  if (weeklyData.length < 3) return 0;

  const midpoint = Math.floor(weeklyData.length / 2);
  const firstHalf = weeklyData.slice(0, midpoint);
  const secondHalf = weeklyData.slice(midpoint);

  const firstHalfAvg = firstHalf.reduce((sum, w) => sum + w.percentage, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, w) => sum + w.percentage, 0) / secondHalf.length;

  // Calcular si se acerca al ideal
  const firstDeviation = Math.abs(firstHalfAvg - idealPercentage);
  const secondDeviation = Math.abs(secondHalfAvg - idealPercentage);

  // Retorna valor entre -1 (se aleja del ideal) y 1 (se acerca al ideal)
  return firstDeviation > 0 ? (firstDeviation - secondDeviation) / firstDeviation : 0;
};

/**
 * Calcula el score de consistencia para una categoría (función actualizada)
 * Ahora separa diferentes tipos de consistencia para mayor claridad
 */
const calculateConsistencyScore = (categoryRecords: WorkoutRecord[], avgWorkoutsPerWeek: number): number => {
  // Usar solo la consistencia de entrenamiento para mantener compatibilidad
  const trainingConsistency = calculateTrainingConsistency(categoryRecords, avgWorkoutsPerWeek);
  return trainingConsistency.overallScore;
};

/**
 * Determina el nivel de fuerza para una categoría usando los nuevos estándares
 * Actualizada para ser consistente con calculateStrengthIndex
 */
const determineStrengthLevel = (estimatedOneRM: number, category: string): 'beginner' | 'intermediate' | 'advanced' => {
  const standards = STRENGTH_STANDARDS[category];

  if (!standards) {
    // Fallback para categorías sin estándares
    if (estimatedOneRM >= 80) return 'advanced';
    if (estimatedOneRM >= 50) return 'intermediate';
    return 'beginner';
  }

  // Usar los estándares específicos de la categoría
  if (estimatedOneRM >= standards.advanced) return 'advanced';
  if (estimatedOneRM >= standards.intermediate) return 'intermediate';
  return 'beginner';
};

/**
 * Calcula la distribución de volumen temporal para una categoría
 * MEJORADO: Incluye normalización por día de la semana para comparaciones justas
 */
const calculateVolumeDistribution = (categoryRecords: WorkoutRecord[], allRecords?: WorkoutRecord[], allAssignments?: ExerciseAssignment[]): {
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
  // Valores normalizados para comparaciones justas
  thisWeekNormalized: number;
  weekdayFactor: number;
  volumeTrend: number; // Tendencia normalizada
} => {
  // Usar la fecha actual basada en los datos reales
  const now = getCurrentDateFromRecords(allRecords || categoryRecords);

  // Usar date-fns con locale español para consistencia
  const thisWeekStart = startOfWeek(now, { locale: es });
  const thisWeekEnd = endOfWeek(now, { locale: es });

  const lastWeekStart = startOfWeek(subWeeks(now, 1), { locale: es });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { locale: es });

  // Usar funciones de date-fns para meses reales del calendario
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);

  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const thisWeekRecords = categoryRecords.filter(r => {
    const date = new Date(r.date);
    return date >= thisWeekStart && date <= thisWeekEnd;
  });

  const lastWeekRecords = categoryRecords.filter(r => {
    const date = new Date(r.date);
    return date >= lastWeekStart && date <= lastWeekEnd;
  });

  const thisMonthRecords = categoryRecords.filter(r => {
    const date = new Date(r.date);
    return date >= thisMonthStart && date <= thisMonthEnd;
  });

  const lastMonthRecords = categoryRecords.filter(r => {
    const date = new Date(r.date);
    return date >= lastMonthStart && date <= lastMonthEnd;
  });

  // Calcular volúmenes base
  const thisWeekVolume = thisWeekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const lastWeekVolume = lastWeekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

  // **MEJORA CRÍTICA**: Normalizar volumen de esta semana por día actual
  const { normalizedCurrent: thisWeekNormalized, weekdayFactor } = normalizeByWeekday(
    thisWeekVolume,
    lastWeekVolume,
    now,
    allAssignments
  );

  // Calcular tendencia normalizada
  const volumeTrend = normalizeVolumeTrend(thisWeekVolume, lastWeekVolume, now, allAssignments);

  return {
    thisWeek: thisWeekVolume,
    lastWeek: lastWeekVolume,
    thisMonth: thisMonthRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0),
    lastMonth: lastMonthRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0),
    // Nuevos valores normalizados
    thisWeekNormalized: Math.round(thisWeekNormalized),
    weekdayFactor,
    volumeTrend: Math.round(volumeTrend)
  };
};

/**
 * Calcula las métricas de rendimiento para una categoría
 */
const calculateCategoryPerformanceMetrics = (categoryRecords: WorkoutRecord[]) => {
  if (categoryRecords.length === 0) {
    return {
      bestSession: { date: new Date(), volume: 0, maxWeight: 0 },
      averageSessionVolume: 0,
      volumePerWorkout: 0,
      sessionsAboveAverage: 0
    };
  }

  // Agrupar por sesión (por fecha)
  const sessionMap: Record<string, WorkoutRecord[]> = {};
  categoryRecords.forEach(record => {
    const dateKey = new Date(record.date).toDateString();
    if (!sessionMap[dateKey]) sessionMap[dateKey] = [];
    sessionMap[dateKey].push(record);
  });

  const sessions = Object.entries(sessionMap).map(([dateStr, records]) => ({
    date: new Date(dateStr),
    volume: records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0),
    maxWeight: Math.max(...records.map(r => r.weight))
  }));

  const bestSession = sessions.reduce((best, session) =>
    session.volume > best.volume ? session : best
  );

  const averageSessionVolume = sessions.reduce((sum, s) => sum + s.volume, 0) / sessions.length;
  const volumePerWorkout = averageSessionVolume;
  const sessionsAboveAverage = sessions.filter(s => s.volume > averageSessionVolume).length;

  return {
    bestSession,
    averageSessionVolume: Math.round(averageSessionVolume),
    volumePerWorkout: Math.round(volumePerWorkout),
    sessionsAboveAverage
  };
};

/**
 * Genera recomendaciones para una categoría
 */
const generateCategoryRecommendations = (
  category: string,
  metrics: Partial<CategoryMetrics>
): string[] => {
  const recommendations: string[] = [];

  if (metrics.daysSinceLastWorkout && metrics.daysSinceLastWorkout > 7) {
    recommendations.push(`Retomar entrenamientos de ${category.toLowerCase()} - ${metrics.daysSinceLastWorkout} días sin actividad`);
  }

  if (metrics.avgWorkoutsPerWeek && metrics.avgWorkoutsPerWeek < 2) {
    recommendations.push(`Aumentar frecuencia de ${category.toLowerCase()} a 2-3 sesiones por semana`);
  }

  if (metrics.weightProgression && metrics.weightProgression < 0) {
    recommendations.push(`Revisar progresión de peso en ${category.toLowerCase()} - tendencia negativa`);
  }

  if (metrics.consistencyScore && metrics.consistencyScore < 60) {
    recommendations.push(`Mejorar consistencia en entrenamientos de ${category.toLowerCase()}`);
  }

  if (metrics.strengthLevel === 'beginner' && metrics.workouts && metrics.workouts > 20) {
    recommendations.push(`Considerar aumentar intensidad en ${category.toLowerCase()}`);
  }

  return recommendations;
};

/**
 * Genera advertencias para una categoría
 */
const generateCategoryWarnings = (
  category: string,
  metrics: Partial<CategoryMetrics>
): string[] => {
  const warnings: string[] = [];

  if (metrics.daysSinceLastWorkout && metrics.daysSinceLastWorkout > 14) {
    warnings.push(`${category} sin actividad por ${metrics.daysSinceLastWorkout} días`);
  }

  if (metrics.trend === 'declining') {
    warnings.push(`Tendencia negativa en ${category.toLowerCase()}`);
  }

  if (metrics.weightProgression && metrics.weightProgression < -10) {
    warnings.push(`Pérdida significativa de fuerza en ${category.toLowerCase()}`);
  }

  if (metrics.avgWorkoutsPerWeek && metrics.avgWorkoutsPerWeek < 1) {
    warnings.push(`Frecuencia muy baja en ${category.toLowerCase()}`);
  }

  return warnings;
};

/**
 * Calcula métricas por categoría de ejercicio con análisis avanzado
 * Opción 2: Volumen Relativo al Esfuerzo - distribuye el volumen proporcionalmente
 */
export const calculateCategoryMetrics = (records: WorkoutRecord[], allAssignments?: ExerciseAssignment[]): CategoryMetrics[] => {
  if (records.length === 0) return [];

  // Agrupar records por categoría (un record puede contar para múltiples categorías)
  const recordsByCategory: Record<string, WorkoutRecord[]> = {};
  const workoutsByCategory: Record<string, number> = {};
  const volumeByCategory: Record<string, number> = {};

  records.forEach(record => {
    const categories = record.exercise?.categories || [];

    if (categories.length === 0) {
      // Sin categorías
      const category = 'Sin categoría';
      if (!recordsByCategory[category]) {
        recordsByCategory[category] = [];
        workoutsByCategory[category] = 0;
        volumeByCategory[category] = 0;
      }
      recordsByCategory[category].push(record);
      workoutsByCategory[category]++;
      volumeByCategory[category] += record.weight * record.reps * record.sets;
    } else {
      // OPCIÓN 2: Volumen Relativo al Esfuerzo
      // Calcular la distribución de esfuerzo entre categorías
      const totalVolume = record.weight * record.reps * record.sets;
      const effortDistribution = calculateCategoryEffortDistribution(categories);
      const workoutContribution = 1 / categories.length; // Solo dividir workouts, no volumen

      categories.forEach(category => {
        if (!recordsByCategory[category]) {
          recordsByCategory[category] = [];
          workoutsByCategory[category] = 0;
          volumeByCategory[category] = 0;
        }
        recordsByCategory[category].push(record);
        workoutsByCategory[category] += workoutContribution;
        // Asignar volumen basado en el esfuerzo relativo de cada categoría
        volumeByCategory[category] += totalVolume * (effortDistribution[category] || 0);
      });
    }
  });

  // Calcular totalVolume para porcentajes consistentes
  const totalVolume = Object.values(volumeByCategory).reduce((sum, volume) => sum + volume, 0);
  const totalWorkouts = Object.values(workoutsByCategory).reduce((sum, count) => sum + count, 0);
  const metrics: CategoryMetrics[] = [];

  // Obtener fecha actual basada en los datos reales
  const currentDate = getCurrentDateFromRecords(records);

  // Calcular métricas para cada categoría
  Object.entries(recordsByCategory).forEach(([category, categoryRecords]) => {
    const workouts = workoutsByCategory[category];
    const categoryVolume = volumeByCategory[category];

    // Calcular pesos promedio, máximo y mínimo considerando todos los ejercicios de la categoría
    const weights = categoryRecords.map(record => record.weight);
    const avgWeight = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
    const maxWeight = Math.max(...weights);
    const minWeight = Math.min(...weights);

    // Calcular sets y reps promedio y totales
    const sets = categoryRecords.map(record => record.sets);
    const reps = categoryRecords.map(record => record.reps);
    const avgSets = sets.reduce((sum, s) => sum + s, 0) / sets.length;
    const avgReps = reps.reduce((sum, r) => sum + r, 0) / reps.length;
    const totalSets = sets.reduce((sum, s) => sum + s, 0);
    const totalReps = reps.reduce((sum, r) => sum + r, 0);

    // Calcular entrenamientos por semana aproximado - CORREGIDO
    const dates = categoryRecords.map(record => new Date(record.date));
    const uniqueDates = Array.from(new Set(dates.map(d => d.toDateString())));

    // Agrupar por semanas para calcular frecuencia semanal real
    const weeklyData = new Map<string, Set<string>>();

    categoryRecords.forEach(record => {
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

    // MEJORADO: Calcular frecuencia reconociendo mejoras recientes
    let avgWorkoutsPerWeek = 0;
    let recentImprovement = false; // Declarar en el ámbito correcto

    if (weeklyData.size > 0) {
      // Frecuencia histórica promedio
      const historicalAvg = Array.from(weeklyData.values()).reduce((sum, daysSet) => sum + daysSet.size, 0) / weeklyData.size;

      // Lógica de detección de mejoras adaptada al número de semanas
      const sortedWeeks = Array.from(weeklyData.entries())
        .sort(([a], [b]) => a.localeCompare(b));

      if (weeklyData.size >= 2) {
        // Con 2+ semanas, comparar período reciente vs anterior
        if (weeklyData.size >= 4) {
          // Con 4+ semanas: comparar últimas 2 vs anteriores
          const recentWeeks = sortedWeeks.slice(-2);
          const olderWeeks = sortedWeeks.slice(0, -2);

          const recentAvg = recentWeeks.reduce((sum, [_, daysSet]) => sum + daysSet.size, 0) / recentWeeks.length;
          const olderAvg = olderWeeks.reduce((sum, [_, daysSet]) => sum + daysSet.size, 0) / olderWeeks.length;

          if (recentAvg > olderAvg * 1.4) { // 40% mejora
            recentImprovement = true;
            avgWorkoutsPerWeek = (recentAvg * 0.7) + (historicalAvg * 0.3);
          } else {
            avgWorkoutsPerWeek = historicalAvg;
          }
        } else {
          // Con 2-3 semanas: comparar última semana vs anteriores
          const lastWeek = sortedWeeks[sortedWeeks.length - 1];
          const previousWeeks = sortedWeeks.slice(0, -1);

          const lastWeekFreq = lastWeek[1].size;
          const previousAvg = previousWeeks.reduce((sum, [_, daysSet]) => sum + daysSet.size, 0) / previousWeeks.length;

          // Con pocas semanas, ser más liberal: 50% mejora
          if (lastWeekFreq > previousAvg * 1.5 && lastWeekFreq >= 2) {
            recentImprovement = true;
            // Dar más peso a la mejora reciente
            avgWorkoutsPerWeek = (lastWeekFreq * 0.6) + (historicalAvg * 0.4);
          } else {
            avgWorkoutsPerWeek = historicalAvg;
          }
        }
      } else {
        avgWorkoutsPerWeek = historicalAvg;
      }
    }

    const lastWorkout = new Date(Math.max(...dates.map(d => d.getTime())));

    // Usar porcentaje de volumen relativo al esfuerzo
    const percentage = totalVolume > 0 ? (categoryVolume / totalVolume) * 100 : 0;

    // Calcular métricas avanzadas
    const personalRecords = calculatePersonalRecords(categoryRecords);
    const estimatedOneRM = categoryRecords.length > 0 ?
      Math.max(...categoryRecords.map(r => r.weight * (1 + Math.min(r.reps, 20) / 30))) : 0;

    const weightProgression = calculateWeightProgression(categoryRecords, category, allAssignments);
    const volumeProgression = calculateVolumeProgression(categoryRecords, category);
    const intensityScore = calculateIntensityScore(categoryRecords);
    const efficiencyScore = calculateEfficiencyScore(categoryRecords);
    const consistencyScore = calculateConsistencyScore(categoryRecords, avgWorkoutsPerWeek);

    // Usar fecha actual basada en los datos reales en lugar de new Date()
    const daysSinceLastWorkout = Math.floor((currentDate.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));

    // Determinar tendencia basada en progresión de peso y volumen
    // Ser más conservador con pocas semanas de datos
    const weeksWithData = new Set(categoryRecords.map(r => {
      const date = new Date(r.date);
      const monday = new Date(date);
      monday.setDate(date.getDate() - date.getDay() + 1);
      return monday.toISOString().split('T')[0];
    })).size;

    let trend: 'improving' | 'stable' | 'declining' = 'stable';

    // **CORRECCIÓN CRÍTICA**: Implementar lógica mejorada que considera contexto completo
    // Calcular factores de contexto para evaluar tendencias con precisión
    const recentDays = daysSinceLastWorkout;
    const avgVolumePerSession = categoryVolume / categoryRecords.length;

    // **CORRECCIÓN**: Fórmula de fatiga más realista para volúmenes altos
    const fatigueIndex = Math.min(100, Math.max(0, (avgVolumePerSession / 1500) * 60));

    // **CENTRALIZACIÓN**: Usar directamente la lógica de balanceHistory.trend
    // Esto elimina la duplicación y usa el sistema más inteligente
    const balanceHistory = analyzeBalanceHistory(categoryRecords, records, allAssignments);
    trend = balanceHistory.trend; // Usar directamente el resultado del análisis de balance

    // **DEBUG**: Log para verificar la centralización
    if (category === 'Pecho' || category === 'Espalda' || category === 'Piernas') {
      console.log(`[CENTRALIZACIÓN ${category}] Categoría: ${category}`, {
        weightProgression,
        volumeProgression,
        weeksWithData,
        balanceHistoryTrend: balanceHistory.trend,
        finalTrend: trend,
        balanceHistoryConsistency: balanceHistory.consistency,
        balanceHistoryVolatility: balanceHistory.volatility
      });

      // **VERIFICACIÓN FINAL**: Confirmar que la centralización funciona
      console.log(`[VERIFICACIÓN FINAL ${category}] Tendencia final: ${trend}`);
    }

    const strengthLevel = determineStrengthLevel(estimatedOneRM, category);

    // Pasar todos los records como segundo parámetro para cálculo correcto de fechas
    const volumeDistribution = calculateVolumeDistribution(categoryRecords, records, allAssignments);

    const performanceMetrics = calculateCategoryPerformanceMetrics(categoryRecords);

    // Crear objeto base
    const baseMetrics: Partial<CategoryMetrics> = {
      category,
      workouts: Math.round(workouts * 100) / 100,
      totalVolume: Math.round(categoryVolume),
      avgWeight: Math.round(avgWeight * 100) / 100,
      maxWeight,
      minWeight,
      avgSets: Math.round(avgSets * 100) / 100,
      avgReps: Math.round(avgReps * 100) / 100,
      totalSets,
      totalReps,
      avgWorkoutsPerWeek: Math.round(avgWorkoutsPerWeek * 100) / 100,
      lastWorkout,
      percentage: Math.round(percentage * 100) / 100,
      personalRecords,
      estimatedOneRM: Math.round(estimatedOneRM),
      weightProgression,
      volumeProgression,
      intensityScore,
      efficiencyScore,
      consistencyScore,
      daysSinceLastWorkout,
      trend,
      strengthLevel,
      volumeDistribution,
      performanceMetrics,
      recentImprovement
    };

    // Generar recomendaciones y advertencias
    const recommendations = generateCategoryRecommendations(category, baseMetrics);
    const warnings = generateCategoryWarnings(category, baseMetrics);

    // Crear objeto completo
    metrics.push({
      ...baseMetrics,
      recommendations,
      warnings
    } as CategoryMetrics);
  });

  // Ordenar por volumen total descendente
  return metrics.sort((a, b) => b.totalVolume - a.totalVolume);
};

/**
 * Calcula el índice de simetría para un grupo muscular
 */
const calculateSymmetryScore = (category: string, categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length === 0) return 0;

  // Análisis de simetría basado en variabilidad de pesos y repeticiones
  const weights = categoryRecords.map(r => r.weight);
  const reps = categoryRecords.map(r => r.reps);

  // Coeficiente de variación para pesos
  const weightMean = weights.reduce((sum, w) => sum + w, 0) / weights.length;
  const weightVariance = weights.reduce((sum, w) => sum + Math.pow(w - weightMean, 2), 0) / weights.length;
  const weightCV = weightVariance > 0 ? Math.sqrt(weightVariance) / weightMean : 0;

  // Coeficiente de variación para repeticiones
  const repMean = reps.reduce((sum, r) => sum + r, 0) / reps.length;
  const repVariance = reps.reduce((sum, r) => sum + Math.pow(r - repMean, 2), 0) / reps.length;
  const repCV = repVariance > 0 ? Math.sqrt(repVariance) / repMean : 0;

  // Score de simetría: menor variabilidad = mejor simetría
  const symmetryScore = Math.max(0, 100 - ((weightCV + repCV) * 50));
  return Math.round(symmetryScore);
};

/**
 * Calcula el ratio antagonista para un grupo muscular
 */
const calculateAntagonistRatio = (category: string, categoryMetrics: CategoryMetrics[]): number => {
  const antagonist = ANTAGONIST_PAIRS[category];
  if (!antagonist) return 1; // No hay antagonista directo

  const currentMetric = categoryMetrics.find(m => m.category === category);
  const antagonistMetric = categoryMetrics.find(m => m.category === antagonist);

  if (!currentMetric || !antagonistMetric || antagonistMetric.totalVolume === 0) {
    return 0;
  }

  return Math.round((currentMetric.totalVolume / antagonistMetric.totalVolume) * 100) / 100;
};

/**
 * Obtiene el grupo muscular antagonista para una categoría dada
 */
const getAntagonistGroup = (category: string): string | null => {
  return ANTAGONIST_PAIRS[category] || null;
};

/**
 * Calcula el ratio ideal entre un grupo muscular y su antagonista
 */
const calculateIdealAntagonistRatio = (category: string): number => {
  const antagonist = ANTAGONIST_PAIRS[category];
  if (!antagonist) return 1;

  const categoryIdeal = IDEAL_VOLUME_DISTRIBUTION[category] || 15;
  const antagonistIdeal = IDEAL_VOLUME_DISTRIBUTION[antagonist] || 15;

  return categoryIdeal / antagonistIdeal;
};

/**
 * Analiza el desequilibrio antagonista comparando con el ratio ideal
 */
const analyzeAntagonistImbalance = (category: string, actualRatio: number): {
  hasImbalance: boolean;
  type: 'too_much' | 'too_little' | 'balanced';
  severity: 'mild' | 'moderate' | 'severe';
  deviation: number;
} => {
  const idealRatio = calculateIdealAntagonistRatio(category);
  const deviation = ((actualRatio - idealRatio) / idealRatio) * 100;

  // Umbrales basados en porcentaje de desviación del ratio ideal
  const mildThreshold = 20; // ±20%
  const moderateThreshold = 40; // ±40%

  if (Math.abs(deviation) <= mildThreshold) {
    return { hasImbalance: false, type: 'balanced', severity: 'mild', deviation };
  }

  const type = deviation > 0 ? 'too_much' : 'too_little';
  const severity = Math.abs(deviation) > moderateThreshold ? 'severe' : 'moderate';

  return { hasImbalance: true, type, severity, deviation };
};



/**
 * Calcula el índice de fuerza para un grupo muscular usando estándares específicos
 * Opción mejorada que considera las diferencias naturales entre categorías musculares
 */
const calculateStrengthIndex = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length === 0) return 0;

  // Calcular 1RM estimado promedio
  const estimatedOneRMs = categoryRecords.map(record => {
    return record.weight * (1 + Math.min(record.reps, 20) / 30);
  });

  const avgOneRM = estimatedOneRMs.reduce((sum, orm) => sum + orm, 0) / estimatedOneRMs.length;

  // Obtener la categoría del primer record (asumiendo que todos son de la misma categoría)
  const category = categoryRecords[0]?.exercise?.categories?.[0];

  if (!category || !STRENGTH_STANDARDS[category]) {
    // Fallback para categorías sin estándares definidos
    return Math.min(100, Math.round((avgOneRM / 50) * 100));
  }

  const standards = STRENGTH_STANDARDS[category];

  // Calcular índice basado en los estándares específicos de la categoría
  if (avgOneRM >= standards.elite) {
    // Elite: 90-100 puntos
    const eliteProgress = Math.min(1, (avgOneRM - standards.elite) / (standards.elite * 0.3));
    return Math.round(90 + (eliteProgress * 10));
  } else if (avgOneRM >= standards.advanced) {
    // Avanzado: 70-89 puntos
    const advancedProgress = (avgOneRM - standards.advanced) / (standards.elite - standards.advanced);
    return Math.round(70 + (advancedProgress * 19));
  } else if (avgOneRM >= standards.intermediate) {
    // Intermedio: 50-69 puntos
    const intermediateProgress = (avgOneRM - standards.intermediate) / (standards.advanced - standards.intermediate);
    return Math.round(50 + (intermediateProgress * 19));
  } else if (avgOneRM >= standards.beginner) {
    // Principiante: 25-49 puntos
    const beginnerProgress = (avgOneRM - standards.beginner) / (standards.intermediate - standards.beginner);
    return Math.round(25 + (beginnerProgress * 24));
  } else {
    // Por debajo de principiante: 0-24 puntos
    const preBeginnerProgress = Math.min(1, avgOneRM / standards.beginner);
    return Math.round(preBeginnerProgress * 24);
  }
};

/**
 * Obtiene la etiqueta descriptiva del nivel de fuerza
 */
const getStrengthLevelLabel = (strengthIndex: number): 'principiante' | 'intermedio' | 'avanzado' | 'elite' => {
  if (strengthIndex >= 90) return 'elite';
  if (strengthIndex >= 70) return 'avanzado';
  if (strengthIndex >= 50) return 'intermedio';
  return 'principiante';
};


/**
 * Calcula un factor de ajuste temporal para métricas cuando hay pocos datos
 * @param records - Todos los registros de entrenamiento
 * @returns Factor entre 0.3 y 1.0 basado en el tiempo y cantidad de datos
 */
const calculateTemporalAdjustmentFactor = (records: WorkoutRecord[]): number => {
  if (records.length === 0) return 0.3;

  // Calcular días desde el primer registro
  const dates = records.map(r => new Date(r.date).getTime());
  const earliestDate = new Date(Math.min(...dates));
  const latestDate = new Date(Math.max(...dates));
  const daysSinceStart = Math.max(1, differenceInDays(latestDate, earliestDate));

  // Factores de ajuste
  const recordsFactor = Math.min(1, records.length / 50); // 50 registros = factor 1.0
  const timeFactor = Math.min(1, daysSinceStart / 60); // 60 días = factor 1.0
  const uniqueDaysFactor = Math.min(1, new Set(records.map(r => format(new Date(r.date), 'yyyy-MM-dd'))).size / 20); // 20 días únicos = factor 1.0

  // Combinar factores (promedio ponderado)
  const combinedFactor = (recordsFactor * 0.4 + timeFactor * 0.4 + uniqueDaysFactor * 0.2);

  // Asegurar un mínimo de 0.3 para que las métricas no sean demasiado bajas
  return Math.max(0.3, Math.min(1, combinedFactor));
};

/**
 * Ajusta las métricas según el tiempo y cantidad de datos disponibles
 */
const adjustMetricsForLimitedData = (
  metric: number,
  adjustmentFactor: number,
  metricType: 'percentage' | 'score' | 'frequency' = 'score'
): number => {
  if (metricType === 'percentage') {
    // Para porcentajes, ajustar hacia un valor medio (50%)
    return Math.round(metric * adjustmentFactor + 50 * (1 - adjustmentFactor));
  } else if (metricType === 'frequency') {
    // Para frecuencias, no ajustar demasiado
    return metric;
  } else {
    // Para scores, ajustar proporcionalmente pero mantener un mínimo
    const minScore = 30; // Score mínimo para usuarios nuevos
    return Math.round(Math.max(minScore, metric * adjustmentFactor + minScore * (1 - adjustmentFactor)));
  }
};

/**
 * Analiza la tendencia de progreso para un grupo muscular usando valores ya calculados
 * CORRECCIÓN CRÍTICA: Usar valores ya calculados en lugar de recalcular
 */
const analyzeProgressTrend = (
  categoryRecords: WorkoutRecord[],
  targetCategory?: string,
  preCalculatedWeightProgression?: number,
  preCalculatedVolumeProgression?: number,
  allAssignments?: ExerciseAssignment[]
): {
  trend: 'improving' | 'stable' | 'declining';
  lastImprovement: Date | null;
} => {
  if (categoryRecords.length < 4) {
    return { trend: 'stable', lastImprovement: null };
  }

  // **CORRECCIÓN CRÍTICA**: Usar valores ya calculados si están disponibles
  let improvement = preCalculatedWeightProgression;
  let volumeProgression = preCalculatedVolumeProgression;

  // Si no se proporcionan valores precalculados, calcular con la misma lógica
  if (improvement === undefined || volumeProgression === undefined) {
    improvement = calculateWeightProgression(categoryRecords, targetCategory, allAssignments);
    volumeProgression = calculateVolumeProgression(categoryRecords, targetCategory);
  }

  // Ordenar por fecha para lastImprovement
  const sortedRecords = [...categoryRecords].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );


  // Calcular factores de contexto
  const recentDays = Math.floor((new Date().getTime() - new Date(sortedRecords[sortedRecords.length - 1].date).getTime()) / (1000 * 60 * 60 * 24));
  const avgVolumePerSession = volumeProgression > 0 ? sortedRecords.slice(-Math.ceil(sortedRecords.length / 4)).reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0) / Math.ceil(sortedRecords.length / 4) : 0;
  const fatigueIndex = Math.min(100, Math.max(0, (avgVolumePerSession / 1500) * 60));



  let trend: 'improving' | 'stable' | 'declining';

  // Aplicar la misma lógica que en CategoryMetrics
  if (volumeProgression > 25) {
    // **CORRECCIÓN**: Si hay progreso significativo en peso (>15%), no es aumento excesivo
    if (improvement > 15) {
      trend = 'improving'; // Progreso válido en ambos aspectos ✅
    } else {
      trend = 'declining'; // Aumento excesivo de volumen sin progreso de peso
    }
  } else if (volumeProgression > 15) {
    // **CORRECCIÓN DE CONTEXTO**: Evaluar contexto para aumento 15-25%
    if (fatigueIndex < 50 && recentDays <= 2) {
      trend = 'improving'; // Progreso controlado ✅
    } else {
      trend = 'declining'; // Aumento problemático
    }
  } else if (improvement > 5 || volumeProgression > 5) {
    trend = 'improving';
  } else if (improvement < -5 || volumeProgression < -5) {
    trend = 'declining';
  } else {
    // **NUEVA CORRECCIÓN DE PROGRESO**: Considerar volumen cuando progreso de fuerza es mínimo
    if (Math.abs(improvement) < 2.5 && volumeProgression > 5) {
      // Aplicar factor 30% como progreso de fuerza equivalente
      const adjustedProgress = improvement + (volumeProgression * 0.3);
      trend = adjustedProgress > 2.0 ? 'improving' : 'stable';
    } else {
      trend = 'stable';
    }
  }

  // Encontrar último record con mejora significativa usando 1RM
  let lastImprovement: Date | null = null;
  for (let i = 1; i < sortedRecords.length; i++) {
    const current = sortedRecords[i];
    const previous = sortedRecords[i - 1];

    const current1RM = current.weight * (1 + Math.min(current.reps, 20) / 30);
    const previous1RM = previous.weight * (1 + Math.min(previous.reps, 20) / 30);

    if (current1RM > previous1RM * 1.05) { // Mejora del 5% en 1RM
      lastImprovement = new Date(current.date);
    }
  }



  return { trend, lastImprovement };
};

/**
 * Determina el nivel de prioridad para un grupo muscular
 * Enfocado principalmente en el balance de volumen, con factores secundarios
 */
const determinePriorityLevel = (
  deviation: number,
  weeklyFrequency: number,
  progressTrend: 'improving' | 'stable' | 'declining',
  isBalanced: boolean
): 'low' | 'medium' | 'high' | 'critical' => {
  // Si está balanceado, prioridad máxima es 'medium' (solo por factores secundarios)
  if (isBalanced) {
    if (weeklyFrequency < 1) return 'medium'; // Frecuencia muy baja
    if (progressTrend === 'declining') return 'medium'; // Tendencia negativa
    return 'low'; // Bien balanceado y sin problemas
  }

  // Si no está balanceado, prioridad basada en desviación
  if (Math.abs(deviation) > 15) return 'critical';
  if (Math.abs(deviation) > 10) return 'high';
  if (Math.abs(deviation) > 5) return 'medium';

  // Casos edge: frecuencia muy baja o tendencia muy negativa
  if (weeklyFrequency < 1) return 'critical';
  if (progressTrend === 'declining' && Math.abs(deviation) > 3) return 'high';

  return 'low';
};

/**
 * Determina la etapa de desarrollo para un grupo muscular
 * Actualizada para usar los nuevos estándares de fuerza
 */
const determineDevelopmentStage = (
  strengthIndex: number,
  weeklyFrequency: number,
  volume: number
): 'beginner' | 'intermediate' | 'advanced' | 'neglected' => {
  // Si no hay volumen o frecuencia muy baja, está descuidado
  if (volume === 0 || weeklyFrequency < 0.5) return 'neglected';

  // Usar la nueva función de etiquetas de nivel
  const strengthLevel = getStrengthLevelLabel(strengthIndex);

  // Mapear a los tipos esperados por la interfaz
  switch (strengthLevel) {
    case 'elite':
    case 'avanzado':
      return 'advanced';
    case 'intermedio':
      return 'intermediate';
    default:
      return 'beginner';
  }
};

/**
 * Analiza el historial de balance para un grupo muscular
 * Actualizado para medir consistencia real de balance, no solo fuerza
 */
const analyzeBalanceHistory = (categoryRecords: WorkoutRecord[], allRecords?: WorkoutRecord[], allAssignments?: ExerciseAssignment[]): {
  trend: 'improving' | 'stable' | 'declining';
  consistency: number;
  volatility: number;
} => {
  if (categoryRecords.length < 3) {
    return { trend: 'stable', consistency: 0, volatility: 0 };
  }

  // Si tenemos todos los registros, usar análisis de balance real
  if (allRecords && allRecords.length >= categoryRecords.length) {
    const balanceConsistency = calculateBalanceConsistency(categoryRecords, allRecords);
    const weeklyBalanceData = calculateWeeklyBalancePercentages(categoryRecords, allRecords);

    // **DEBUG**: Ver qué camino está tomando
    const categoryName = categoryRecords[0]?.exercise?.categories?.[0];
    if (categoryName === 'Pecho' || categoryName === 'Espalda' || categoryName === 'Piernas') {
      console.log(`[ANALYZE BALANCE HISTORY ${categoryName} - CAMINO]`, {
        allRecordsLength: allRecords.length,
        categoryRecordsLength: categoryRecords.length,
        weeklyBalanceDataLength: weeklyBalanceData.length,
        usingMainPath: weeklyBalanceData.length >= 3,
        usingFallback: weeklyBalanceData.length < 3
      });
    }

    if (weeklyBalanceData.length >= 3) {
      // Analizar tendencia de balance (se acerca o aleja del ideal)
      const idealPercentage = IDEAL_VOLUME_DISTRIBUTION[categoryRecords[0]?.exercise?.categories?.[0] || ''] || 15;
      const trendTowardsIdeal = analyzeTrendTowardsIdeal(weeklyBalanceData, idealPercentage);

      // **MEJORA**: Verificar progreso de fuerza y volumen también en el camino principal
      const volumeProgression = calculateVolumeProgression(categoryRecords);
      const weightProgression = calculateWeightProgression(categoryRecords, undefined, allAssignments);

      let trend: 'improving' | 'stable' | 'declining';

      // **PRIORIDAD**: Si hay progreso significativo, es improving
      if (weightProgression > 5 || volumeProgression > 10) {
        trend = 'improving';
      } else if (trendTowardsIdeal > 0.05) {
        trend = 'improving';
      } else if (trendTowardsIdeal < -0.5) {
        // **VERIFICACIÓN**: Si hay progreso de volumen, ser más tolerante
        if (volumeProgression > 0) {
          trend = 'stable';
        } else {
          trend = 'declining';
        }
      } else {
        trend = 'stable';
      }

      // Calcular volatilidad del balance (variabilidad en porcentajes semanales)
      const percentages = weeklyBalanceData.map(w => w.percentage);
      const avgPercentage = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
      const variance = percentages.reduce((sum, p) => sum + Math.pow(p - avgPercentage, 2), 0) / percentages.length;
      const rawVolatility = avgPercentage > 0 ? (Math.sqrt(variance) / avgPercentage) * 100 : 0;

      // **AJUSTE DINÁMICO**: Reducir sensibilidad basada en cantidad de datos
      const weeksCount = weeklyBalanceData.length;
      let adjustedVolatility = rawVolatility;

      if (weeksCount < 6) {
        // Con pocas semanas, reducir volatilidad significativamente
        const reductionFactor = Math.max(0.3, weeksCount / 10); // 30-60% del valor original
        adjustedVolatility = rawVolatility * reductionFactor;
      } else if (weeksCount < 12) {
        // Con semanas moderadas, reducir volatilidad moderadamente
        const reductionFactor = Math.max(0.6, weeksCount / 15); // 60-80% del valor original
        adjustedVolatility = rawVolatility * reductionFactor;
      }

      // **FILTRO ADICIONAL**: Considerar si la variación es sistemática vs aleatoria
      if (weeksCount >= 4) {
        const sortedPercentages = [...percentages].sort((a, b) => a - b);
        const medianPercentage = sortedPercentages[Math.floor(sortedPercentages.length / 2)];
        const iqr = sortedPercentages[Math.floor(sortedPercentages.length * 0.75)] -
          sortedPercentages[Math.floor(sortedPercentages.length * 0.25)];

        // Si el rango intercuartílico es pequeño, es más consistente de lo que sugiere la varianza
        const iqrRatio = iqr / (medianPercentage || 1);
        if (iqrRatio < 0.5) {
          adjustedVolatility *= 0.7; // Reducir volatilidad 30% más si es sistemático
        }
      }

      // **DEBUG**: Log para el camino principal
      if (categoryRecords[0]?.exercise?.categories?.[0] === 'Pecho' ||
        categoryRecords[0]?.exercise?.categories?.[0] === 'Espalda' ||
        categoryRecords[0]?.exercise?.categories?.[0] === 'Piernas') {
        console.log(`[ANALYZE BALANCE HISTORY ${categoryRecords[0]?.exercise?.categories?.[0]}]`, {
          trendTowardsIdeal,
          weightProgression,
          volumeProgression,
          finalTrend: trend,
          balanceConsistency,
          adjustedVolatility,
          usingFallback: false,
          logic: weightProgression > 5 || volumeProgression > 10 ? 'progression-based' : 'balance-based'
        });
      }

      return {
        trend,
        consistency: balanceConsistency,
        volatility: Math.min(100, Math.round(adjustedVolatility))
      };
    }
  }

  // Fallback: usar análisis de progresión de fuerza si no hay suficientes datos de balance
  const sortedRecords = [...categoryRecords].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // **CORRECCIÓN FUNDAMENTAL**: División cronológica real, no por cantidad de registros
  const firstDate = new Date(sortedRecords[0].date);
  const lastDate = new Date(sortedRecords[sortedRecords.length - 1].date);
  const timeSpan = lastDate.getTime() - firstDate.getTime();
  const midpointTime = firstDate.getTime() + (timeSpan / 2);

  let firstHalf = sortedRecords.filter(r => new Date(r.date).getTime() <= midpointTime);
  let secondHalf = sortedRecords.filter(r => new Date(r.date).getTime() > midpointTime);

  // Asegurar que ambos períodos tengan al menos un registro
  if (firstHalf.length === 0 || secondHalf.length === 0) {
    // Fallback: división por registros solo si la cronológica falla
    const midpoint = Math.floor(sortedRecords.length / 2);
    firstHalf = sortedRecords.slice(0, Math.max(1, midpoint));
    secondHalf = sortedRecords.slice(Math.max(1, midpoint));
  }

  const firstHalfAvg1RM = firstHalf.reduce((sum, r) => {
    const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
    return sum + oneRM;
  }, 0) / firstHalf.length;

  const secondHalfAvg1RM = secondHalf.reduce((sum, r) => {
    const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
    return sum + oneRM;
  }, 0) / secondHalf.length;

  const trendChange = firstHalfAvg1RM > 0 ? ((secondHalfAvg1RM - firstHalfAvg1RM) / firstHalfAvg1RM) * 100 : 0;

  let trend: 'improving' | 'stable' | 'declining';

  // **MEJORA**: Umbrales más tolerantes para todas las categorías
  const categoryName = categoryRecords[0]?.exercise?.categories?.[0];

  // Umbrales extremadamente tolerantes para todas las categorías
  const improvingThreshold = 0.1;  // 0.1% para todas las categorías
  const decliningThreshold = -2.0; // -2.0% para todas las categorías (muy tolerante)

  // **MEJORA**: Lógica más inteligente para el fallback
  const volumeProgression = calculateVolumeProgression(categoryRecords);
  const weightProgression = calculateWeightProgression(categoryRecords, undefined, allAssignments);

  // **LÓGICA PRINCIPAL**: Priorizar progreso de fuerza y volumen sobre trendChange
  if (weightProgression > 0 || volumeProgression > 0) {
    // Si hay cualquier progreso positivo, es improving
    if (weightProgression > 5 || volumeProgression > 10) {
      trend = 'improving';
    } else {
      trend = 'stable';
    }
  } else if (trendChange > improvingThreshold) {
    trend = 'improving';
  } else if (trendChange < decliningThreshold) {
    trend = 'declining';
  } else {
    trend = 'stable';
  }

  // **DEBUG**: Log para verificar el cálculo
  if (categoryName === 'Pecho' || categoryName === 'Espalda' || categoryName === 'Piernas') {
    console.log(`[ANALYZE BALANCE HISTORY ${categoryName}]`, {
      trendChange,
      improvingThreshold,
      decliningThreshold,
      volumeProgression,
      weightProgression,
      finalTrend: trend,
      firstHalfAvg1RM,
      secondHalfAvg1RM,
      usingFallback: true,
      logic: weightProgression > 5 || volumeProgression > 10 ? 'progression-based' : 'trendChange-based'
    });
  }

  // Calcular consistencia de progreso (no de balance, pero mejor que nada)
  const oneRMs = sortedRecords.map(r => r.weight * (1 + Math.min(r.reps, 20) / 30));
  const mean = oneRMs.reduce((sum, v) => sum + v, 0) / oneRMs.length;
  const variance = oneRMs.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / oneRMs.length;
  const stdDev = Math.sqrt(variance);
  const consistency = mean > 0 ? Math.max(0, 100 - ((stdDev / mean) * 100)) : 0;

  // Calcular volatilidad
  const volatility = mean > 0 ? (stdDev / mean) * 100 : 0;

  // **MEJORA**: Calcular volatilidad más tolerante también en el fallback
  const rawVolatility = mean > 0 ? (stdDev / mean) * 100 : 0;

  // Reducir volatilidad cuando hay pocos datos
  const recordsCount = sortedRecords.length;
  let adjustedVolatility = rawVolatility;

  if (recordsCount < 10) {
    adjustedVolatility = rawVolatility * 0.5; // 50% del valor original
  } else if (recordsCount < 20) {
    adjustedVolatility = rawVolatility * 0.7; // 70% del valor original
  }

  return {
    trend,
    consistency: Math.round(consistency),
    volatility: Math.round(Math.min(100, adjustedVolatility))
  };
};

/**
 * Genera recomendaciones específicas para un grupo muscular
 */
const generateSpecificRecommendations = (
  category: string,
  balance: Partial<MuscleBalance>,
  categoryMetrics: CategoryMetrics[],
  context?: { recentImprovement?: boolean }
): string[] => {
  const recommendations: string[] = [];

  // Recomendaciones por desviación
  if (balance.deviation && Math.abs(balance.deviation) > 10) {
    if (balance.deviation > 0) {
      recommendations.push(`Reducir volumen de ${category.toLowerCase()} en ${Math.round(balance.deviation)}%`);
    } else {
      recommendations.push(`Aumentar volumen de ${category.toLowerCase()} en ${Math.round(Math.abs(balance.deviation))}%`);
    }
  }

  // Recomendaciones por frecuencia con reconocimiento de mejoras recientes
  if (balance.weeklyFrequency && balance.weeklyFrequency < 2) {
    if (context?.recentImprovement) {
      recommendations.push(`¡Excelente progreso en frecuencia! Mantén esta mejora y busca llegar a 2-3 sesiones semanales consistentes`);
    } else {
      recommendations.push(`Aumentar frecuencia a 2-3 sesiones por semana`);
    }
  } else if (balance.weeklyFrequency && balance.weeklyFrequency >= 2 && balance.weeklyFrequency < 3) {
    if (context?.recentImprovement) {
      recommendations.push(`¡Muy bien! Has mejorado significativamente la frecuencia. Mantén este ritmo de 2+ sesiones semanales`);
    }
  } else if (balance.weeklyFrequency && balance.weeklyFrequency > 4) {
    recommendations.push(`Reducir frecuencia para mejorar recuperación`);
  }

  // Recomendaciones por tendencia
  if (balance.progressTrend === 'declining') {
    recommendations.push(`Revisar técnica y progresión en ${category.toLowerCase()}`);
  } else if (balance.progressTrend === 'stable') {
    recommendations.push(`Variar ejercicios para estimular crecimiento`);
  }

  // Recomendaciones por ratio antagonista - Nueva lógica basada en ratios ideales
  if (balance.antagonistRatio && balance.antagonistRatio > 0) {
    const imbalanceAnalysis = analyzeAntagonistImbalance(category, balance.antagonistRatio);
    const antagonist = getAntagonistGroup(category);

    if (imbalanceAnalysis.hasImbalance && antagonist) {
      if (imbalanceAnalysis.type === 'too_little') {
        recommendations.push(`Aumentar volumen de ${category.toLowerCase()} para equilibrar con ${antagonist.toLowerCase()}`);
      } else if (imbalanceAnalysis.type === 'too_much') {
        recommendations.push(`Reducir volumen de ${category.toLowerCase()} o aumentar ${antagonist.toLowerCase()} para equilibrar`);
      }
    }
  }

  // Recomendaciones por intensidad
  if (balance.intensityScore && balance.intensityScore < 70) {
    recommendations.push(`Aumentar intensidad progresivamente`);
  }

  return recommendations;
};

/**
 * Genera advertencias para un grupo muscular
 */
const generateWarnings = (
  category: string,
  balance: Partial<MuscleBalance>,
  categoryMetrics: CategoryMetrics[] = []
): string[] => {
  const warnings: string[] = [];

  if (balance.priorityLevel === 'critical') {
    warnings.push(`${category} requiere atención inmediata`);
  }

  if (balance.developmentStage === 'neglected') {
    warnings.push(`${category} ha sido descuidado - riesgo de desequilibrio`);
  }

  if (balance.progressTrend === 'declining') {
    warnings.push(`Progreso en declive en ${category.toLowerCase()}`);
  }

  // Nueva lógica de desequilibrio antagonista basada en ratios ideales
  if (balance.antagonistRatio && balance.antagonistRatio > 0) {
    const imbalanceAnalysis = analyzeAntagonistImbalance(category, balance.antagonistRatio);
    const antagonist = getAntagonistGroup(category);

    if (imbalanceAnalysis.hasImbalance && antagonist) {
      // Solo mostrar advertencia si este grupo debe mostrarla (evitar duplicados)
      if (shouldShowAntagonistWarning(category, antagonist, balance.antagonistRatio, categoryMetrics)) {
        // Obtener porcentajes reales para contexto
        const categoryData = categoryMetrics.find(m => m.category === category);
        const antagonistData = categoryMetrics.find(m => m.category === antagonist);

        if (categoryData && antagonistData) {
          const categoryPercent = Math.round(categoryData.percentage * 10) / 10;
          const antagonistPercent = Math.round(antagonistData.percentage * 10) / 10;

          if (imbalanceAnalysis.type === 'too_much') {
            warnings.push(`Desequilibrio: ${category.toLowerCase()} ${categoryPercent}% vs ${antagonist.toLowerCase()} ${antagonistPercent}% - considera equilibrar`);
          } else if (imbalanceAnalysis.type === 'too_little') {
            // Determinar si el problema es volumen o frecuencia
            if (balance.weeklyFrequency && balance.weeklyFrequency < 1.5) {
              warnings.push(`${category.toLowerCase()} (${categoryPercent}%) necesita mayor frecuencia semanal vs ${antagonist.toLowerCase()} (${antagonistPercent}%)`);
            } else {
              warnings.push(`${category.toLowerCase()} (${categoryPercent}%) necesita más volumen vs ${antagonist.toLowerCase()} (${antagonistPercent}%)`);
            }
          }
        }
      }
    }
  }

  if (balance.balanceHistory?.volatility && balance.balanceHistory.volatility > 70) {
    const volatilityPercent = Math.round(balance.balanceHistory.volatility);
    if (volatilityPercent > 85) {
      warnings.push(`Entrenamiento muy irregular en ${category.toLowerCase()} (${volatilityPercent}% variación) - establece rutina más consistente`);
    } else {
      warnings.push(`Entrenamiento irregular en ${category.toLowerCase()} (${volatilityPercent}% variación) - intenta ser más constante`);
    }
  }

  return warnings;
};

/**
 * Determina si debe mostrar advertencia antagonista para evitar duplicados
 * Solo muestra la advertencia desde el grupo con mayor desviación
 */
const shouldShowAntagonistWarning = (
  category: string,
  antagonist: string,
  actualRatio: number,
  categoryMetrics: CategoryMetrics[]
): boolean => {
  // Obtener métricas de ambos grupos
  const categoryData = categoryMetrics.find(m => m.category === category);
  const antagonistData = categoryMetrics.find(m => m.category === antagonist);

  if (!categoryData || !antagonistData) return false;

  // Calcular desviaciones absolutas respecto a sus ideales individuales
  const categoryIdeal = IDEAL_VOLUME_DISTRIBUTION[category] || 15;
  const antagonistIdeal = IDEAL_VOLUME_DISTRIBUTION[antagonist] || 15;

  const categoryDeviation = Math.abs(categoryData.percentage - categoryIdeal);
  const antagonistDeviation = Math.abs(antagonistData.percentage - antagonistIdeal);

  // Solo mostrar desde el grupo con mayor desviación individual
  // En caso de empate, usar orden alfabético para consistencia
  if (categoryDeviation === antagonistDeviation) {
    return category < antagonist;
  }

  return categoryDeviation > antagonistDeviation;
};

/**
 * Analiza el balance muscular con métricas avanzadas
 */
export const analyzeMuscleBalance = (records: WorkoutRecord[], allAssignments?: ExerciseAssignment[]): MuscleBalance[] => {
  if (records.length === 0) return [];

  const categoryMetrics = calculateCategoryMetrics(records, allAssignments);
  const totalVolume = categoryMetrics.reduce((sum, metric) => sum + metric.totalVolume, 0);

  // Calcular factor de ajuste temporal
  const temporalAdjustmentFactor = calculateTemporalAdjustmentFactor(records);

  // Usar distribución ideal centralizada
  const idealDistribution = IDEAL_VOLUME_DISTRIBUTION;

  // Agrupar registros por categoría para análisis detallado
  const recordsByCategory: Record<string, WorkoutRecord[]> = {};
  records.forEach(record => {
    const categories = record.exercise?.categories || [];
    if (categories.length === 0) {
      const category = 'Sin categoría';
      if (!recordsByCategory[category]) recordsByCategory[category] = [];
      recordsByCategory[category].push(record);
    } else {
      categories.forEach(category => {
        if (!recordsByCategory[category]) recordsByCategory[category] = [];
        recordsByCategory[category].push(record);
      });
    }
  });

  const muscleBalance: MuscleBalance[] = [];

  // Analizar cada categoría con métricas
  categoryMetrics.forEach(metric => {
    const actualPercentage = (metric.totalVolume / totalVolume) * 100;
    const idealPercentage = idealDistribution[metric.category] || 15;
    const deviation = actualPercentage - idealPercentage;

    // Ajustar el margen de balance según el factor temporal
    const balanceMargin = 3 + (7 * (1 - temporalAdjustmentFactor)); // Margen más estricto: máximo 10% en lugar de 20%
    const isBalanced = Math.abs(deviation) <= balanceMargin;

    // DEBUG: Log para verificar la lógica de balance más estricta
    if (process.env.NODE_ENV === 'development' && (metric.category === 'Pecho' || metric.category === 'Espalda' || metric.category === 'Piernas')) {
      console.log(`🔧 DEBUG - Balance ${metric.category} (MARGEN ESTRICTO):`, {
        category: metric.category,
        actualPercentage,
        idealPercentage,
        deviation,
        balanceMargin,
        temporalAdjustmentFactor,
        isBalanced,
        status: isBalanced ? 'Equilibrado' : 'Desequilibrado'
      });
    }

    // Obtener registros específicos para esta categoría
    const categoryRecords = recordsByCategory[metric.category] || [];

    // Calcular métricas avanzadas con ajustes
    const rawSymmetryScore = calculateSymmetryScore(metric.category, categoryRecords);
    const symmetryScore = adjustMetricsForLimitedData(rawSymmetryScore, temporalAdjustmentFactor, 'score');

    const antagonistRatio = calculateAntagonistRatio(metric.category, categoryMetrics);

    const rawStrengthIndex = calculateStrengthIndex(categoryRecords);
    const strengthIndex = adjustMetricsForLimitedData(rawStrengthIndex, temporalAdjustmentFactor, 'score');

    // **CORRECCIÓN CRÍTICA**: Usar lógica mejorada que considera volumen, fatiga y recuperación
    // En lugar de solo 1RM, analizar tendencias con contexto completo
    const progressAnalysis = analyzeProgressTrend(
      categoryRecords,
      metric.category,
      metric.weightProgression,
      metric.volumeProgression
    );

    const intensityScore = calculateIntensityScore(categoryRecords);

    const balanceHistory = analyzeBalanceHistory(categoryRecords, records, allAssignments);
    // Ajustar consistencia del historial
    balanceHistory.consistency = adjustMetricsForLimitedData(balanceHistory.consistency, temporalAdjustmentFactor, 'percentage');

    // Determinar características con ajustes para datos limitados
    const adjustedDeviation = deviation * temporalAdjustmentFactor; // Reducir la importancia de la desviación con pocos datos
    const priorityLevel = determinePriorityLevel(adjustedDeviation, metric.avgWorkoutsPerWeek, progressAnalysis.trend, isBalanced);
    const developmentStage = determineDevelopmentStage(strengthIndex, metric.avgWorkoutsPerWeek, metric.totalVolume);

    // Generar recomendación básica considerando el factor temporal
    let recommendation = '';
    if (temporalAdjustmentFactor < 0.5) {
      // Con muy pocos datos, dar recomendaciones más generales
      recommendation = `Continúa registrando entrenamientos de ${metric.category.toLowerCase()} para análisis más precisos`;
    } else if (actualPercentage < idealPercentage - balanceMargin) {
      recommendation = `Entrenar más ${metric.category.toLowerCase()} (+${Math.round(Math.abs(deviation))}%)`;
    } else if (actualPercentage > idealPercentage + balanceMargin) {
      recommendation = `Reducir volumen de ${metric.category.toLowerCase()} (-${Math.round(deviation)}%)`;
    } else {
      recommendation = `Balance adecuado en ${metric.category.toLowerCase()}`;
    }

    // Crear objeto completo
    const balanceData: Partial<MuscleBalance> = {
      category: metric.category,
      volume: metric.totalVolume,
      percentage: Math.round(actualPercentage * 100) / 100,
      isBalanced,
      recommendation,
      idealPercentage,
      deviation: Math.round(deviation * 100) / 100,
      symmetryScore,
      antagonistRatio,
      strengthIndex,
      progressTrend: progressAnalysis.trend,
      lastImprovement: progressAnalysis.lastImprovement,
      priorityLevel,
      developmentStage,
      weeklyFrequency: metric.avgWorkoutsPerWeek,
      intensityScore,
      balanceHistory
    };

    // Generar recomendaciones específicas y advertencias
    const additionalContext = { recentImprovement: metric.recentImprovement }; // Usar el valor del metric
    const specificRecommendations = generateSpecificRecommendations(metric.category, balanceData, categoryMetrics, additionalContext);
    const warnings = generateWarnings(metric.category, balanceData, categoryMetrics);

    // Objeto final completo
    muscleBalance.push({
      ...balanceData,
      specificRecommendations,
      warnings
    } as MuscleBalance);
  });

  // Agregar categorías faltantes con valores por defecto
  EXERCISE_CATEGORIES.forEach(category => {
    if (!muscleBalance.find(balance => balance.category === category)) {
      const idealPercentage = idealDistribution[category] || 15;

      // Ajustar métricas por defecto según el factor temporal
      const adjustedSymmetryScore = adjustMetricsForLimitedData(0, temporalAdjustmentFactor, 'score');
      const adjustedStrengthIndex = adjustMetricsForLimitedData(0, temporalAdjustmentFactor, 'score');
      const adjustedIntensityScore = adjustMetricsForLimitedData(0, temporalAdjustmentFactor, 'percentage');

      const balanceData: Partial<MuscleBalance> = {
        category,
        volume: 0,
        percentage: 0,
        isBalanced: false,
        recommendation: temporalAdjustmentFactor < 0.5
          ? `Considera agregar ejercicios de ${category.toLowerCase()} cuando estés listo`
          : `Comenzar entrenamientos de ${category.toLowerCase()}`,
        idealPercentage,
        deviation: -idealPercentage,
        symmetryScore: adjustedSymmetryScore,
        antagonistRatio: 0,
        strengthIndex: adjustedStrengthIndex,
        progressTrend: 'stable',
        lastImprovement: null,
        priorityLevel: temporalAdjustmentFactor < 0.5 ? 'medium' : 'critical',
        developmentStage: 'neglected',
        weeklyFrequency: 0,
        intensityScore: adjustedIntensityScore,
        balanceHistory: {
          trend: 'stable',
          consistency: adjustMetricsForLimitedData(0, temporalAdjustmentFactor, 'percentage'),
          volatility: 0
        }
      };

      const specificRecommendations = generateSpecificRecommendations(category, balanceData, categoryMetrics);
      const warnings = temporalAdjustmentFactor < 0.5 ? [] : generateWarnings(category, balanceData, categoryMetrics);

      muscleBalance.push({
        ...balanceData,
        specificRecommendations,
        warnings
      } as MuscleBalance);
    }
  });

  return muscleBalance.sort((a, b) => b.percentage - a.percentage);
};

/**
 * Calcula el score de balance general (0-100)
 */
export const calculateBalanceScore = (muscleBalance: MuscleBalance[], records?: WorkoutRecord[]): number => {
  if (muscleBalance.length === 0) return 0;

  const balancedCategories = muscleBalance.filter(balance => balance.isBalanced).length;
  const totalCategories = muscleBalance.filter(balance => balance.volume > 0).length;

  if (totalCategories === 0) return 0;

  // Calcular score base
  const baseScore = (balancedCategories / totalCategories) * 100;

  // Si se proporcionan los records, ajustar el score según el factor temporal
  if (records && records.length > 0) {
    const temporalAdjustmentFactor = calculateTemporalAdjustmentFactor(records);

    // Con pocos datos, ser más generoso con el score
    if (temporalAdjustmentFactor < 0.7) {
      // Dar bonus por estar empezando
      const beginnerBonus = (1 - temporalAdjustmentFactor) * 20;
      return Math.min(100, Math.round(baseScore + beginnerBonus));
    }
  }

  return Math.round(baseScore);
};

/**
 * Encuentra la categoría dominante
 */
export const findDominantCategory = (categoryMetrics: CategoryMetrics[]): string | null => {
  if (categoryMetrics.length === 0) return null;

  const sorted = [...categoryMetrics].sort((a, b) => b.percentage - a.percentage);
  return sorted[0]?.category || null;
};

/**
 * Encuentra la categoría menos entrenada (con al menos 1 entrenamiento)
 */
export const findLeastTrainedCategory = (categoryMetrics: CategoryMetrics[]): string | null => {
  if (categoryMetrics.length === 0) return null;

  const sorted = [...categoryMetrics]
    .filter(metric => metric.workouts > 0)
    .sort((a, b) => a.percentage - b.percentage);

  return sorted[0]?.category || null;
};

/**
 * Calcula el análisis completo por categorías
 */
export const calculateCategoryAnalysis = (records: WorkoutRecord[], allAssignments?: ExerciseAssignment[]): CategoryAnalysis => {
  const categoryMetrics = calculateCategoryMetrics(records, allAssignments);
  const muscleBalance = analyzeMuscleBalance(records, allAssignments);
  const balanceScore = calculateBalanceScore(muscleBalance, records);
  const dominantCategory = findDominantCategory(categoryMetrics);
  const leastTrainedCategory = findLeastTrainedCategory(categoryMetrics);

  return {
    categoryMetrics,
    muscleBalance,
    dominantCategory,
    leastTrainedCategory,
    balanceScore
  };
};

/**
 * Analiza tendencias de progreso básico
 */

/**
 * Calcula las métricas de categorías para un período reciente
 * @param records - Todos los registros de entrenamiento
 * @param weeksToConsider - Número de semanas a considerar (default: 8)
 * @returns Array de métricas por categoría basado en período reciente
 */
export const calculateRecentCategoryMetrics = (
  records: WorkoutRecord[],
  weeksToConsider: number = 8
): CategoryMetrics[] => {
  // Filtrar solo registros de las últimas N semanas
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - (weeksToConsider * 7));

  const recentRecords = records.filter(r => new Date(r.date) >= cutoffDate);

  // Si no hay registros recientes, devolver array vacío
  if (recentRecords.length === 0) {
    return [];
  }

  // Usar la función existente con los registros filtrados
  return calculateCategoryMetrics(recentRecords);
};

/**
 * Función utilitaria para obtener asignaciones y pasarlas a las funciones de análisis
 * Esta función debe ser llamada desde los componentes que usan el análisis de categorías
 */
export const getAssignmentsForAnalysis = async (): Promise<ExerciseAssignment[]> => {
  try {
    // Importar dinámicamente para evitar dependencias circulares
    const { getAllAssignments } = await import('@/api/services');
    return await getAllAssignments();
  } catch (error) {
    console.error('Error obteniendo asignaciones para análisis:', error);
    return [];
  }
};

/**
 * Wrapper para calculateCategoryAnalysis que obtiene automáticamente las asignaciones
 */
export const calculateCategoryAnalysisWithAssignments = async (records: WorkoutRecord[]): Promise<CategoryAnalysis> => {
  const allAssignments = await getAssignmentsForAnalysis();
  return calculateCategoryAnalysis(records, allAssignments);
};

/**
 * Wrapper para calculateCategoryMetrics que obtiene automáticamente las asignaciones
 */
export const calculateCategoryMetricsWithAssignments = async (records: WorkoutRecord[]): Promise<CategoryMetrics[]> => {
  const allAssignments = await getAssignmentsForAnalysis();
  return calculateCategoryMetrics(records, allAssignments);
};

/**
 * Wrapper para analyzeMuscleBalance que obtiene automáticamente las asignaciones
 */
export const analyzeMuscleBalanceWithAssignments = async (records: WorkoutRecord[]): Promise<MuscleBalance[]> => {
  const allAssignments = await getAssignmentsForAnalysis();
  return analyzeMuscleBalance(records, allAssignments);
};