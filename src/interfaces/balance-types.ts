import type { MuscleBalance } from '@/utils/functions/category-analysis-types';

/**
 * Interface para los datos de balance muscular
 */
export interface MuscleBalanceData extends MuscleBalance {
  // Extendemos la interfaz base con propiedades adicionales específicas del componente
  totalVolume: number; // Agregar esta propiedad para compatibilidad
  personalRecords: Array<{
    id: string;
    weight: number;
    reps: number;
    date: Date;
    exerciseId: string;
  }>;
  balanceHistory: {
    trend: 'improving' | 'stable' | 'declining';
    consistency: number;
    volatility: number;
    weeklyData: Array<{
      week: string;
      volume: number;
      percentage: number;
    }>;
    // Propiedades requeridas por BalanceHistory
    lastWeekVolume: number;
    currentWeekVolume: number;
    changePercent: number;
  };
}

/**
 * Interface para el análisis de categorías compatible con el dashboard
 */
export interface CategoryAnalysisData {
  categoryMetrics: Array<{
    category: string;
    percentage: number;
    totalVolume: number;
    workouts: number;
    avgWeight: number;
    maxWeight: number;
    minWeight: number;
    avgWorkoutsPerWeek: number;
    avgSets: number;
    avgReps: number;
    estimatedOneRM: number;
    weightProgression: number;
    volumeProgression: number;
    intensityScore: number;
    efficiencyScore: number;
    consistencyScore: number;
    lastWorkout: Date | null;
    totalSets: number;
    totalReps: number;
    personalRecords: number;
    daysSinceLastWorkout: number;
    trend: 'improving' | 'stable' | 'declining';
    strengthLevel: 'beginner' | 'intermediate' | 'advanced';
    recentImprovement: boolean;
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
    // Propiedades requeridas por CategoryMetric
    volumeTrend: number;
    frequency: number;
    intensity: number;
  }>;
  overallBalance: number;
  recommendations: string[];
}

/**
 * Interface para el balance tren superior vs inferior
 */
export interface UpperLowerBalanceData {
  upperBody: {
    percentage: number;
    volume: number;
    categories: string[];
  };
  lowerBody: {
    percentage: number;
    volume: number;
    categories: string[];
  };
  core: {
    percentage: number;
    volume: number;
    categories: string[];
  };
  isBalanced: boolean;
  recommendation: string;
}