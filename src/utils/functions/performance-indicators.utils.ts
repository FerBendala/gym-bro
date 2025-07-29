import type { WorkoutRecord } from '@/interfaces';
import { calculateTrainingConsistency, calculateTrainingFrequency } from '@/utils/functions';

/**
 * Genera indicadores de rendimiento pico mejorados
 */
export const generateEnhancedPerformanceIndicators = (records: WorkoutRecord[]): {
  type: 'excellent' | 'good' | 'warning' | 'critical';
  icon: string;
  title: string;
  description: string;
  value?: string;
  progress?: number;
  category: 'consistency' | 'progress' | 'intensity' | 'recovery' | 'volume' | 'prediction' | 'plateau' | 'safety';
}[] => {
  if (records.length === 0) {
    return [
      {
        type: 'warning',
        icon: 'data',
        title: 'Sin datos',
        description: 'Comienza registrando tus entrenamientos para obtener análisis detallados',
        category: 'consistency',
      },
    ];
  }

  const indicators: {
    type: 'excellent' | 'good' | 'warning' | 'critical';
    icon: string;
    title: string;
    description: string;
    value?: string;
    progress?: number;
    category: 'consistency' | 'progress' | 'intensity' | 'recovery' | 'volume' | 'prediction' | 'plateau' | 'safety';
  }[] = [];

  // Análisis de consistencia
  const consistency = calculateTrainingConsistency(records, 30);
  if (consistency >= 80) {
    indicators.push({
      type: 'excellent',
      icon: 'calendar-check',
      title: 'Consistencia Excelente',
      description: 'Mantienes un patrón de entrenamiento muy regular',
      value: `${consistency.toFixed(0)}%`,
      progress: consistency,
      category: 'consistency',
    });
  } else if (consistency >= 60) {
    indicators.push({
      type: 'good',
      icon: 'calendar',
      title: 'Consistencia Buena',
      description: 'Tu rutina es bastante regular, pero hay espacio para mejorar',
      value: `${consistency.toFixed(0)}%`,
      progress: consistency,
      category: 'consistency',
    });
  } else {
    indicators.push({
      type: 'warning',
      icon: 'calendar-x',
      title: 'Consistencia Baja',
      description: 'Necesitas establecer horarios más regulares para tu entrenamiento',
      value: `${consistency.toFixed(0)}%`,
      progress: consistency,
      category: 'consistency',
    });
  }

  // Análisis de frecuencia
  const frequency = calculateTrainingFrequency(records, 30);
  if (frequency >= 4) {
    indicators.push({
      type: 'excellent',
      icon: 'trending-up',
      title: 'Frecuencia Excelente',
      description: 'Entrenas con la frecuencia ideal para progreso',
      value: `${frequency.toFixed(1)} días/semana`,
      progress: Math.min(100, frequency * 20),
      category: 'progress',
    });
  } else if (frequency >= 3) {
    indicators.push({
      type: 'good',
      icon: 'trending-up',
      title: 'Frecuencia Buena',
      description: 'Tu frecuencia de entrenamiento es adecuada',
      value: `${frequency.toFixed(1)} días/semana`,
      progress: Math.min(100, frequency * 20),
      category: 'progress',
    });
  } else {
    indicators.push({
      type: 'warning',
      icon: 'trending-down',
      title: 'Frecuencia Baja',
      description: 'Considera aumentar la frecuencia de entrenamiento',
      value: `${frequency.toFixed(1)} días/semana`,
      progress: Math.min(100, frequency * 20),
      category: 'progress',
    });
  }

  // Análisis de volumen
  const totalVolume = records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const avgVolumePerSession = totalVolume / records.length;
  const volumeScore = Math.min(100, (avgVolumePerSession / 2000) * 100);

  if (volumeScore >= 80) {
    indicators.push({
      type: 'excellent',
      icon: 'layers',
      title: 'Volumen Óptimo',
      description: 'Tu volumen de entrenamiento está bien balanceado',
      value: `${volumeScore.toFixed(0)}%`,
      progress: volumeScore,
      category: 'volume',
    });
  } else if (volumeScore >= 60) {
    indicators.push({
      type: 'good',
      icon: 'layers',
      title: 'Volumen Adecuado',
      description: 'Tu volumen está bien, pero hay espacio para optimizar',
      value: `${volumeScore.toFixed(0)}%`,
      progress: volumeScore,
      category: 'volume',
    });
  } else {
    indicators.push({
      type: 'warning',
      icon: 'layers',
      title: 'Volumen Subóptimo',
      description: 'Considera ajustar tu volumen de entrenamiento',
      value: `${volumeScore.toFixed(0)}%`,
      progress: volumeScore,
      category: 'volume',
    });
  }

  // Análisis de intensidad (simplificado)
  const avgWeight = records.reduce((sum, r) => sum + r.weight, 0) / records.length;
  const maxWeight = Math.max(...records.map(r => r.weight));
  const intensityScore = (avgWeight / maxWeight) * 100;

  if (intensityScore >= 80) {
    indicators.push({
      type: 'excellent',
      icon: 'zap',
      title: 'Intensidad Óptima',
      description: 'Tu intensidad de entrenamiento está en el rango ideal',
      value: `${intensityScore.toFixed(0)}%`,
      progress: intensityScore,
      category: 'intensity',
    });
  } else if (intensityScore >= 60) {
    indicators.push({
      type: 'good',
      icon: 'zap',
      title: 'Intensidad Buena',
      description: 'Buena intensidad, pero hay espacio para mejorar',
      value: `${intensityScore.toFixed(0)}%`,
      progress: intensityScore,
      category: 'intensity',
    });
  } else {
    indicators.push({
      type: 'warning',
      icon: 'zap',
      title: 'Intensidad Baja',
      description: 'Considera aumentar la intensidad gradualmente',
      value: `${intensityScore.toFixed(0)}%`,
      progress: intensityScore,
      category: 'intensity',
    });
  }

  return indicators;
};
