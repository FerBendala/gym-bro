
/**
 * Parejas de grupos musculares antagonistas
 */
export const ANTAGONIST_PAIRS: Record<string, string> = {
  'Pecho': 'Espalda',
  'Espalda': 'Pecho',
  'Brazos': 'Piernas', // Simplificado
  'Piernas': 'Brazos',
  'Hombros': 'Core',
  'Core': 'Hombros',
};

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

export interface CategoryAnalysis {
  categoryMetrics: CategoryMetrics[];
  muscleBalance: MuscleBalance[];
  dominantCategory: string | null;
  leastTrainedCategory: string | null;
  balanceScore: number; // 0-100, donde 100 es perfectamente balanceado
}
