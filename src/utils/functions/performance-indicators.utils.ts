import type { WorkoutRecord } from '@/interfaces';
import { calculateTrainingConsistency, calculateTrainingFrequency } from './analysis-helpers.utils';

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

  if (consistency >= 95) {
    indicators.push({
      type: 'excellent',
      icon: 'calendar-check',
      title: 'Consistencia Excepcional',
      description: 'Patrón de entrenamiento perfectamente regular - nivel elite',
      value: `${consistency.toFixed(0)}%`,
      progress: consistency,
      category: 'consistency',
    });
  } else if (consistency >= 85) {
    indicators.push({
      type: 'excellent',
      icon: 'calendar-check',
      title: 'Consistencia Excelente',
      description: 'Mantienes un patrón de entrenamiento muy regular',
      value: `${consistency.toFixed(0)}%`,
      progress: consistency,
      category: 'consistency',
    });
  } else if (consistency >= 70) {
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

  if (frequency >= 5.5) {
    indicators.push({
      type: 'excellent',
      icon: 'trending-up',
      title: 'Frecuencia Elite',
      description: 'Frecuencia de entrenamiento de alto rendimiento',
      value: `${frequency.toFixed(1)} días/semana`,
      progress: Math.min(100, frequency * 18),
      category: 'progress',
    });
  } else if (frequency >= 4.5) {
    indicators.push({
      type: 'excellent',
      icon: 'trending-up',
      title: 'Frecuencia Excelente',
      description: 'Entrenas con la frecuencia ideal para progreso',
      value: `${frequency.toFixed(1)} días/semana`,
      progress: Math.min(100, frequency * 18),
      category: 'progress',
    });
  } else if (frequency >= 3.5) {
    indicators.push({
      type: 'good',
      icon: 'trending-up',
      title: 'Frecuencia Buena',
      description: 'Tu frecuencia de entrenamiento es adecuada',
      value: `${frequency.toFixed(1)} días/semana`,
      progress: Math.min(100, frequency * 18),
      category: 'progress',
    });
  } else {
    indicators.push({
      type: 'warning',
      icon: 'trending-down',
      title: 'Frecuencia Baja',
      description: 'Considera aumentar la frecuencia de entrenamiento',
      value: `${frequency.toFixed(1)} días/semana`,
      progress: Math.min(100, frequency * 18),
      category: 'progress',
    });
  }

  // Análisis de volumen
  // Usar solo los últimos 30 días para el cálculo
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentRecords = records.filter(r => new Date(r.date) >= thirtyDaysAgo);

  // Identificar la semana actual
  const today = new Date();
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - today.getDay() + 1);
  const currentWeekKey = currentMonday.toISOString().split('T')[0];

  // Separar registros de semanas completadas vs semana actual
  const completedRecords: WorkoutRecord[] = [];
  const currentWeekRecords: WorkoutRecord[] = [];

  recentRecords.forEach(record => {
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
  const recordsForVolume = completedRecords.length > 0 ? completedRecords : recentRecords;
  const totalVolume = recordsForVolume.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const avgVolumePerSession = totalVolume / recordsForVolume.length;

  // Calcular objetivo dinámico
  const dynamicTarget = calculateDynamicVolumeTarget(records);
  const volumeScore = Math.min(100, (avgVolumePerSession / dynamicTarget) * 100);

  if (volumeScore >= 95) {
    indicators.push({
      type: 'excellent',
      icon: 'layers',
      title: 'Volumen Elite',
      description: 'Volumen de entrenamiento excepcional - nivel avanzado',
      value: `${volumeScore.toFixed(0)}%`,
      progress: volumeScore,
      category: 'volume',
    });
  } else if (volumeScore >= 85) {
    indicators.push({
      type: 'excellent',
      icon: 'layers',
      title: 'Volumen Óptimo',
      description: 'Tu volumen de entrenamiento está bien balanceado',
      value: `${volumeScore.toFixed(0)}%`,
      progress: volumeScore,
      category: 'volume',
    });
  } else if (volumeScore >= 70) {
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

  // Análisis de intensidad (mejorado)
  // Calcular intensidad por ejercicio y luego promediar
  const exerciseGroups = recentRecords.reduce((groups, record) => {
    const exerciseName = record.exercise?.name || 'unknown';
    if (!groups[exerciseName]) {
      groups[exerciseName] = [];
    }
    groups[exerciseName].push(record);
    return groups;
  }, {} as Record<string, WorkoutRecord[]>);

  // Calcular intensidad por ejercicio
  const exerciseIntensities = Object.entries(exerciseGroups).map(([_, exerciseRecords]) => {
    if (exerciseRecords.length === 0) return 0;

    const maxWeight = Math.max(...exerciseRecords.map(r => r.weight));
    const avgWeight = exerciseRecords.reduce((sum, r) => sum + r.weight, 0) / exerciseRecords.length;

    // Intensidad relativa al máximo del ejercicio
    const relativeIntensity = (avgWeight / maxWeight) * 100;

    // Bonus por progresión (si el peso más reciente es mayor al promedio)
    const recentWeight = exerciseRecords[exerciseRecords.length - 1]?.weight || 0;
    const progressionBonus = recentWeight > avgWeight ? 10 : 0;

    const finalIntensity = Math.min(100, relativeIntensity + progressionBonus);

    return finalIntensity;
  });

  // Intensidad promedio ponderada por volumen
  const intensityScore = exerciseIntensities.length > 0 ?
    Math.min(100, exerciseIntensities.reduce((sum, intensity, index) => {
      const exerciseVolume = Object.values(exerciseGroups)[index].reduce((vol, r) => vol + (r.weight * r.reps * r.sets), 0);
      return sum + (intensity * (exerciseVolume / totalVolume));
    }, 0)) : 0;

  if (intensityScore >= 95) {
    indicators.push({
      type: 'excellent',
      icon: 'zap',
      title: 'Intensidad Elite',
      description: 'Intensidad de entrenamiento excepcional - nivel avanzado',
      value: `${intensityScore.toFixed(0)}%`,
      progress: intensityScore,
      category: 'intensity',
    });
  } else if (intensityScore >= 85) {
    indicators.push({
      type: 'excellent',
      icon: 'zap',
      title: 'Intensidad Óptima',
      description: 'Tu intensidad de entrenamiento está en el rango ideal',
      value: `${intensityScore.toFixed(0)}%`,
      progress: intensityScore,
      category: 'intensity',
    });
  } else if (intensityScore >= 70) {
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

// Función para calcular objetivo de volumen dinámico
const calculateDynamicVolumeTarget = (records: WorkoutRecord[]): number => {
  if (records.length === 0) return 2000; // Valor por defecto

  // Usar solo los últimos 60 días para calcular el objetivo
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const recentRecords = records.filter(r => new Date(r.date) >= sixtyDaysAgo);

  if (recentRecords.length === 0) return 2000;

  // Calcular volumen promedio por sesión
  const totalVolume = recentRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const avgVolumePerSession = totalVolume / recentRecords.length;

  // Calcular tendencia de volumen
  const sortedRecords = [...recentRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const midPoint = Math.floor(sortedRecords.length / 2);
  const firstHalf = sortedRecords.slice(0, midPoint);
  const secondHalf = sortedRecords.slice(midPoint);

  const firstHalfVolume = firstHalf.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0) / firstHalf.length;
  const secondHalfVolume = secondHalf.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0) / secondHalf.length;

  // Determinar nivel de experiencia basado en volumen promedio
  let experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  if (avgVolumePerSession > 2000) experienceLevel = 'advanced';
  else if (avgVolumePerSession > 1000) experienceLevel = 'intermediate';
  else experienceLevel = 'beginner';

  // Calcular objetivo dinámico
  let targetVolume = avgVolumePerSession;

  // Ajustar objetivo basado en nivel de experiencia y tendencia
  switch (experienceLevel) {
    case 'beginner':
      // Objetivo: 20% más que el promedio actual
      targetVolume = avgVolumePerSession * 1.2;
      break;
    case 'intermediate':
      // Objetivo: 15% más que el promedio actual
      targetVolume = avgVolumePerSession * 1.15;
      break;
    case 'advanced':
      // Objetivo: 10% más que el promedio actual
      targetVolume = avgVolumePerSession * 1.1;
      break;
  }

  // Bonus por tendencia positiva
  if (secondHalfVolume > firstHalfVolume) {
    targetVolume *= 1.05; // 5% extra si está mejorando
  }

  // Asegurar límites razonables
  targetVolume = Math.max(500, Math.min(5000, targetVolume));

  return targetVolume;
};
