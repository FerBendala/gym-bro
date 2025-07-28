import type { WorkoutRecord } from '@/interfaces';
import { analyzeFatigue, analyzeIntensityMetrics, analyzeOptimalVolume, analyzeSafetyPatterns, analyzeTemporalConsistency, calculateProgressionRate, predictProgress } from './';

/**
 * Genera indicadores de rendimiento pico mejorados
 */
export const generateEnhancedPerformanceIndicators = (records: WorkoutRecord[]): Array<{
  type: 'excellent' | 'good' | 'warning' | 'critical';
  icon: string;
  title: string;
  description: string;
  value?: string;
  progress?: number;
  category: 'consistency' | 'progress' | 'intensity' | 'recovery' | 'volume' | 'prediction' | 'plateau' | 'safety';
}> => {
  if (records.length === 0) {
    return [
      {
        type: 'warning',
        icon: 'data',
        title: 'Sin datos',
        description: 'Comienza registrando tus entrenamientos para obtener análisis detallados',
        category: 'consistency'
      }
    ];
  }

  const indicators: Array<{
    type: 'excellent' | 'good' | 'warning' | 'critical';
    icon: string;
    title: string;
    description: string;
    value?: string;
    progress?: number;
    category: 'consistency' | 'progress' | 'intensity' | 'recovery' | 'volume' | 'prediction' | 'plateau' | 'safety';
  }> = [];

  // Análisis de consistencia
  const consistencyAnalysis = analyzeTemporalConsistency(records);
  if (consistencyAnalysis.consistencyScore >= 80) {
    indicators.push({
      type: 'excellent',
      icon: 'calendar-check',
      title: 'Consistencia Excelente',
      description: 'Mantienes un patrón de entrenamiento muy regular',
      value: `${consistencyAnalysis.consistencyScore}%`,
      progress: consistencyAnalysis.consistencyScore,
      category: 'consistency'
    });
  } else if (consistencyAnalysis.consistencyScore >= 60) {
    indicators.push({
      type: 'good',
      icon: 'calendar',
      title: 'Consistencia Buena',
      description: 'Tu rutina es bastante regular, pero hay espacio para mejorar',
      value: `${consistencyAnalysis.consistencyScore}%`,
      progress: consistencyAnalysis.consistencyScore,
      category: 'consistency'
    });
  } else {
    indicators.push({
      type: 'warning',
      icon: 'calendar-x',
      title: 'Consistencia Baja',
      description: 'Necesitas establecer horarios más regulares para tu entrenamiento',
      value: `${consistencyAnalysis.consistencyScore}%`,
      progress: consistencyAnalysis.consistencyScore,
      category: 'consistency'
    });
  }

  // Análisis de progreso
  const progressionRate = calculateProgressionRate(records);
  if (progressionRate >= 2) {
    indicators.push({
      type: 'excellent',
      icon: 'trending-up',
      title: 'Progreso Excelente',
      description: 'Estás progresando a un ritmo muy bueno',
      value: `${progressionRate.toFixed(1)}%`,
      progress: Math.min(100, progressionRate * 20),
      category: 'progress'
    });
  } else if (progressionRate >= 0.5) {
    indicators.push({
      type: 'good',
      icon: 'trending-up',
      title: 'Progreso Estable',
      description: 'Tu progreso es consistente y sostenible',
      value: `${progressionRate.toFixed(1)}%`,
      progress: Math.min(100, progressionRate * 20),
      category: 'progress'
    });
  } else {
    indicators.push({
      type: 'warning',
      icon: 'trending-down',
      title: 'Progreso Lento',
      description: 'Considera ajustar tu rutina para mejorar el progreso',
      value: `${progressionRate.toFixed(1)}%`,
      progress: Math.min(100, progressionRate * 20),
      category: 'progress'
    });
  }

  // Análisis de intensidad
  const intensityMetrics = analyzeIntensityMetrics(records);
  if (intensityMetrics.overallIntensity === 'Óptima') {
    indicators.push({
      type: 'excellent',
      icon: 'zap',
      title: 'Intensidad Óptima',
      description: 'Tu intensidad de entrenamiento está en el rango ideal',
      value: `${intensityMetrics.averageIntensity}%`,
      progress: intensityMetrics.averageIntensity,
      category: 'intensity'
    });
  } else if (intensityMetrics.overallIntensity === 'Alta') {
    indicators.push({
      type: 'good',
      icon: 'zap',
      title: 'Intensidad Alta',
      description: 'Buena intensidad, pero monitorea la recuperación',
      value: `${intensityMetrics.averageIntensity}%`,
      progress: intensityMetrics.averageIntensity,
      category: 'intensity'
    });
  } else if (intensityMetrics.overallIntensity === 'Excesiva') {
    indicators.push({
      type: 'critical',
      icon: 'zap',
      title: 'Intensidad Excesiva',
      description: 'Riesgo de sobreentrenamiento - reduce intensidad',
      value: `${intensityMetrics.averageIntensity}%`,
      progress: intensityMetrics.averageIntensity,
      category: 'intensity'
    });
  } else {
    indicators.push({
      type: 'warning',
      icon: 'zap',
      title: 'Intensidad Baja',
      description: 'Considera aumentar la intensidad gradualmente',
      value: `${intensityMetrics.averageIntensity}%`,
      progress: intensityMetrics.averageIntensity,
      category: 'intensity'
    });
  }

  // Análisis de recuperación
  const fatigueAnalysis = analyzeFatigue(records);
  if (fatigueAnalysis.fatigueIndex <= 30) {
    indicators.push({
      type: 'excellent',
      icon: 'heart',
      title: 'Recuperación Excelente',
      description: 'Tu cuerpo se está recuperando muy bien',
      value: `${fatigueAnalysis.fatigueIndex}%`,
      progress: 100 - fatigueAnalysis.fatigueIndex,
      category: 'recovery'
    });
  } else if (fatigueAnalysis.fatigueIndex <= 50) {
    indicators.push({
      type: 'good',
      icon: 'heart',
      title: 'Recuperación Buena',
      description: 'Tu recuperación está en buen nivel',
      value: `${fatigueAnalysis.fatigueIndex}%`,
      progress: 100 - fatigueAnalysis.fatigueIndex,
      category: 'recovery'
    });
  } else if (fatigueAnalysis.fatigueIndex <= 70) {
    indicators.push({
      type: 'warning',
      icon: 'heart',
      title: 'Fatiga Moderada',
      description: 'Considera más descanso o reducir intensidad',
      value: `${fatigueAnalysis.fatigueIndex}%`,
      progress: 100 - fatigueAnalysis.fatigueIndex,
      category: 'recovery'
    });
  } else {
    indicators.push({
      type: 'critical',
      icon: 'heart',
      title: 'Fatiga Crítica',
      description: 'Descanso inmediato necesario - riesgo de lesión',
      value: `${fatigueAnalysis.fatigueIndex}%`,
      progress: 100 - fatigueAnalysis.fatigueIndex,
      category: 'recovery'
    });
  }

  // Análisis de volumen
  const volumeAnalysis = analyzeOptimalVolume(records);
  if (volumeAnalysis.volumeScore >= 80) {
    indicators.push({
      type: 'excellent',
      icon: 'layers',
      title: 'Volumen Óptimo',
      description: 'Tu volumen de entrenamiento está bien balanceado',
      value: `${volumeAnalysis.volumeScore}%`,
      progress: volumeAnalysis.volumeScore,
      category: 'volume'
    });
  } else if (volumeAnalysis.volumeScore >= 60) {
    indicators.push({
      type: 'good',
      icon: 'layers',
      title: 'Volumen Adecuado',
      description: 'Tu volumen está bien, pero hay espacio para optimizar',
      value: `${volumeAnalysis.volumeScore}%`,
      progress: volumeAnalysis.volumeScore,
      category: 'volume'
    });
  } else {
    indicators.push({
      type: 'warning',
      icon: 'layers',
      title: 'Volumen Subóptimo',
      description: 'Considera ajustar tu volumen de entrenamiento',
      value: `${volumeAnalysis.volumeScore}%`,
      progress: volumeAnalysis.volumeScore,
      category: 'volume'
    });
  }

  // Análisis de predicción
  const prediction = predictProgress(records);
  if (prediction.confidenceLevel >= 80) {
    indicators.push({
      type: 'excellent',
      icon: 'target',
      title: 'Predicciones Confiables',
      description: 'Tus datos permiten predicciones muy precisas',
      value: `${prediction.confidenceLevel}%`,
      progress: prediction.confidenceLevel,
      category: 'prediction'
    });
  } else if (prediction.confidenceLevel >= 60) {
    indicators.push({
      type: 'good',
      icon: 'target',
      title: 'Predicciones Moderadas',
      description: 'Tus predicciones son razonablemente confiables',
      value: `${prediction.confidenceLevel}%`,
      progress: prediction.confidenceLevel,
      category: 'prediction'
    });
  } else {
    indicators.push({
      type: 'warning',
      icon: 'target',
      title: 'Predicciones Limitadas',
      description: 'Necesitas más datos para predicciones precisas',
      value: `${prediction.confidenceLevel}%`,
      progress: prediction.confidenceLevel,
      category: 'prediction'
    });
  }

  // Análisis de meseta
  if (prediction.plateauRisk <= 20) {
    indicators.push({
      type: 'excellent',
      icon: 'shield',
      title: 'Bajo Riesgo de Meseta',
      description: 'Tu progreso es sostenible a largo plazo',
      value: `${prediction.plateauRisk}%`,
      progress: 100 - prediction.plateauRisk,
      category: 'plateau'
    });
  } else if (prediction.plateauRisk <= 50) {
    indicators.push({
      type: 'good',
      icon: 'shield',
      title: 'Riesgo Moderado de Meseta',
      description: 'Considera variar tu rutina para evitar estancamiento',
      value: `${prediction.plateauRisk}%`,
      progress: 100 - prediction.plateauRisk,
      category: 'plateau'
    });
  } else if (prediction.plateauRisk <= 80) {
    indicators.push({
      type: 'warning',
      icon: 'shield',
      title: 'Alto Riesgo de Meseta',
      description: 'Cambia tu rutina para evitar el estancamiento',
      value: `${prediction.plateauRisk}%`,
      progress: 100 - prediction.plateauRisk,
      category: 'plateau'
    });
  } else {
    indicators.push({
      type: 'critical',
      icon: 'shield',
      title: 'Riesgo Crítico de Meseta',
      description: 'Cambio inmediato de rutina necesario',
      value: `${prediction.plateauRisk}%`,
      progress: 100 - prediction.plateauRisk,
      category: 'plateau'
    });
  }

  // Análisis de seguridad
  const safetyAnalysis = analyzeSafetyPatterns(records);
  if (safetyAnalysis.safetyScore >= 80) {
    indicators.push({
      type: 'excellent',
      icon: 'shield-check',
      title: 'Seguridad Excelente',
      description: 'Tus patrones de entrenamiento son muy seguros',
      value: `${safetyAnalysis.safetyScore}%`,
      progress: safetyAnalysis.safetyScore,
      category: 'safety'
    });
  } else if (safetyAnalysis.safetyScore >= 60) {
    indicators.push({
      type: 'good',
      icon: 'shield-check',
      title: 'Seguridad Buena',
      description: 'Tus patrones son seguros, pero hay espacio para mejorar',
      value: `${safetyAnalysis.safetyScore}%`,
      progress: safetyAnalysis.safetyScore,
      category: 'safety'
    });
  } else {
    indicators.push({
      type: 'warning',
      icon: 'shield-alert',
      title: 'Seguridad Mejorable',
      description: 'Revisa tu técnica y progresión para mayor seguridad',
      value: `${safetyAnalysis.safetyScore}%`,
      progress: safetyAnalysis.safetyScore,
      category: 'safety'
    });
  }

  return indicators;
}; 