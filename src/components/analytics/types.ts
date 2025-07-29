import type { WorkoutRecord } from '@/interfaces';

/**
 * Tipos para componentes de Analytics
 */

export interface AnalyticsOverviewProps {
  records: WorkoutRecord[];
}

export interface ProgressTimelineProps {
  records: WorkoutRecord[];
}

export interface ExerciseAnalyticsProps {
  records: WorkoutRecord[];
}

export interface ComparisonAnalyticsProps {
  records: WorkoutRecord[];
}

export interface AnalyticsFiltersProps {
  selectedPeriod: string;
  selectedMetric: string;
  comparisonMode: boolean;
  onPeriodChange: (period: string) => void;
  onMetricChange: (metric: string) => void;
  onComparisonToggle: (enabled: boolean) => void;
}

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  description: string;
  color: string;
}

export interface TimelinePoint {
  date: Date;
  value: number;
  label: string;
  details?: string;
}

export interface AnalyticsPeriod {
  id: string;
  name: string;
  days: number;
}

export interface MetricComparison {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}
