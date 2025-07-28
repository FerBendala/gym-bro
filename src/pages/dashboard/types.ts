
// Tipos para el balance por grupo
export interface PersonalRecord {
  id: string;
  weight: number;
  reps: number;
  date: Date;
  exerciseId: string;
}

export interface BalanceHistory {
  trend: 'improving' | 'declining' | 'stable';
  lastWeekVolume: number;
  currentWeekVolume: number;
  changePercent: number;
}

export interface MuscleBalanceItem {
  category: string;
  percentage: number;
  totalVolume: number;
  idealPercentage: number;
  volume?: number;
  intensityScore?: number;
  weeklyFrequency?: number;
  isBalanced?: boolean;
  priorityLevel?: string;
  progressTrend?: string;
  personalRecords?: PersonalRecord[];
  balanceHistory?: BalanceHistory;
}

export interface CategoryMetric {
  category: string;
  weightProgression: number;
  personalRecords: number;
  volumeTrend: number;
  frequency: number;
  intensity: number;
}

export interface CategoryAnalysis {
  categoryMetrics: CategoryMetric[];
  overallBalance: number;
  recommendations: string[];
}

// Tipos para el análisis de tendencias
export interface DayIcon {
  [key: string]: React.ComponentType<{ className?: string }>;
}

// Tipos para el hook de dashboard
export interface DashboardError {
  message: string;
  code?: string;
  details?: unknown;
} 