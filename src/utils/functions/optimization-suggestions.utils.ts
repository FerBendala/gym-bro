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
      'Mantén un patrón de entrenamiento regular para mejorar el análisis temporal',
    ];
  }

  const suggestions: string[] = [];

  // 1. ANÁLISIS DE FRECUENCIA DE ENTRENAMIENTO
  const trainingFrequency = calculateTrainingFrequency(records, 30);

  if (trainingFrequency < 3) {
    suggestions.push(`Tu frecuencia actual es baja (${trainingFrequency.toFixed(1)} días/semana). Para mejor progreso, intenta entrenar 3-4 días por semana de forma consistente.`);
  } else if (trainingFrequency > 6) {
    suggestions.push(`Tu frecuencia es muy alta (${trainingFrequency.toFixed(1)} días/semana). Asegúrate de incluir al menos 1-2 días de descanso completo por semana para evitar sobreentrenamiento.`);
  } else if (trainingFrequency >= 4.5) {
    suggestions.push(`Tu frecuencia es excelente (${trainingFrequency.toFixed(1)} días/semana). Para optimizar tu rendimiento, considera implementar un ciclo de entrenamiento de 4 semanas: 3 semanas progresivas + 1 semana de descanso activo.`);
  }

  // 2. ANÁLISIS DE CONSISTENCIA
  const consistency = calculateTrainingConsistency(records, 30);

  if (consistency < 60) {
    suggestions.push(`Tu consistencia es baja (${consistency.toFixed(0)}%). Establece horarios fijos para entrenar y planifica tus sesiones con anticipación para mejorar la regularidad.`);
  } else if (consistency >= 85) {
    suggestions.push(`Tu consistencia es excepcional (${consistency.toFixed(0)}%). Para llevar tu entrenamiento al siguiente nivel, considera implementar un programa estructurado con fases específicas: fuerza, hipertrofia y potencia.`);
  }

  // 3. ANÁLISIS DE VARIACIÓN DE EJERCICIOS
  const recentExercises = records.slice(-14); // Últimas 2 semanas
  const uniqueExercises = new Set(recentExercises.map(r => r.exercise?.name)).size;

  if (uniqueExercises < 6) {
    suggestions.push(`Tu variedad de ejercicios es baja (solo ${uniqueExercises} ejercicios diferentes). Añade 2-3 ejercicios nuevos a tu rutina para trabajar diferentes grupos musculares y evitar estancamiento.`);
  } else if (uniqueExercises >= 10) {
    suggestions.push(`Tu variedad es alta (${uniqueExercises} ejercicios). Para optimizar el progreso, considera especializarte en 2-3 movimientos principales y usar los demás como ejercicios complementarios.`);
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
    suggestions.push('Entrenas principalmente con bajas repeticiones (fuerza máxima). Para mejorar la hipertrofia, incluye ejercicios con 8-12 repeticiones en tu rutina.');
  } else if (highRepPercent > 70) {
    suggestions.push('Entrenas principalmente con altas repeticiones (resistencia). Para mejorar la fuerza máxima, incluye ejercicios con 3-6 repeticiones en tu rutina.');
  } else {
    suggestions.push('Tu balance de repeticiones es bueno. Para optimizar ambos aspectos, considera alternar entre semanas de fuerza (3-6 reps) y semanas de hipertrofia (8-12 reps).');
  }

  // 5. ANÁLISIS DE VOLUMEN TOTAL
  const totalVolume = records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const avgVolumePerSession = totalVolume / records.length;

  if (avgVolumePerSession < 1000) {
    suggestions.push('Tu volumen por sesión es bajo. Considera aumentar el número de series o repeticiones para mejorar la estimulación muscular.');
  } else if (avgVolumePerSession > 5000) {
    suggestions.push('Tu volumen es muy alto. Revisa si puedes mantener esta intensidad a largo plazo sin riesgo de sobreentrenamiento.');
  } else {
    suggestions.push('Tu volumen está bien balanceado. Para optimizar la adaptación, considera variar el volumen semanalmente: semanas altas (más series) y semanas bajas (menos series).');
  }

  // 6. ANÁLISIS DE PROGRESIÓN DE PESO
  const weightProgression = records.slice(-7).reduce((progression, r, i, arr) => {
    if (i > 0 && r.weight > arr[i - 1].weight) progression++;
    return progression;
  }, 0);

  if (weightProgression < 2) {
    suggestions.push('Tu progresión de peso es lenta. Implementa incrementos sistemáticos de 2-5% cuando puedas completar todas las repeticiones con buena forma.');
  } else if (weightProgression >= 4) {
    suggestions.push('Tu progresión de peso es excelente. Para optimizar la adaptación, considera periodizar la intensidad: semanas de carga pesada (80-90%) y semanas de carga moderada (70-80%).');
  }

  // 7. SUGERENCIAS AVANZADAS PARA RENDIMIENTO ÓPTIMO
  if (trainingFrequency >= 4.5 && consistency >= 85) {
    suggestions.push('Tu rendimiento es excepcional. Considera implementar un ciclo de entrenamiento de 4 semanas: 3 semanas progresivas + 1 semana de descanso activo.');
    suggestions.push('Para mantener el progreso a largo plazo, implementa una semana de descanso activo cada 4-6 semanas con 60-70% de la intensidad habitual.');
  }

  // 8. ANÁLISIS DE PATRONES TEMPORALES
  const weeklyPattern = records.slice(-21).reduce((pattern, r) => {
    const day = new Date(r.date).getDay();
    pattern[day] = (pattern[day] || 0) + 1;
    return pattern;
  }, {} as Record<number, number>);

  const mostFrequentDay = Object.entries(weeklyPattern).sort((a, b) => b[1] - a[1])[0];
  if (mostFrequentDay && mostFrequentDay[1] > 3) {
    suggestions.push(`Entrenas principalmente los ${getDayName(parseInt(mostFrequentDay[0]))}s. Considera distribuir mejor la carga semanal para evitar sobrecarga en un solo día.`);
  }

  // 9. SUGERENCIAS ESPECÍFICAS PARA RENDIMIENTO EXCEPCIONAL
  if (trainingFrequency >= 4.5 && consistency >= 85 && uniqueExercises >= 8) {
    suggestions.push('Con tu rendimiento actual, considera implementar un programa de entrenamiento estructurado con fases específicas: fuerza (4 semanas), hipertrofia (4 semanas), potencia (2 semanas).');
  }

  // 10. SUGERENCIAS DE NUTRICIÓN Y RECUPERACIÓN
  if (trainingFrequency >= 4.5) {
    suggestions.push('Con tu frecuencia de entrenamiento, asegúrate de mantener una nutrición adecuada: 1.6-2.2g de proteína por kg de peso corporal y hidratación constante.');
  }

  // 11. SUGERENCIAS DE MONITOREO
  if (consistency >= 85) {
    suggestions.push('Considera llevar un diario de entrenamiento más detallado para monitorear tu progreso y ajustar tu programa según tus respuestas individuales.');
  }

  return suggestions.slice(0, 6); // Limitar a 6 sugerencias más relevantes
};

// Función auxiliar para obtener nombre del día
const getDayName = (dayIndex: number): string => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dayIndex];
};
