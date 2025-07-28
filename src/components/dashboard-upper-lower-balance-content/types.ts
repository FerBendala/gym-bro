import type { LucideIcon } from 'lucide-react';

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
}

export interface CategoryMetric {
  category: string;
  percentage: number;
  avgWorkoutsPerWeek?: number;
  intensityScore?: number;
  personalRecords?: number;
  progressTrend?: {
    strength: number;
  };
}

export interface CategoryAnalysis {
  categoryMetrics: CategoryMetric[];
}

export interface MuscleBalanceItem {
  category: string;
  balanceHistory?: {
    trend: 'improving' | 'declining' | 'stable';
  };
}

export interface UpperLowerBalanceContentProps {
  upperLowerBalance: UpperLowerBalanceData;
  categoryAnalysis: CategoryAnalysis;
  muscleBalance: MuscleBalanceItem[];
  onItemClick: (itemName: string) => void;
}

export interface MetaCategoryData {
  category: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
  percentage: number;
  volume: number;
  idealPercentage: number;
  categories: string[];
  isBalanced: boolean;
}

export interface HorizontalBarChartProps {
  data: Array<{
    name: string;
    value: number;
    ideal: number;
    color: string;
  }>;
  onItemClick?: (itemName: string) => void;
}

export interface CategoryDashboardChartProps {
  data: {
    volume: number;
    idealVolume: number;
    intensity: number;
    frequency: number;
    strength: number;
    records: number;
    trend: string;
  };
  color: string;
}

export interface MetaCategoryCardProps {
  meta: MetaCategoryData;
  categoryAnalysis: CategoryAnalysis;
  muscleBalance: MuscleBalanceItem[];
}

export type TrendType = 'improving' | 'declining' | 'stable'; 