import type { WorkoutRecord } from '@/interfaces';
import { generateAdvancedOptimizationSuggestions } from './advanced-analysis/optimization-suggestions.utils';
import { generateEnhancedPerformanceIndicators } from './advanced-analysis/performance-indicators.utils';
import type { FatigueAnalysis } from './analyze-fatigue.utils';
import { analyzeFatigue } from './analyze-fatigue.utils';
import type { IntensityMetrics } from './analyze-intensity-metrics.utils';
import { analyzeIntensityMetrics } from './analyze-intensity-metrics.utils';
import type { TrainingEfficiency } from './analyze-training-efficiency.utils';
import { analyzeTrainingEfficiency } from './analyze-training-efficiency.utils';
import type { TrainingDensity } from './calculate-training-density.utils';
import { calculateTrainingDensity } from './calculate-training-density.utils';
import type { PeriodComparison } from './compare-periods.utils';
import { comparePeriods } from './compare-periods.utils';
import type { ProgressPrediction } from './predict-progress.utils';
import { predictProgress } from './predict-progress.utils';

/**
 * Interfaz para análisis avanzado
 */
export interface AdvancedAnalysis {
  trainingDensity: TrainingDensity[];
  trainingEfficiency: TrainingEfficiency;
  fatigueAnalysis: FatigueAnalysis;
  periodComparisons: PeriodComparison[];
  progressPrediction: ProgressPrediction;
  intensityMetrics: IntensityMetrics;
  peakPerformanceIndicators: Array<{
    type: 'excellent' | 'good' | 'warning' | 'critical';
    icon: string;
    title: string;
    description: string;
    value?: string;
    progress?: number;
    category: 'consistency' | 'progress' | 'intensity' | 'recovery' | 'volume' | 'prediction' | 'plateau' | 'safety';
  }>;
  optimizationSuggestions: string[];
}

/**
 * Calcula análisis avanzado completo
 */
export const calculateAdvancedAnalysis = (records: WorkoutRecord[]): AdvancedAnalysis => {
  const trainingDensity = calculateTrainingDensity(records);
  const fatigueAnalysis = analyzeFatigue(records);
  const intensityMetrics = analyzeIntensityMetrics(records);

  // Indicadores de rendimiento pico mejorados
  const peakPerformanceIndicators = generateEnhancedPerformanceIndicators(records);

  // Sugerencias de optimización consolidadas y priorizadas
  const optimizationSuggestions: string[] = [];
  const efficiency = analyzeTrainingEfficiency(records);
  const prediction = predictProgress(records);

  // 1. Añadir sugerencias avanzadas (las más específicas y útiles)
  const advancedSuggestions = generateAdvancedOptimizationSuggestions(records);
  optimizationSuggestions.push(...advancedSuggestions.slice(0, 4)); // Máximo 4 sugerencias avanzadas

  // 2. Prioridad ALTA: Problemas críticos
  if (fatigueAnalysis.fatigueIndex > 70) {
    optimizationSuggestions.push('CRÍTICO: Descanso inmediato necesario - riesgo de lesión o sobreentrenamiento');
  }

  if (prediction.plateauRisk > 80) {
    optimizationSuggestions.push('CRÍTICO: Riesgo muy alto de meseta - cambiar rutina inmediatamente');
  }

  // 3. Prioridad MEDIA: Mejoras importantes
  if (intensityMetrics.overallIntensity === 'Baja') {
    optimizationSuggestions.push('Aumentar intensidad general - peso, volumen o frecuencia');
  } else if (intensityMetrics.overallIntensity === 'Excesiva') {
    optimizationSuggestions.push('Reducir intensidad - implementar semana de descarga');
  }

  if (prediction.trendAnalysis === 'empeorando') {
    optimizationSuggestions.push('Tendencia negativa detectada - revisar descanso, nutrición y técnica');
  }

  // 4. Prioridad BAJA: Optimizaciones menores
  if (efficiency.timeEfficiencyScore < 40) {
    optimizationSuggestions.push('Optimizar eficiencia temporal - aumentar volumen por sesión');
  }

  // 5. Recomendaciones específicas de recuperación (si aplicables)
  if (fatigueAnalysis.restRecommendation !== 'Continuar rutina normal' && fatigueAnalysis.fatigueIndex <= 70) {
    optimizationSuggestions.push(fatigueAnalysis.restRecommendation);
  }

  // 6. Si no hay sugerencias críticas, añadir feedback positivo
  if (optimizationSuggestions.length === 0) {
    optimizationSuggestions.push('Tu entrenamiento está bien optimizado - mantén la consistencia');
  }

  return {
    trainingDensity,
    trainingEfficiency: efficiency,
    fatigueAnalysis,
    periodComparisons: comparePeriods(records),
    progressPrediction: prediction,
    intensityMetrics,
    peakPerformanceIndicators,
    optimizationSuggestions: Array.from(new Set(optimizationSuggestions)).slice(0, 6) // Eliminar duplicados y limitar a 6
  };
}; 