import type { WorkoutRecord } from '@/interfaces';
import { calculateIntensityScore } from './calculate-intensity-score';
import { clamp } from './math-utils';
import { getThisWeekRecords } from './week-records.utils';

/**
 * Interfaz para métricas de intensidad
 */
export interface IntensityMetrics {
  averageIntensity: number; // Peso promedio como % del máximo
  volumeIntensity: number; // Volumen total vs capacidad estimada
  frequencyIntensity: number; // Frecuencia vs recomendada
  overallIntensity: 'Baja' | 'Óptima' | 'Alta' | 'Excesiva';
  recommendations: string[];
}

/**
 * Analiza métricas de intensidad de entrenamiento
 */
export const analyzeIntensityMetrics = (records: WorkoutRecord[]): IntensityMetrics => {
  if (records.length === 0) {
    return {
      averageIntensity: 0,
      volumeIntensity: 0,
      frequencyIntensity: 0,
      overallIntensity: 'Baja',
      recommendations: ['Sin datos para análisis']
    };
  }

  // Calcular intensidad de peso usando la función centralizada (más preciso y consistente)
  const averageIntensity = calculateIntensityScore(records);

  // Calcular intensidad de volumen basada en métricas más realistas
  const totalVolume = records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const avgVolumePerWorkout = totalVolume / records.length;
  const volumeIntensity = clamp((avgVolumePerWorkout / 800) * 100, 0, 100);

  // Calcular intensidad de frecuencia de forma más equilibrada
  const thisWeekRecords = getThisWeekRecords(records);
  // Calcular días únicos en lugar de registros individuales
  const weeklyFrequency = new Set(thisWeekRecords.map(r => r.date.toDateString())).size;

  // Escala más realista: 3-5 sesiones por semana es óptimo
  let frequencyIntensity = 0;
  if (weeklyFrequency <= 1) {
    frequencyIntensity = 20;
  } else if (weeklyFrequency <= 2) {
    frequencyIntensity = 40;
  } else if (weeklyFrequency <= 3) {
    frequencyIntensity = 70;
  } else if (weeklyFrequency <= 4) {
    frequencyIntensity = 90;
  } else if (weeklyFrequency <= 5) {
    frequencyIntensity = 100;
  } else if (weeklyFrequency <= 6) {
    frequencyIntensity = 85; // Ligeramente menor porque puede ser excesivo
  } else {
    frequencyIntensity = 70; // Demasiado frecuente
  }

  // Calcular intensidad general con pesos más balanceados
  const overallScore = (averageIntensity * 0.4) + (volumeIntensity * 0.35) + (frequencyIntensity * 0.25);

  let overallIntensity: IntensityMetrics['overallIntensity'];
  if (overallScore >= 85) overallIntensity = 'Excesiva';
  else if (overallScore >= 70) overallIntensity = 'Alta';
  else if (overallScore >= 50) overallIntensity = 'Óptima';
  else overallIntensity = 'Baja';

  // Recomendaciones mejoradas basadas en análisis detallado
  const recommendations: string[] = [];

  // Recomendaciones para intensidad de peso
  if (averageIntensity < 50) {
    recommendations.push('Incrementar pesos gradualmente (5-10% cada 2 semanas)');
  } else if (averageIntensity > 90) {
    recommendations.push('Considerar trabajar con rangos de repeticiones más altos');
  }

  // Recomendaciones para volumen
  if (volumeIntensity < 40) {
    recommendations.push('Aumentar volumen por sesión (más series o ejercicios)');
  } else if (volumeIntensity > 90) {
    recommendations.push('Considerar reducir volumen para mejorar recuperación');
  }

  // Recomendaciones para frecuencia
  if (weeklyFrequency < 3) {
    recommendations.push('Incrementar frecuencia a 3-4 sesiones semanales');
  } else if (weeklyFrequency > 6) {
    recommendations.push('Reducir frecuencia e incluir más días de descanso');
  }

  // Recomendaciones específicas para intensidad general
  if (overallScore < 50) {
    recommendations.push('Planificar progresión sistemática en peso y volumen');
  } else if (overallScore > 90) {
    recommendations.push('Implementar semana de descarga cada 4-6 semanas');
  }

  if (recommendations.length === 0) {
    recommendations.push('Mantener intensidad actual - está en rango óptimo');
  }

  return {
    averageIntensity: Math.round(averageIntensity),
    volumeIntensity: Math.round(volumeIntensity),
    frequencyIntensity: Math.round(frequencyIntensity),
    overallIntensity,
    recommendations
  };
}; 