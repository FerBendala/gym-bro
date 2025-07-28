import type { WorkoutRecord } from '@/interfaces';
import { analyzeFatigue, analyzeIntensityMetrics, analyzeTrainingEfficiency, calculateTrainingDensity, comparePeriods, predictProgress } from './index';

/**
 * Interfaz para análisis avanzado
 */
export interface AdvancedAnalysis {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trainingDensity: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trainingEfficiency: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fatigueAnalysis: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  periodComparisons: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  progressPrediction: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intensityMetrics: any;
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

/**
 * Genera sugerencias de optimización avanzadas basadas en análisis de datos
 */
const generateAdvancedOptimizationSuggestions = (records: WorkoutRecord[]): string[] => {
  if (records.length === 0) return [];

  // **VALIDACIÓN DE DATOS TEMPORALES**
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstDate = new Date(sortedRecords[0].date);
  const lastDate = new Date(sortedRecords[sortedRecords.length - 1].date);
  const totalDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

  // Validación silenciosa de rango temporal

  // Si hay menos de 2 semanas de datos, dar sugerencias básicas
  if (totalDays < 14) {
    return [
      'Sigue entrenando de forma consistente durante al menos 2 semanas para recibir análisis detallados',
      'Registra todos tus entrenamientos para obtener métricas más precisas',
      'Mantén un patrón de entrenamiento regular para mejorar el análisis temporal'
    ];
  }

  const suggestions: string[] = [];

  // 1. ANÁLISIS DE DESEQUILIBRIOS MUSCULARES
  const categoryAnalysis = analyzeMuscleGroupBalance(records);

  // Detectar desequilibrios significativos
  const categories = Object.keys(categoryAnalysis);
  const categoryVolumes = categories.map(cat => categoryAnalysis[cat]);
  const maxVolume = Math.max(...categoryVolumes);
  const minVolume = Math.min(...categoryVolumes);

  if (maxVolume > 0 && minVolume / maxVolume < 0.3) {
    const dominantCategory = categories[categoryVolumes.indexOf(maxVolume)];
    const weakCategory = categories[categoryVolumes.indexOf(minVolume)];
    suggestions.push(`Desequilibrio detectado: ${dominantCategory} domina sobre ${weakCategory}. Aumenta volumen de ${weakCategory} 40-60%`);
  }

  // 2. ANÁLISIS DE PATRONES TEMPORALES
  const dailyPatterns = analyzeDailyTrainingPatterns(records);

  const activeDays = Object.values(dailyPatterns).filter(count => count > 0).length;
  if (activeDays <= 2) {
    suggestions.push(`Distribución subóptima: Solo entrenas ${activeDays} días/semana. Considera 3-4 días distribuidos para mejor recuperación`);
  }

  // 3. ANÁLISIS DE PROGRESIÓN PERSONALIZADA
  const experienceLevel = determineExperienceLevel(records);
  const progressionRate = calculateProgressionRate(records);

  if (experienceLevel === 'beginner' && progressionRate < 2) {
    suggestions.push('Como principiante, deberías progresar más rápido. Aumenta peso 5-10% cada semana en ejercicios básicos');
  } else if (experienceLevel === 'intermediate' && progressionRate < 0.5) {
    suggestions.push('Progresión lenta para nivel intermedio. Implementa periodización: 3 semanas progresivas + 1 descarga');
  } else if (experienceLevel === 'advanced' && progressionRate < 0.2) {
    suggestions.push('Progresión avanzada requiere variación. Alterna fases de fuerza (3-5 reps) y hipertrofia (8-12 reps)');
  }

  // 4. ANÁLISIS DE VARIACIÓN Y PERIODIZACIÓN
  const recentExercises = records.slice(-14); // Últimas 2 semanas
  const uniqueExercises = new Set(recentExercises.map(r => r.exercise)).size;

  if (uniqueExercises < 6) {
    suggestions.push(`Baja variedad: Solo ${uniqueExercises} ejercicios diferentes. Añade 2-3 ejercicios nuevos para estimular adaptación`);
  }

  // 5. ANÁLISIS DE INTENSIDAD POR RANGOS DE REPETICIONES
  const repRangeAnalysis = analyzeRepRanges(records);
  const lowRepPercent = repRangeAnalysis.lowRep / (repRangeAnalysis.total || 1) * 100;
  const highRepPercent = repRangeAnalysis.highRep / (repRangeAnalysis.total || 1) * 100;

  if (lowRepPercent > 70) {
    suggestions.push('Dominio de bajas repeticiones (fuerza). Incluye rangos 8-12 reps para hipertrofia y resistencia');
  } else if (highRepPercent > 70) {
    suggestions.push('Dominio de altas repeticiones. Incluye rangos 3-6 reps para desarrollar fuerza máxima');
  }

  // 6. ANÁLISIS DE CONSISTENCIA TEMPORAL
  const consistencyAnalysis = analyzeTemporalConsistency(records);
  if (consistencyAnalysis.consistencyScore < 60) {
    suggestions.push('Baja consistencia temporal. Establece horarios fijos y planifica entrenamientos con anticipación');
  }

  // 7. ANÁLISIS DE SOBRECARGA PROGRESIVA
  const overloadAnalysis = analyzeProgressiveOverload(records);
  if (overloadAnalysis.overloadScore < 50) {
    suggestions.push('Progresión insuficiente. Implementa incrementos sistemáticos: peso, repeticiones o series');
  }

  // 8. ANÁLISIS DE RECUPERACIÓN
  const recoveryAnalysis = analyzeRecoveryPatterns(records);
  if (recoveryAnalysis.recoveryScore < 40) {
    suggestions.push('Recuperación subóptima. Aumenta días de descanso o reduce intensidad en sesiones consecutivas');
  }

  // 9. ANÁLISIS DE VOLUMEN ÓPTIMO
  const volumeAnalysis = analyzeOptimalVolume(records);
  if (volumeAnalysis.volumeScore < 50) {
    suggestions.push('Volumen subóptimo. Ajusta series y repeticiones según tu nivel y objetivos');
  }

  // 10. ANÁLISIS DE SEGURIDAD
  const safetyAnalysis = analyzeSafetyPatterns(records);
  if (safetyAnalysis.safetyScore < 60) {
    suggestions.push('Patrones de seguridad mejorables. Revisa técnica y evita incrementos agresivos');
  }

  // 11. ANÁLISIS DE ESPECIFICIDAD DE OBJETIVOS
  const goalAnalysis = analyzeGoalSpecificity(records);
  if (goalAnalysis.specificityScore < 70) {
    suggestions.push('Rutina poco específica para tus objetivos. Alinea ejercicios y parámetros con metas');
  }

  // 12. ANÁLISIS DE DEMANDAS ENERGÉTICAS
  const energyAnalysis = analyzeEnergyDemands(records);
  if (energyAnalysis.energyScore < 50) {
    suggestions.push('Demandas energéticas desbalanceadas. Ajusta intensidad y volumen según tu capacidad de recuperación');
  }

  return suggestions.slice(0, 8); // Limitar a 8 sugerencias más relevantes
};

/**
 * Genera indicadores de rendimiento pico mejorados
 */
const generateEnhancedPerformanceIndicators = (records: WorkoutRecord[]): Array<{
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

// Funciones auxiliares
const analyzeMuscleGroupBalance = (records: WorkoutRecord[]) => {
  const categoryAnalysis: { [key: string]: number } = {};

  records.forEach(record => {
    const category = record.exercise?.name.split(' ')[0]; // Simplificado
    categoryAnalysis[category || ''] = (categoryAnalysis[category || ''] || 0) + (record.weight * record.reps * record.sets);
  });

  return categoryAnalysis;
};

const analyzeDailyTrainingPatterns = (records: WorkoutRecord[]) => {
  const dailyPatterns: { [key: string]: number } = {};

  records.forEach(record => {
    const day = new Date(record.date).toLocaleDateString('es-ES', { weekday: 'long' });
    dailyPatterns[day] = (dailyPatterns[day] || 0) + 1;
  });

  return dailyPatterns;
};

const determineExperienceLevel = (records: WorkoutRecord[]) => {
  const totalVolume = records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const avgVolume = totalVolume / records.length;

  if (avgVolume < 1000) return 'beginner';
  if (avgVolume < 3000) return 'intermediate';
  return 'advanced';
};

const calculateProgressionRate = (records: WorkoutRecord[]) => {
  if (records.length < 2) return 0;

  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstHalf = sortedRecords.slice(0, Math.floor(sortedRecords.length / 2));
  const secondHalf = sortedRecords.slice(Math.floor(sortedRecords.length / 2));

  const firstAvg = firstHalf.reduce((sum, r) => sum + r.weight, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, r) => sum + r.weight, 0) / secondHalf.length;

  return firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
};

const analyzeRepRanges = (records: WorkoutRecord[]) => {
  let lowRep = 0;
  let highRep = 0;
  let total = 0;

  records.forEach(record => {
    total += record.reps;
    if (record.reps <= 6) lowRep += record.reps;
    if (record.reps >= 12) highRep += record.reps;
  });

  return { lowRep, highRep, total };
};

const analyzeTemporalConsistency = (records: WorkoutRecord[]) => {
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const daysBetween = sortedRecords.length > 1 ?
    (new Date(sortedRecords[sortedRecords.length - 1].date).getTime() - new Date(sortedRecords[0].date).getTime()) / (1000 * 60 * 60 * 24) : 0;

  const consistencyScore = Math.min(100, (records.length / Math.max(1, daysBetween / 7)) * 100);

  return { consistencyScore };
};

const analyzeProgressiveOverload = (records: WorkoutRecord[]) => {
  if (records.length < 2) return { overloadScore: 0 };

  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let progressionCount = 0;

  for (let i = 1; i < sortedRecords.length; i++) {
    if (sortedRecords[i].weight > sortedRecords[i - 1].weight) {
      progressionCount++;
    }
  }

  const overloadScore = (progressionCount / (sortedRecords.length - 1)) * 100;
  return { overloadScore };
};

const analyzeRecoveryPatterns = (records: WorkoutRecord[]) => {
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let consecutiveDays = 0;
  let maxConsecutive = 0;

  for (let i = 1; i < sortedRecords.length; i++) {
    const daysDiff = (new Date(sortedRecords[i].date).getTime() - new Date(sortedRecords[i - 1].date).getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff <= 1) {
      consecutiveDays++;
      maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
    } else {
      consecutiveDays = 0;
    }
  }

  const recoveryScore = maxConsecutive <= 3 ? 100 : Math.max(0, 100 - (maxConsecutive - 3) * 20);
  return { recoveryScore };
};

const analyzeOptimalVolume = (records: WorkoutRecord[]) => {
  const totalVolume = records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const avgVolume = totalVolume / records.length;

  // Volumen óptimo depende del nivel de experiencia
  const experienceLevel = determineExperienceLevel(records);
  let optimalVolume = 1000;

  if (experienceLevel === 'intermediate') optimalVolume = 2000;
  if (experienceLevel === 'advanced') optimalVolume = 3000;

  const volumeScore = Math.min(100, (avgVolume / optimalVolume) * 100);
  return { volumeScore };
};

const analyzeSafetyPatterns = (records: WorkoutRecord[]) => {
  if (records.length < 2) return { safetyScore: 50 };

  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let safeProgression = 0;

  for (let i = 1; i < sortedRecords.length; i++) {
    const weightIncrease = ((sortedRecords[i].weight - sortedRecords[i - 1].weight) / sortedRecords[i - 1].weight) * 100;
    if (weightIncrease <= 10) safeProgression++;
  }

  const safetyScore = (safeProgression / (sortedRecords.length - 1)) * 100;
  return { safetyScore };
};

const analyzeGoalSpecificity = (records: WorkoutRecord[]) => {
  const repRanges = analyzeRepRanges(records);
  const avgReps = repRanges.total / records.length;

  // Especificidad basada en rangos de repeticiones
  let specificityScore = 50;

  if (avgReps >= 8 && avgReps <= 12) specificityScore = 80; // Hipertrofia
  else if (avgReps >= 3 && avgReps <= 6) specificityScore = 80; // Fuerza
  else if (avgReps >= 12) specificityScore = 70; // Resistencia

  return { specificityScore };
};

const analyzeEnergyDemands = (records: WorkoutRecord[]) => {
  const totalVolume = records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const avgVolume = totalVolume / records.length;

  // Demandas energéticas basadas en volumen e intensidad
  const energyScore = Math.min(100, Math.max(0, 100 - (avgVolume / 100)));
  return { energyScore };
}; 