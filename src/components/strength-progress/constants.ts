export const STRENGTH_PROGRESS_CONSTANTS = {
  EMPTY_STATE: {
    title: 'Sin datos de fuerza',
    description: 'Registra entrenamientos para ver tu análisis avanzado de progreso de fuerza',
    icon: 'TrendingUp'
  },
  HEADER: {
    title: 'Análisis Avanzado de Progreso de Fuerza',
    description: 'Evaluación comprehensiva de tu desarrollo de fuerza y recomendaciones'
  },
  METRICS: {
    MAX_1RM: '1RM Máximo',
    PROGRESS_RATE: 'Velocidad de Progreso',
    CONSISTENCY: 'Consistencia',
    PREDICTION_CONFIDENCE: 'Confianza Predicción'
  },
  SECTIONS: {
    GENERAL_PROGRESS: 'Progreso General',
    PREDICTIONS: 'Predicciones',
    CONSISTENCY_ANALYSIS: 'Análisis de Consistencia',
    TRAINING_RECOMMENDATIONS: 'Recomendaciones de Entrenamiento',
    REP_RANGE_ANALYSIS: 'Análisis por Rangos de Repeticiones',
    QUALITY_METRICS: 'Métricas de Calidad'
  }
} as const;

export const PHASE_COLORS = {
  elite: 'text-purple-400 bg-purple-900/20',
  advanced: 'text-orange-400 bg-orange-900/20',
  intermediate: 'text-blue-400 bg-blue-900/20',
  novice: 'text-green-400 bg-green-900/20'
} as const;

export const RATE_COLORS = {
  exceptional: 'text-purple-400',
  fast: 'text-green-400',
  moderate: 'text-blue-400',
  slow: 'text-gray-400'
} as const;

export const ZONE_COLORS = {
  deload: 'text-orange-400 bg-orange-900/20',
  peaking: 'text-purple-400 bg-purple-900/20',
  intensity: 'text-red-400 bg-red-900/20',
  volume: 'text-blue-400 bg-blue-900/20'
} as const; 