import type { WorkoutRecord } from '../../interfaces';
import type { StatCardProps } from '../stat-card';

/**
 * Props principales del ExerciseStats
 */
export interface ExerciseStatsProps {
  records: WorkoutRecord[];
}

/**
 * Props para las estadísticas principales
 */
export interface MainStatsProps {
  stats: CalculatedStats;
}

/**
 * Props para las estadísticas adicionales
 */
export interface AdditionalStatsProps {
  stats: CalculatedStats;
}

/**
 * Estadísticas calculadas del ejercicio
 */
export interface CalculatedStats {
  totalWorkouts: number;
  totalVolume: number;
  averageWeight: number;
  maxWeight: number;
  workoutDays: number;
  lastWorkout: Date | null;
  mostFrequentExercise: string | null;
}

/**
 * Configuración de tarjeta de estadística
 * Incluye tooltip opcional para explicar el significado de cada métrica
 */
export interface StatConfig extends Omit<StatCardProps, 'className'> {
  id: string;
  tooltip?: string;
}

/**
 * Return type del hook use-exercise-stats
 */
export interface UseExerciseStatsReturn {
  stats: CalculatedStats;
  isEmpty: boolean;
} 