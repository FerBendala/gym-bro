import type { WorkoutRecord } from '@/interfaces';

export interface StrengthProgressProps {
  records: WorkoutRecord[];
}

export interface StrengthProgressAnalysis {
  currentMax1RM: number;
  overallProgress: {
    absolute: number;
    percentage: number;
    rate: string;
  };
  consistencyMetrics: {
    progressionConsistency: number;
    plateauPeriods: number;
    breakthroughCount: number;
    volatilityIndex: number;
  };
  predictions: {
    next4WeeksPR: number;
    next12WeeksPR: number;
    plateauRisk: number;
    timeToNextPR: number;
    confidence: number;
  };
  strengthCurve: {
    phase: string;
    gainRate: number;
    potential: number;
  };
  trainingRecommendations: {
    intensityZone: string;
    suggestedRPE: number;
    volumeAdjustment: number;
    frequencyAdjustment: number;
    periodizationTip: string;
  };
  repRangeAnalysis: Array<{
    range: string;
    volume: number;
    maxWeight: number;
    progressRate: number;
    effectiveness: number;
  }>;
  qualityMetrics: {
    formConsistency: number;
    loadProgression: number;
    volumeOptimization: number;
    recoveryIndicators: number;
  };
}

export type PhaseType = 'elite' | 'advanced' | 'intermediate' | 'novice';
export type RateType = 'exceptional' | 'fast' | 'moderate' | 'slow';
export type ZoneType = 'deload' | 'peaking' | 'intensity' | 'volume'; 