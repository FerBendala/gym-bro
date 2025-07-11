import { differenceInDays, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, subMonths, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { EXERCISE_CATEGORIES, IDEAL_VOLUME_DISTRIBUTION, calculateCategoryEffortDistribution } from '../../constants/exercise-categories';
import type { WorkoutRecord } from '../../interfaces';

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
 * Corregido: maneja pocas semanas agrupando por semanas, no por entrenamientos individuales
 */
const calculateWeightProgression = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length < 2) return 0;

  const sortedRecords = [...categoryRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Agrupar por semanas para detectar cuántas semanas de datos tenemos
  const weeklyData = new Map<string, WorkoutRecord[]>();

  categoryRecords.forEach(record => {
    const date = new Date(record.date);
    const monday = new Date(date);
    monday.setDate(date.getDate() - date.getDay() + 1);
    const weekKey = monday.toISOString().split('T')[0];

    if (!weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, []);
    }
    weeklyData.get(weekKey)!.push(record);
  });

  const weeksWithData = weeklyData.size;

  // Si tenemos 3 semanas o menos, comparar promedio semanal entre primera y última semana
  if (weeksWithData <= 3) {
    // Con solo 1 semana, no hay progresión
    if (weeksWithData === 1) return 0;

    // Convertir a array ordenado por fecha
    const weeklyArray = Array.from(weeklyData.entries())
      .sort(([weekA], [weekB]) => weekA.localeCompare(weekB));

    // Calcular 1RM promedio de la primera semana
    const firstWeekRecords = weeklyArray[0][1];
    const firstWeekAvg1RM = firstWeekRecords.reduce((sum, r) => {
      const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
      return sum + oneRM;
    }, 0) / firstWeekRecords.length;

    // Calcular 1RM promedio de la última semana
    const lastWeekRecords = weeklyArray[weeklyArray.length - 1][1];
    const lastWeekAvg1RM = lastWeekRecords.reduce((sum, r) => {
      const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
      return sum + oneRM;
    }, 0) / lastWeekRecords.length;

    if (firstWeekAvg1RM === 0) return 0;

    return Math.round(((lastWeekAvg1RM - firstWeekAvg1RM) / firstWeekAvg1RM) * 100);
  }

  // Para usuarios con más semanas de datos, usar la lógica original de primera mitad vs segunda mitad
  const midpoint = Math.floor(sortedRecords.length / 2);
  const firstHalf = sortedRecords.slice(0, midpoint);
  const secondHalf = sortedRecords.slice(midpoint);

  if (firstHalf.length === 0 || secondHalf.length === 0) return 0;

  // Usar 1RM estimado SIEMPRE para precisión y consistencia
  const firstHalfAvg1RM = firstHalf.reduce((sum, r) => {
    const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
    return sum + oneRM;
  }, 0) / firstHalf.length;

  const secondHalfAvg1RM = secondHalf.reduce((sum, r) => {
    const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
    return sum + oneRM;
  }, 0) / secondHalf.length;

  if (firstHalfAvg1RM === 0) return 0;

  return Math.round(((secondHalfAvg1RM - firstHalfAvg1RM) / firstHalfAvg1RM) * 100);
};

/**
 * Calcula la progresión de volumen para una categoría
 */
const calculateVolumeProgression = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length < 2) return 0;

  // Agrupar por semanas para detectar cuántas semanas de datos tenemos
  const weeklyData = new Map<string, WorkoutRecord[]>();

  categoryRecords.forEach(record => {
    const date = new Date(record.date);
    const monday = new Date(date);
    monday.setDate(date.getDate() - date.getDay() + 1);
    const weekKey = monday.toISOString().split('T')[0];

    if (!weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, []);
    }
    weeklyData.get(weekKey)!.push(record);
  });

  const weeksWithData = weeklyData.size;

  // Si tenemos 3 semanas o menos, comparar primera mitad vs segunda mitad de registros
  if (weeksWithData <= 3) {
    const sortedRecords = [...categoryRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const midpoint = Math.floor(sortedRecords.length / 2);
    const firstHalf = sortedRecords.slice(0, midpoint);
    const secondHalf = sortedRecords.slice(midpoint);

    if (firstHalf.length === 0 || secondHalf.length === 0) return 0;

    const firstHalfVolume = firstHalf.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
    const secondHalfVolume = secondHalf.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

    if (firstHalfVolume === 0) return 0;

    return Math.round(((secondHalfVolume - firstHalfVolume) / firstHalfVolume) * 100);
  }

  // Para usuarios con más semanas de datos, usar la lógica original
  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
  const fourWeeksAgo = new Date(now.getTime() - (28 * 24 * 60 * 60 * 1000));

  const recentRecords = categoryRecords.filter(r => new Date(r.date) >= twoWeeksAgo);
  const olderRecords = categoryRecords.filter(r => {
    const date = new Date(r.date);
    return date >= fourWeeksAgo && date < twoWeeksAgo;
  });

  if (recentRecords.length === 0 || olderRecords.length === 0) return 0;

  const recentVolume = recentRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const olderVolume = olderRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

  if (olderVolume === 0) return 0;

  return Math.round(((recentVolume - olderVolume) / olderVolume) * 100);
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
 */
const calculateRegularityScore = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length < 3) return 50; // Score neutral para pocos datos

  const sortedRecords = [...categoryRecords].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

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

  // Mejorado: No penalizar patrones sistemáticos
  // Si el CV es bajo (< 0.3), es un patrón regular = buena puntuación
  if (coefficientOfVariation < 0.3) {
    return Math.min(100, 90 + (10 * (0.3 - coefficientOfVariation) / 0.3));
  }

  // Para mayor variabilidad, reducir puntuación gradualmente
  const regularityScore = Math.max(20, 90 - (coefficientOfVariation * 100));
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
 */
const calculateVolumeDistribution = (categoryRecords: WorkoutRecord[], allRecords?: WorkoutRecord[]): {
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
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

  return {
    thisWeek: thisWeekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0),
    lastWeek: lastWeekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0),
    thisMonth: thisMonthRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0),
    lastMonth: lastMonthRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0)
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
export const calculateCategoryMetrics = (records: WorkoutRecord[]): CategoryMetrics[] => {
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

    // Calcular promedio de días únicos por semana solo para semanas con entrenamientos
    const avgWorkoutsPerWeek = weeklyData.size > 0
      ? Array.from(weeklyData.values()).reduce((sum, daysSet) => sum + daysSet.size, 0) / weeklyData.size
      : 0;

    const lastWorkout = new Date(Math.max(...dates.map(d => d.getTime())));

    // Usar porcentaje de volumen relativo al esfuerzo
    const percentage = totalVolume > 0 ? (categoryVolume / totalVolume) * 100 : 0;

    // Calcular métricas avanzadas
    const personalRecords = calculatePersonalRecords(categoryRecords);
    const estimatedOneRM = categoryRecords.length > 0 ?
      Math.max(...categoryRecords.map(r => r.weight * (1 + Math.min(r.reps, 20) / 30))) : 0;

    const weightProgression = calculateWeightProgression(categoryRecords);
    const volumeProgression = calculateVolumeProgression(categoryRecords);
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

    // Con pocas semanas (≤3), ser más conservador - requiere cambios más grandes para detectar tendencia
    if (weeksWithData <= 3) {
      if (weightProgression > 10 || volumeProgression > 15) trend = 'improving';
      else if (weightProgression < -15 || volumeProgression < -20) trend = 'declining';
      // De lo contrario, mantener como 'stable' para evitar falsos negativos
    } else {
      // Con más datos, usar thresholds normales
      if (weightProgression > 5 || volumeProgression > 5) trend = 'improving';
      else if (weightProgression < -5 || volumeProgression < -5) trend = 'declining';
    }

    const strengthLevel = determineStrengthLevel(estimatedOneRM, category);

    // Pasar todos los records como segundo parámetro para cálculo correcto de fechas
    const volumeDistribution = calculateVolumeDistribution(categoryRecords, records);

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
      performanceMetrics
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
 * Analiza la tendencia de progreso para un grupo muscular
 * Corregido para usar 1RM estimado consistentemente
 */
const analyzeProgressTrend = (categoryRecords: WorkoutRecord[]): {
  trend: 'improving' | 'stable' | 'declining';
  lastImprovement: Date | null;
} => {
  if (categoryRecords.length < 4) {
    return { trend: 'stable', lastImprovement: null };
  }

  // Ordenar por fecha
  const sortedRecords = [...categoryRecords].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Usar primera mitad vs segunda mitad para máxima precisión temporal
  const midpoint = Math.floor(sortedRecords.length / 2);
  const firstHalf = sortedRecords.slice(0, midpoint);
  const secondHalf = sortedRecords.slice(midpoint);

  if (firstHalf.length === 0 || secondHalf.length === 0) {
    return { trend: 'stable', lastImprovement: null };
  }

  // Calcular 1RM promedio para cada mitad - CORREGIDO
  const firstHalfAvg1RM = firstHalf.reduce((sum, r) => {
    const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
    return sum + oneRM;
  }, 0) / firstHalf.length;

  const secondHalfAvg1RM = secondHalf.reduce((sum, r) => {
    const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
    return sum + oneRM;
  }, 0) / secondHalf.length;

  const improvement = firstHalfAvg1RM > 0 ? ((secondHalfAvg1RM - firstHalfAvg1RM) / firstHalfAvg1RM) * 100 : 0;

  let trend: 'improving' | 'stable' | 'declining';
  if (improvement > 5) trend = 'improving';
  else if (improvement < -5) trend = 'declining';
  else trend = 'stable';

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
const analyzeBalanceHistory = (categoryRecords: WorkoutRecord[], allRecords?: WorkoutRecord[]): {
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

    if (weeklyBalanceData.length >= 3) {
      // Analizar tendencia de balance (se acerca o aleja del ideal)
      const idealPercentage = IDEAL_VOLUME_DISTRIBUTION[categoryRecords[0]?.exercise?.categories?.[0] || ''] || 15;
      const trendTowardsIdeal = analyzeTrendTowardsIdeal(weeklyBalanceData, idealPercentage);

      let trend: 'improving' | 'stable' | 'declining';
      if (trendTowardsIdeal > 0.1) trend = 'improving';
      else if (trendTowardsIdeal < -0.1) trend = 'declining';
      else trend = 'stable';

      // Calcular volatilidad del balance (variabilidad en porcentajes semanales)
      const percentages = weeklyBalanceData.map(w => w.percentage);
      const avgPercentage = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
      const variance = percentages.reduce((sum, p) => sum + Math.pow(p - avgPercentage, 2), 0) / percentages.length;
      const volatility = avgPercentage > 0 ? Math.round((Math.sqrt(variance) / avgPercentage) * 100) : 0;

      return {
        trend,
        consistency: balanceConsistency,
        volatility: Math.min(100, volatility)
      };
    }
  }

  // Fallback: usar análisis de progresión de fuerza si no hay suficientes datos de balance
  const sortedRecords = [...categoryRecords].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Analizar 1RM promedio por período para detectar tendencia de progreso
  const midpoint = Math.floor(sortedRecords.length / 2);
  const firstHalf = sortedRecords.slice(0, midpoint);
  const secondHalf = sortedRecords.slice(midpoint);

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
  if (trendChange > 5) trend = 'improving';
  else if (trendChange < -5) trend = 'declining';
  else trend = 'stable';

  // Calcular consistencia de progreso (no de balance, pero mejor que nada)
  const oneRMs = sortedRecords.map(r => r.weight * (1 + Math.min(r.reps, 20) / 30));
  const mean = oneRMs.reduce((sum, v) => sum + v, 0) / oneRMs.length;
  const variance = oneRMs.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / oneRMs.length;
  const stdDev = Math.sqrt(variance);
  const consistency = mean > 0 ? Math.max(0, 100 - ((stdDev / mean) * 100)) : 0;

  // Calcular volatilidad
  const volatility = mean > 0 ? (stdDev / mean) * 100 : 0;

  return {
    trend,
    consistency: Math.round(consistency),
    volatility: Math.round(Math.min(100, volatility))
  };
};

/**
 * Genera recomendaciones específicas para un grupo muscular
 */
const generateSpecificRecommendations = (
  category: string,
  balance: Partial<MuscleBalance>,
  categoryMetrics: CategoryMetrics[]
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

  // Recomendaciones por frecuencia
  if (balance.weeklyFrequency && balance.weeklyFrequency < 2) {
    recommendations.push(`Aumentar frecuencia a 2-3 sesiones por semana`);
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
        if (imbalanceAnalysis.type === 'too_much') {
          warnings.push(`Se entrena demasiado ${category.toLowerCase()} en comparación con ${antagonist.toLowerCase()}`);
        } else if (imbalanceAnalysis.type === 'too_little') {
          warnings.push(`Se entrena muy poco ${category.toLowerCase()} en comparación con ${antagonist.toLowerCase()}`);
        }
      }
    }
  }

  if (balance.balanceHistory?.volatility && balance.balanceHistory.volatility > 50) {
    warnings.push(`Alta volatilidad en entrenamiento de ${category.toLowerCase()}`);
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
export const analyzeMuscleBalance = (records: WorkoutRecord[]): MuscleBalance[] => {
  if (records.length === 0) return [];

  const categoryMetrics = calculateCategoryMetrics(records);
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
    const balanceMargin = 5 + (15 * (1 - temporalAdjustmentFactor)); // Margen más amplio con menos datos
    const isBalanced = Math.abs(deviation) <= balanceMargin;

    // Obtener registros específicos para esta categoría
    const categoryRecords = recordsByCategory[metric.category] || [];

    // Calcular métricas avanzadas con ajustes
    const rawSymmetryScore = calculateSymmetryScore(metric.category, categoryRecords);
    const symmetryScore = adjustMetricsForLimitedData(rawSymmetryScore, temporalAdjustmentFactor, 'score');

    const antagonistRatio = calculateAntagonistRatio(metric.category, categoryMetrics);

    const rawStrengthIndex = calculateStrengthIndex(categoryRecords);
    const strengthIndex = adjustMetricsForLimitedData(rawStrengthIndex, temporalAdjustmentFactor, 'score');

    const progressAnalysis = analyzeProgressTrend(categoryRecords);

    const intensityScore = calculateIntensityScore(categoryRecords);

    const balanceHistory = analyzeBalanceHistory(categoryRecords, records);
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
    const specificRecommendations = generateSpecificRecommendations(metric.category, balanceData, categoryMetrics);
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
export const calculateCategoryAnalysis = (records: WorkoutRecord[]): CategoryAnalysis => {
  const categoryMetrics = calculateCategoryMetrics(records);
  const muscleBalance = analyzeMuscleBalance(records);
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