/**
 * Interfaces globales para componentes del Dashboard
 * Centraliza interfaces compartidas entre múltiples componentes
 */

import type { React } from 'react';

// ===== INTERFACES DE ANÁLISIS DE EJERCICIOS =====

export interface ExerciseAnalysis {
  name: string;
  categories: string[];
  totalVolume: number;
  maxWeight: number;
  avgWeight: number;
  progress: number;
  progressPercent: number;
  frequency: number;
  firstWeight: number;
  lastWeight: number;
  lastDate: Date;
}

// ===== INTERFACES DE HISTORIAL Y EVOLUCIÓN =====

export interface HistoryPoint {
  date: Date;
  value: number;
  details: string;
  weekNumber: number;
  totalWorkouts: number;
  avgWeight: number;
  maxWeight: number;
  totalSets: number;
  totalReps: number;
  uniqueExercises: number;
  change: number;
  changePercent: number;
  totalVolumeChangePercent: number;
  trend: 'up' | 'down' | 'stable';
}

// ===== INTERFACES DE GRÁFICOS Y CHART =====

export interface ChartDataPoint {
  name: string;
  value: number;
  ideal?: number;
  color?: string;
}

export interface ChartProps {
  data: ChartDataPoint[];
  onItemClick?: (itemName: string) => void;
}

export interface RadarChartProps {
  balanceScore: number;
  consistency: number;
  intensity: number;
  frequency: number;
  progress: number;
  balanceLevel: 'excellent' | 'good' | 'unbalanced' | 'critical';
}

export interface GaugeProps {
  confidence: number;
  level: string;
  color: string;
}

export interface RadialChartProps {
  qualityScore: number;
  validationRate: number;
  hasRecentData: boolean;
  dataSpan: number;
}

// ===== INTERFACES DE MÉTRICAS Y ANÁLISIS =====

export interface MetricsData {
  totalVolume: number;
  avgProgress: number;
  exercisesImproving: number;
  totalSessions: number;
}

export interface AnalysisData {
  fatigueIndex: number;
  overreachingRisk: string;
  recoveryDays?: number;
  recoveryRate?: number;
  recoveryScore?: number;
  workloadTrend?: string;
}

export interface PredictionData {
  nextWeekWeight: number;
  trendAnalysis: string;
  plateauRisk: number;
}

// ===== INTERFACES DE SUGERENCIAS E INDICADORES =====

export interface OptimizationSuggestion {
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface PerformanceIndicator {
  type: 'excellent' | 'good' | 'warning' | 'critical';
  title: string;
  description: string;
  value?: string;
  progress?: number;
  icon: string;
}

// ===== INTERFACES DE ESTADOS VACÍOS Y ADVERTENCIAS =====

export interface EmptyStateProps {
  hasUnknownRecords?: boolean;
  unknownRecordsCount?: number;
}

export interface WarningProps {
  unknownRecordsCount: number;
}

// ===== INTERFACES DE FILTROS Y CATEGORÍAS =====

export interface CategoryFilter {
  id: string;
  name: string;
  count: number;
}

// ===== INTERFACES DE TENDENCIAS Y PREDICCIONES =====

export interface TrendAnalysisData {
  strengthTrend: number;
  volumeTrend: number;
  monthlyGrowthRate: number;
  plateauRisk: number;
  confidenceLevel: number;
  trendAnalysis: string;
}

export interface PredictionTimelineData {
  currentWeight: number;
  nextWeekWeight: number;
  predictedPR: number;
  monthlyGrowthRate: number;
  strengthTrend: number;
}

export interface PRProgressData {
  currentWeight: number;
  predictedPR: number;
  baseline1RM: number;
  confidence: number;
  timeToNextPR: number;
  improvement: number;
}

// ===== INTERFACES DE CALIDAD DE DATOS =====

export interface DataQualityMetrics {
  qualityScore: number;
  validRecords: number;
  dataSpan: number;
  hasRecentData: boolean;
}

// ===== INTERFACES DE FACTORES Y ANÁLISIS =====

export interface FactorData {
  name: string;
  value: number | string;
  status: 'good' | 'warning' | 'bad';
}

// ===== INTERFACES DE CATEGORÍAS Y BALANCE =====

export interface CategoryDashboardData {
  volume: number;
  idealVolume: number;
  intensity: number;
  frequency: number;
  strength: number;
  records: number;
  trend: string;
}

// ===== INTERFACES DE MÉTRICAS CENTRALIZADAS =====

export interface CentralizedMetrics {
  nextWeekWeight: number;
  prWeight: number;
  monthlyGrowth: number;
  plateauRisk: number;
  trendAnalysis: string;
  strengthTrend: number;
  volumeTrend: number;
  prConfidence: number;
  confidenceLevel: number;
}

export interface PredictionMetrics {
  dataQuality: DataQualityMetrics;
  formattedImprovement: string;
  formattedBaseline: string;
}

export interface ConfidenceInfo {
  level: string;
  color: string;
} 