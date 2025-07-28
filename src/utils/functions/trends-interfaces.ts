/**
 * Interfaz para métricas por día de la semana mejorada
 */
export interface DayMetrics {
  dayName: string;
  dayIndex: number;
  workouts: number;
  avgVolume: number;
  totalVolume: number;
  percentage: number;
  mostFrequentTime: string | null;
  // Nuevas métricas
  maxWeight: number;
  avgWeight: number;
  uniqueExercises: number;
  avgReps: number;
  avgSets: number;
  totalSets: number;
  consistency: number; // Score de consistencia para este día
  trend: number; // Cambio vs semanas anteriores
  performanceScore: number; // Score combinado 0-100
  topExercise: string; // Ejercicio más frecuente
  efficiency: number; // Volumen por entrenamiento
  intensity: number; // Peso promedio relativo
  recommendations: string[];
}

/**
 * Interfaz para tendencias temporales mejorada
 */
export interface TemporalTrend {
  period: string;
  fullDate: string;
  workouts: number;
  volume: number;
  avgWeight: number;
  maxWeight: number;
  weekNumber: number;
  // Nuevas métricas
  volumeChange: number; // Cambio vs semana anterior
  volumeChangePercent: number; // Cambio porcentual
  workoutChange: number; // Cambio en número de entrenamientos
  consistency: number; // Consistencia dentro de la semana
  momentum: 'Creciente' | 'Estable' | 'Decreciente'; // Tendencia general
  performanceScore: number; // Score combinado 0-100
  uniqueExercises: number; // Variedad de ejercicios
  avgReps: number; // Repeticiones promedio
  avgSets: number; // Series promedio
  totalSets: number; // Total de series
  weeklyStrength: number; // Fuerza promedio de la semana
}

/**
 * Interfaz para análisis de evolución temporal
 */
export interface TemporalEvolution {
  trends: TemporalTrend[];
  overallTrend: 'Mejorando' | 'Estable' | 'Declinando';
  growthRate: number; // Tasa de crecimiento semanal
  volatility: number; // Volatilidad del rendimiento
  predictions: {
    nextWeekVolume: number;
    nextWeekWorkouts: number;
    confidence: number;
    trend: 'Alcista' | 'Bajista' | 'Lateral';
  };
  cycles: {
    hasWeeklyCycle: boolean;
    peakDay: string;
    lowDay: string;
    cyclePeriod: number;
  };
  milestones: {
    bestWeek: TemporalTrend | null;
    worstWeek: TemporalTrend | null;
    mostConsistentWeek: TemporalTrend | null;
    biggestImprovement: TemporalTrend | null;
  };
  periodComparisons: {
    last4Weeks: { volume: number; workouts: number; avgWeight: number };
    previous4Weeks: { volume: number; workouts: number; avgWeight: number };
    improvement: { volume: number; workouts: number; avgWeight: number };
  };
  insights: string[];
  warnings: string[];
}

/**
 * Interfaz para hábitos de entrenamiento mejorada
 */
export interface WorkoutHabits {
  preferredDay: string;
  preferredTime: string;
  avgSessionDuration: number; // Estimado en minutos
  consistencyScore: number; // 0-100
  peakProductivityHours: string[];
  restDayPattern: string;
  // Nuevas métricas
  weeklyFrequency: number; // Entrenamientos por semana
  habitStrength: 'Muy Débil' | 'Débil' | 'Moderado' | 'Fuerte' | 'Muy Fuerte';
  scheduleFlexibility: 'Muy Rígido' | 'Rígido' | 'Flexible' | 'Muy Flexible';
  motivationPattern: 'Inconsistente' | 'Creciente' | 'Estable' | 'Decreciente';
  bestPerformanceDay: string;
  bestPerformanceTime: string;
  workoutStreaks: {
    current: number; // Días consecutivos actual
    longest: number; // Racha más larga
    average: number; // Promedio de rachas
  };
  behaviorInsights: string[];
  recommendations: string[];
  riskFactors: string[];
}

/**
 * Interfaz para análisis completo de tendencias
 */
export interface TrendsAnalysis {
  dayMetrics: DayMetrics[];
  dayMetricsOrdered: DayMetrics[]; // Ordenado Lunes a Domingo
  temporalTrends: TemporalTrend[];
  temporalEvolution: TemporalEvolution;
  workoutHabits: WorkoutHabits;
  volumeTrendByDay: { day: string; trend: number }[];
  bestPerformancePeriod: string;
} 