import type { CategoryAnalysisData, MuscleBalanceData, UpperLowerBalanceData } from '@/interfaces';

// Constantes para meta-categorías
export const META_CATEGORIES = {
  UPPER_BODY: {
    id: 'upper_body',
    name: 'Tren Superior',
    categories: ['Pecho', 'Espalda', 'Hombros', 'Brazos'],
    idealPercentage: 60,
    color: '#3B82F6',
  },
  LOWER_BODY: {
    id: 'lower_body',
    name: 'Tren Inferior',
    categories: ['Piernas', 'Glúteos'],
    idealPercentage: 35,
    color: '#10B981',
  },
  CORE: {
    id: 'core',
    name: 'Core',
    categories: ['Core'],
    idealPercentage: 5,
    color: '#8B5CF6',
  },
};

// Tipos para datos procesados
export interface ProcessedUserData {
  weeklyWorkouts: Map<string, Set<string>>;
  exerciseMaxWeights: Map<string, number>;
  exerciseVolumes: Map<string, number>;
  lastWorkoutByCategory: Map<string, Date>;
  personalRecordsByCategory: Map<string, number>;
  totalVolume: number;
  totalWorkouts: number;
}

export interface WeeklyData {
  weekStart: string;
  volume: number;
  workouts: number;
  exercises: string[];
}

export interface CategoryWeeklyData {
  category: string;
  weeklyData: WeeklyData[];
  lastWeekVolume: number;
  currentWeekVolume: number;
  changePercent: number;
  lastWorkout: Date | null;
  personalRecords: number;
  daysSinceLastWorkout: number;
}

export interface CategoryMetric {
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
}

export interface BalanceAnalysisResult {
  balanceScore: number;
  finalConsistency: number;
  avgIntensity: number;
  avgFrequency: number;
  muscleBalance: MuscleBalanceData[];
  categoryAnalysis: CategoryAnalysisData;
  upperLowerBalance: UpperLowerBalanceData;
  selectedView: 'general' | 'balanceByGroup' | 'upperLower' | 'trends';
  error?: {
    message: string;
    timestamp: string;
  };
}
