import type { WorkoutRecord } from '@/interfaces';
import { calculateTrainingConsistency, calculateTrainingFrequency, sortRecordsByDateAscending } from '@/utils/functions';

/**
 * Genera sugerencias de optimización avanzadas basadas en análisis de datos
 */
export const generateAdvancedOptimizationSuggestions = (records: WorkoutRecord[]): string[] => {
  if (records.length === 0) return [];

  // **VALIDACIÓN DE DATOS TEMPORALES**
  const sortedRecords = sortRecordsByDateAscending(records);
  const firstDate = new Date(sortedRecords[0].date);
  const lastDate = new Date(sortedRecords[sortedRecords.length - 1].date);
  const totalDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

  // Si hay menos de 2 semanas de datos, dar sugerencias básicas
  if (totalDays < 14) {
    return [
      'Sigue entrenando de forma consistente durante al menos 2 semanas para recibir análisis detallados',
      'Registra todos tus entrenamientos para obtener métricas más precisas',
      'Mantén un patrón de entrenamiento regular para mejorar el análisis temporal'
    ];
  }

  const suggestions: string[] = [];

  // 1. ANÁLISIS DE FRECUENCIA DE ENTRENAMIENTO
  const trainingFrequency = calculateTrainingFrequency(records, 30);

  if (trainingFrequency < 3) {
    suggestions.push(`Frecuencia baja: ${trainingFrequency.toFixed(1)} días/semana. Considera 3-4 días para mejor progreso`);
  } else if (trainingFrequency > 6) {
    suggestions.push(`Frecuencia muy alta: ${trainingFrequency.toFixed(1)} días/semana. Asegúrate de incluir descanso adecuado`);
  }

  // 2. ANÁLISIS DE CONSISTENCIA
  const consistency = calculateTrainingConsistency(records, 30);

  if (consistency < 60) {
    suggestions.push(`Baja consistencia: ${consistency.toFixed(0)}%. Establece horarios fijos y planifica entrenamientos`);
  }

  // 3. ANÁLISIS DE VARIACIÓN DE EJERCICIOS
  const recentExercises = records.slice(-14); // Últimas 2 semanas
  const uniqueExercises = new Set(recentExercises.map(r => r.exercise?.name)).size;

  if (uniqueExercises < 6) {
    suggestions.push(`Baja variedad: Solo ${uniqueExercises} ejercicios diferentes. Añade 2-3 ejercicios nuevos`);
  }

  // 4. ANÁLISIS DE RANGOS DE REPETICIONES
  const repRanges = records.reduce((acc, r) => {
    if (r.reps <= 6) acc.lowRep += r.reps;
    if (r.reps >= 12) acc.highRep += r.reps;
    acc.total += r.reps;
    return acc;
  }, { lowRep: 0, highRep: 0, total: 0 });

  const lowRepPercent = repRanges.lowRep / (repRanges.total || 1) * 100;
  const highRepPercent = repRanges.highRep / (repRanges.total || 1) * 100;

  if (lowRepPercent > 70) {
    suggestions.push('Dominio de bajas repeticiones. Incluye rangos 8-12 reps para hipertrofia');
  } else if (highRepPercent > 70) {
    suggestions.push('Dominio de altas repeticiones. Incluye rangos 3-6 reps para fuerza máxima');
  }

  // 5. ANÁLISIS DE VOLUMEN TOTAL
  const totalVolume = records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const avgVolumePerSession = totalVolume / records.length;

  if (avgVolumePerSession < 1000) {
    suggestions.push('Volumen bajo por sesión. Considera aumentar series o repeticiones');
  } else if (avgVolumePerSession > 5000) {
    suggestions.push('Volumen muy alto. Revisa si puedes mantener esta intensidad');
  }

  // 6. ANÁLISIS DE PROGRESIÓN DE PESO
  const weightProgression = records.slice(-7).reduce((progression, r, i, arr) => {
    if (i > 0 && r.weight > arr[i - 1].weight) progression++;
    return progression;
  }, 0);

  if (weightProgression < 2) {
    suggestions.push('Progresión de peso lenta. Implementa incrementos sistemáticos');
  }

  return suggestions.slice(0, 6); // Limitar a 6 sugerencias más relevantes
}; 