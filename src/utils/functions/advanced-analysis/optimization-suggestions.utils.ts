import type { WorkoutRecord } from '@/interfaces';
import { analyzeDailyTrainingPatterns, analyzeEnergyDemands, analyzeGoalSpecificity, analyzeMuscleGroupBalance, analyzeOptimalVolume, analyzeProgressiveOverload, analyzeRecoveryPatterns, analyzeRepRanges, analyzeSafetyPatterns, analyzeTemporalConsistency, calculateProgressionRate, determineExperienceLevel } from './analysis-helpers.utils';

/**
 * Genera sugerencias de optimización avanzadas basadas en análisis de datos
 */
export const generateAdvancedOptimizationSuggestions = (records: WorkoutRecord[]): string[] => {
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