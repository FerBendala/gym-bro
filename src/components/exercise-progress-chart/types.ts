import type { WorkoutRecord } from '@/interfaces';
import type { ChartDimensions, DataRange } from '@/utils';

/**
 * Props principales del ExerciseProgressChart
 */
export interface ExerciseProgressChartProps {
  records: WorkoutRecord[];
}

/**
 * Props para el grid del chart
 */
export interface ChartGridProps {
  dimensions: ChartDimensions;
  weightRange: DataRange;
  dateRange: DataRange;
}

/**
 * Props para las líneas de progreso
 */
export interface ChartProgressLinesProps {
  exerciseData: Record<string, WorkoutRecord[]>;
  dimensions: ChartDimensions;
  weightRange: DataRange;
  dateRange: DataRange;
  colors: string[];
}

/**
 * Props para el estado vacío del chart
 */
export interface ChartEmptyStateProps {
  height?: number;
  message?: string;
}

/**
 * Datos procesados para el chart
 */
export interface ProcessedChartData {
  exerciseData: Record<string, WorkoutRecord[]>;
  weightRange: DataRange;
  dateRange: DataRange;
  legendItems: {
    label: string;
    color: string;
  }[];
}

/**
 * Return type del hook use-chart-data
 */
export interface UseChartDataReturn {
  chartData: ProcessedChartData | null;
  isEmpty: boolean;
}

export interface ChartStatistics {
  totalExercises: number;
  totalSessions: number;
  averageWeightIncrease: number;
  bestProgress: {
    exercise: string;
    improvement: number;
  };
  consistencyScore: number;
  timeRange: string;
}

export interface ChartStatisticsProps {
  statistics: ChartStatistics;
}
