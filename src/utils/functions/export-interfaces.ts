/**
 * Interfaz para los datos de exportación completos
 */
export interface ExportData {
  metadata: {
    exportDate: string;
    totalExercises: number;
    totalWorkouts: number;
    totalVolume: number;
    dateRange: {
      from: string;
      to: string;
    };
    appVersion: string;
  };
  exercises: ExerciseExportData[];
  workoutRecords: WorkoutRecordExportData[];
  exercisesByDay: ExercisesByDayData[];
  volumeAnalysis: VolumeAnalysisData;
  weeklyData: WeeklyVolumeData[];
  categoryMetrics: CategoryMetricsExportData[];
  monthlyStats: MonthlyStatsData[];
  progressSummary: ProgressSummaryData;
}

export interface ExerciseExportData {
  id: string;
  name: string;
  categories: string[];
  description?: string;
  url?: string;
  totalWorkouts: number;
  totalVolume: number;
  averageWeight: number;
  maxWeight: number;
  lastWorkout: string;
  progressPercentage: number;
}

export interface WorkoutRecordExportData {
  id: string;
  exerciseName: string;
  exerciseCategories: string[];
  weight: number;
  reps: number;
  sets: number;
  volume: number;
  date: string;
  dayOfWeek: string;
  estimated1RM: number;
  individualSets?: Array<{ weight: number; reps: number; volume: number }>;
}

export interface ExercisesByDayData {
  dayOfWeek: string;
  exercises: Array<{
    exerciseName: string;
    categories: string[];
    frequency: number;
    averageVolume: number;
    totalVolume: number;
  }>;
  totalVolume: number;
  averageVolume: number;
  workoutCount: number;
}

export interface VolumeAnalysisData {
  totalVolume: number;
  volumeByCategory: Array<{
    category: string;
    volume: number;
    percentage: number;
    averagePerWorkout: number;
  }>;
  volumeByExercise: Array<{
    exerciseName: string;
    volume: number;
    percentage: number;
    averagePerWorkout: number;
    categories: string[];
  }>;
}

export interface WeeklyVolumeData {
  weekStart: string;
  weekEnd: string;
  totalVolume: number;
  workoutCount: number;
  averageVolumePerWorkout: number;
  uniqueExercises: number;
  categoryBreakdown: Array<{
    category: string;
    volume: number;
    percentage: number;
  }>;
}

export interface CategoryMetricsExportData {
  category: string;
  totalVolume: number;
  percentage: number;
  workouts: number;
  averageWeight: number;
  maxWeight: number;
  weeklyFrequency: number;
  trend: string;
  progressPercentage: number;
  recommendations: string[];
}

export interface MonthlyStatsData {
  month: string;
  year: number;
  totalVolume: number;
  workoutCount: number;
  uniqueExercises: number;
  averageVolumePerWorkout: number;
  strongestCategory: string;
  improvementAreas: string[];
}

export interface ProgressSummaryData {
  overallProgress: number;
  strengthGains: number;
  volumeIncrease: number;
  consistencyScore: number;
  topPerformingCategories: string[];
  areasForImprovement: string[];
  personalRecords: Array<{
    exerciseName: string;
    weight: number;
    date: string;
    estimated1RM: number;
  }>;
} 