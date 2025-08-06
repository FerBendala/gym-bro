/**
 * Interfaz para los datos de exportación enfocados en análisis específico
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
  // 1. Días de la semana que se entrenan con sus ejercicios y volúmenes
  trainingDays: TrainingDayData[];
  // 2. Ejercicios con peso por sesión (evolución) y volumen total
  exercisesEvolution: ExerciseEvolutionData[];
  // 3. Porcentajes por grupo muscular definidos y realmente hechos
  muscleGroupAnalysis: MuscleGroupAnalysisData;
  // 4. Balance General de Rendimiento
  performanceBalance: PerformanceBalanceData;
}

/**
 * 1. Días de la semana que se entrenan con sus ejercicios y volúmenes
 */
export interface TrainingDayData {
  dayOfWeek: string;
  dayName: string; // Nombre en español
  totalWorkouts: number;
  totalVolume: number;
  exercises: {
    exerciseName: string;
    categories: string[];
    totalVolume: number;
    workoutCount: number;
    averageWeight: number;
    maxWeight: number;
    lastWorkout: string;
  }[];
  muscleGroups: {
    group: string;
    volume: number;
    percentage: number;
  }[];
}

/**
 * 2. Ejercicios con peso por sesión (evolución) y volumen total
 */
export interface ExerciseEvolutionData {
  exerciseName: string;
  categories: string[];
  totalVolume: number;
  totalWorkouts: number;
  sessions: {
    date: string;
    weight: number;
    reps: number;
    sets: number;
    volume: number;
    estimated1RM: number;
    weekNumber: number;
  }[];
  evolution: {
    firstWeight: number;
    lastWeight: number;
    maxWeight: number;
    progressPercentage: number;
    averageWeight: number;
    weightProgression: {
      week: number;
      averageWeight: number;
      maxWeight: number;
    }[];
  };
}

/**
 * 3. Porcentajes por grupo muscular definidos y realmente hechos
 */
export interface MuscleGroupAnalysisData {
  totalVolume: number;
  definedPercentages: {
    group: string;
    targetPercentage: number;
  }[];
  actualPercentages: {
    group: string;
    actualVolume: number;
    actualPercentage: number;
    workoutCount: number;
  }[];
  comparison: {
    group: string;
    targetPercentage: number;
    actualPercentage: number;
    difference: number;
    status: 'above' | 'below' | 'balanced';
  }[];
  recommendations: {
    group: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

/**
 * 4. Balance General de Rendimiento
 */
export interface PerformanceBalanceData {
  overall: {
    totalVolume: number;
    totalWorkouts: number;
    averageVolumePerWorkout: number;
    consistencyScore: number;
    strengthProgress: number;
    volumeProgress: number;
  };
  strengthMetrics: {
    totalExercises: number;
    exercisesWithProgress: number;
    averageProgressPercentage: number;
    topImprovements: {
      exerciseName: string;
      progressPercentage: number;
      weightGain: number;
    }[];
  };
  volumeMetrics: {
    weeklyAverage: number;
    monthlyTrend: 'increasing' | 'decreasing' | 'stable';
    volumeDistribution: {
      category: string;
      volume: number;
      percentage: number;
    }[];
  };
  balanceScore: {
    score: number; // 0-100
    level: 'excellent' | 'good' | 'fair' | 'needs_improvement';
    description: string;
    recommendations: string[];
  };
}
