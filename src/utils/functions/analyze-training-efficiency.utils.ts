import type { WorkoutRecord } from '@/interfaces';

/**
 * Interfaz para eficiencia de entrenamiento
 */
export interface TrainingEfficiency {
  volumeToWeightRatio: number;
  setsToVolumeRatio: number;
  timeEfficiencyScore: number;
  optimalLoadRange: { min: number; max: number };
  recommendedAdjustments: string[];
}

/**
 * Analiza eficiencia de entrenamiento
 */
export const analyzeTrainingEfficiency = (records: WorkoutRecord[]): TrainingEfficiency => {
  if (records.length === 0) {
    return {
      volumeToWeightRatio: 0,
      setsToVolumeRatio: 0,
      timeEfficiencyScore: 0,
      optimalLoadRange: { min: 0, max: 0 },
      recommendedAdjustments: ['Sin datos suficientes para análisis']
    };
  }

  // Ratio volumen/peso promedio
  const totalVolume = records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const avgWeight = records.reduce((sum, r) => sum + r.weight, 0) / records.length;
  const volumeToWeightRatio = totalVolume / avgWeight;

  // Ratio series/volumen (eficiencia por serie)
  const totalSets = records.reduce((sum, r) => sum + r.sets, 0);
  const setsToVolumeRatio = totalVolume / totalSets;

  // Score de eficiencia temporal (basado en volumen por sesión)
  const avgVolumePerSession = totalVolume / records.length;
  const timeEfficiencyScore = Math.min(100, (avgVolumePerSession / 1000) * 100);

  // Rango óptimo de carga (basado en datos históricos)
  const weights = records.map(r => r.weight).sort((a, b) => a - b);
  const optimalLoadRange = {
    min: Math.round(weights[Math.floor(weights.length * 0.2)]),
    max: Math.round(weights[Math.floor(weights.length * 0.8)])
  };

  // Recomendaciones basadas en análisis mejorado
  const recommendations: string[] = [];

  // Análisis de eficiencia temporal más realista
  if (timeEfficiencyScore < 30) {
    recommendations.push('Volumen por sesión muy bajo - considera añadir ejercicios o series');
  } else if (timeEfficiencyScore < 50) {
    recommendations.push('Aumentar gradualmente la intensidad o volumen por sesión');
  } else if (timeEfficiencyScore > 90) {
    recommendations.push('Alto volumen por sesión - asegúrate de recuperar adecuadamente');
  }

  // Análisis de eficiencia por serie más contextual
  const avgVolumePerSet = setsToVolumeRatio;
  if (avgVolumePerSet < 30) {
    recommendations.push('Considerar aumentar peso o repeticiones por serie');
  } else if (avgVolumePerSet > 150) {
    recommendations.push('Series muy intensas - monitorea técnica y fatiga');
  }

  // Análisis de progresión de peso más inteligente
  if (volumeToWeightRatio > 200) {
    recommendations.push('Ratio volumen/peso alto - oportunidad de aumentar cargas');
  } else if (volumeToWeightRatio < 50) {
    recommendations.push('Bajo volumen relativo - considera añadir más series o ejercicios');
  }

  // Si no hay recomendaciones específicas, dar feedback positivo
  if (recommendations.length === 0) {
    recommendations.push('Eficiencia de entrenamiento en rango óptimo');
  }

  return {
    volumeToWeightRatio: Math.round(volumeToWeightRatio),
    setsToVolumeRatio: Math.round(setsToVolumeRatio),
    timeEfficiencyScore: Math.round(timeEfficiencyScore),
    optimalLoadRange,
    recommendedAdjustments: recommendations
  };
}; 