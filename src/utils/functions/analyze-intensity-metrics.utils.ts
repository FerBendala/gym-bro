import { calculateIntensityScore } from './calculate-intensity-score';
import { clamp } from './math-utils';
import { calculateVolume } from './volume-calculations';

import type { WorkoutRecord } from '@/interfaces';

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
 * MEJORADO: Considera solo semanas completadas para un cálculo más preciso
 */
export const analyzeIntensityMetrics = (records: WorkoutRecord[]): IntensityMetrics => {
  if (records.length === 0) {
    return {
      averageIntensity: 0,
      volumeIntensity: 0,
      frequencyIntensity: 0,
      overallIntensity: 'Baja',
      recommendations: ['Sin datos para análisis'],
    };
  }

  // Calcular intensidad de peso usando la función centralizada (más preciso y consistente)
  const averageIntensity = calculateIntensityScore(records);

  // Calcular intensidad de volumen basada en métricas más realistas
  // Usar solo semanas completadas para el cálculo
  const today = new Date();
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - today.getDay() + 1);
  const currentWeekKey = currentMonday.toISOString().split('T')[0];

  // Separar registros de semanas completadas vs semana actual
  const completedRecords: WorkoutRecord[] = [];
  const currentWeekRecords: WorkoutRecord[] = [];

  records.forEach(record => {
    const date = new Date(record.date);
    const monday = new Date(date);
    monday.setDate(date.getDate() - date.getDay() + 1);
    const weekKey = monday.toISOString().split('T')[0];

    if (weekKey === currentWeekKey) {
      currentWeekRecords.push(record);
    } else {
      completedRecords.push(record);
    }
  });

  // Usar solo semanas completadas para el cálculo de volumen
  const recordsForVolume = completedRecords.length > 0 ? completedRecords : records;
  const totalVolume = recordsForVolume.reduce((sum, r) => sum + calculateVolume(r), 0);
  const avgVolumePerWorkout = totalVolume / recordsForVolume.length;
  const volumeIntensity = clamp((avgVolumePerWorkout / 800) * 100, 0, 100);

  // Calcular intensidad de frecuencia usando la nueva lógica por semanas
  const weeklyData = new Map<string, number>();

  records.forEach(record => {
    const date = new Date(record.date);
    // Obtener el lunes de la semana (día 1 = lunes)
    const monday = new Date(date);
    monday.setDate(date.getDate() - date.getDay() + 1);
    const weekKey = monday.toISOString().split('T')[0];

    if (!weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, 0);
    }
    weeklyData.set(weekKey, weeklyData.get(weekKey)! + 1);
  });

  // Calcular frecuencia semanal promedio (solo semanas completadas)
  let totalWorkouts = 0;
  let completedWeeks = 0;

  weeklyData.forEach((workouts, week) => {
    if (week !== currentWeekKey) {
      // Solo contar semanas completadas (no la semana actual)
      totalWorkouts += workouts;
      completedWeeks++;
    }
  });

  // Si no hay semanas completadas, usar todas las semanas
  if (completedWeeks === 0) {
    totalWorkouts = Array.from(weeklyData.values()).reduce((sum, workouts) => sum + workouts, 0);
    completedWeeks = weeklyData.size;
  }

  const weeklyFrequency = totalWorkouts > 0 && completedWeeks > 0
    ? totalWorkouts / completedWeeks
    : 0;

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
    recommendations,
  };
};
