// ========================================
// CONSTANTES PARA CÁLCULOS DE PREDICCIÓN
// ========================================

/** Constantes para cálculos de 1RM */
export const ONE_RM_CONSTANTS = {
  /** Factor Epley para cálculo de 1RM: peso * (1 + reps/30) */
  EPLEY_FACTOR: 30,
  /** Factor Brzycki A: 1.0278 */
  BRZYCKI_A: 1.0278,
  /** Factor Brzycki B: 0.0278 */
  BRZYCKI_B: 0.0278,
  /** Máximo número de repeticiones para cálculo confiable de 1RM */
  MAX_REPS_FOR_1RM: 20,
} as const;

/** Constantes temporales */
export const TIME_CONSTANTS = {
  /** Semanas por mes (52 semanas / 12 meses) */
  WEEKS_PER_MONTH: 52 / 12,
  /** Días por semana */
  DAYS_PER_WEEK: 7,
  /** Milisegundos por día */
  MS_PER_DAY: 1000 * 60 * 60 * 24,
  /** Días mínimos para análisis temporal */
  MIN_DAYS_FOR_ANALYSIS: 14,
  /** Entrenamientos mínimos para predicciones confiables */
  MIN_WORKOUTS_FOR_PREDICTIONS: 6,
} as const;

/** Constantes para validación de progreso */
export const PROGRESS_CONSTANTS = {
  /** Umbral mínimo para considerar un PR (2.5%) */
  PR_THRESHOLD_PERCENT: 0.025,
  /** Máximo crecimiento semanal realista en kg */
  MAX_WEEKLY_STRENGTH_GAIN: 2,
  /** Máximo crecimiento mensual realista en kg */
  MAX_MONTHLY_GROWTH: 8,
  /** Máximo cambio de volumen semanal en kg */
  MAX_WEEKLY_VOLUME_CHANGE: 100,
  /** Porcentaje máximo de incremento de peso en 2 semanas (seguridad) */
  MAX_SAFE_WEIGHT_INCREASE_2WEEKS: 20,
} as const;

/** Constantes para niveles de experiencia */
export const EXPERIENCE_CONSTANTS = {
  /** Umbral de entrenamientos para principiante */
  BEGINNER_WORKOUT_THRESHOLD: 10,
  /** Umbral de entrenamientos para intermedio */
  INTERMEDIATE_WORKOUT_THRESHOLD: 30,
  /** Umbral de semanas para principiante */
  BEGINNER_WEEKS_THRESHOLD: 12,
  /** Umbral de semanas para intermedio */
  INTERMEDIATE_WEEKS_THRESHOLD: 52,
  /** Peso máximo umbral para principiante */
  BEGINNER_WEIGHT_THRESHOLD: 40,
  /** Peso máximo umbral para intermedio */
  INTERMEDIATE_WEIGHT_THRESHOLD: 80,
  /** Variedad de ejercicios umbral para principiante */
  BEGINNER_EXERCISE_VARIETY: 5,
  /** Variedad de ejercicios umbral para intermedio */
  INTERMEDIATE_EXERCISE_VARIETY: 12,
} as const;

/** Constantes para cálculos de confianza */
export const CONFIDENCE_CONSTANTS = {
  /** Confianza base mínima */
  BASE_CONFIDENCE_MIN: 10 as number,
  /** Confianza base máxima */
  BASE_CONFIDENCE_MAX: 95 as number,
  /** Penalización máxima por volatilidad */
  MAX_VOLATILITY_PENALTY: 20 as number,
  /** Incremento de confianza por datos adicionales (principiantes) */
  BEGINNER_CONFIDENCE_PER_WORKOUT: 5 as number,
  /** Incremento de confianza por datos adicionales (intermedios) */
  INTERMEDIATE_CONFIDENCE_PER_WORKOUT: 2 as number,
  /** Incremento de confianza por datos semanales */
  WEEKLY_DATA_CONFIDENCE_BONUS: 5 as number,
};
