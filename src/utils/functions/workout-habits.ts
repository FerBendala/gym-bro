import type { WorkoutRecord } from '@/interfaces';
import { getHours } from 'date-fns';
import { calculateDayMetrics } from './day-metrics';
import { clamp, roundToDecimals } from './math-utils';
import type { WorkoutHabits } from './trends-interfaces';
import { calculateWorkoutStreaks } from './workout-streaks';

/**
 * Analiza hábitos de entrenamiento
 */
export const analyzeWorkoutHabits = (records: WorkoutRecord[]): WorkoutHabits => {
  if (records.length === 0) {
    return {
      preferredDay: 'N/A',
      preferredTime: 'N/A',
      avgSessionDuration: 0,
      consistencyScore: 0,
      peakProductivityHours: [],
      restDayPattern: 'N/A',
      weeklyFrequency: 0,
      habitStrength: 'Muy Débil',
      scheduleFlexibility: 'Muy Rígido',
      motivationPattern: 'Inconsistente',
      bestPerformanceDay: 'N/A',
      bestPerformanceTime: 'N/A',
      workoutStreaks: { current: 0, longest: 0, average: 0 },
      behaviorInsights: [],
      recommendations: [],
      riskFactors: []
    };
  }

  const dayMetrics = calculateDayMetrics(records);

  // Día preferido
  const preferredDay = dayMetrics[0]?.dayName || 'N/A';

  // Hora preferida basada en análisis simple de horarios
  const hourCounts: Record<string, number> = {};
  records.forEach(record => {
    const hour = getHours(new Date(record.date));
    let timeRange: string;
    if (hour >= 6 && hour < 12) timeRange = 'Mañana';
    else if (hour >= 12 && hour < 18) timeRange = 'Tarde';
    else if (hour >= 18 && hour < 22) timeRange = 'Noche';
    else timeRange = 'Madrugada';

    hourCounts[timeRange] = (hourCounts[timeRange] || 0) + 1;
  });

  const preferredTime = Object.entries(hourCounts).reduce((a, b) =>
    hourCounts[a[0]] > hourCounts[b[0]] ? a : b
  )?.[0] || 'N/A';

  // Duración promedio estimada (mejorado)
  const exerciseCount = records.length;
  const uniqueSessions = new Set(records.map(r => r.date)).size;
  const avgExercisesPerSession = Math.max(1, Math.round(exerciseCount / Math.max(1, uniqueSessions)));
  const avgSessionDuration = Math.round(clamp(avgExercisesPerSession * 8 + 15, 30, 180)); // Entre 30-180 minutos

  // Score de consistencia (variabilidad entre días)
  const dayWorkouts = dayMetrics.map(d => d.workouts);
  const maxWorkouts = Math.max(...dayWorkouts);
  const minWorkouts = Math.min(...dayWorkouts.filter(w => w > 0));
  const consistencyScore = maxWorkouts > 0 ? Math.round((minWorkouts / maxWorkouts) * 100) : 0;

  // Horas de mayor productividad (simplificado)
  const sortedHourRanges = Object.entries(hourCounts).sort((a, b) => b[1] - a[1]);
  const topTimePatterns = sortedHourRanges.slice(0, 2).map(([timeRange]) => timeRange);

  // Patrón de descanso
  const workoutDays = dayMetrics.filter(d => d.workouts > 0).length;
  const restDayPattern = workoutDays <= 3 ? '4+ días descanso' :
    workoutDays <= 5 ? '1-2 días descanso' : 'Entrenamiento diario';

  // **CORRECCIÓN CLAVE**: Calcular frecuencia semanal de entrenamientos (no días)
  const weeklyData = new Map<string, number>();

  records.forEach(record => {
    const date = new Date(record.date);
    // Obtener el lunes de la semana
    const monday = new Date(date);
    monday.setDate(date.getDate() - date.getDay() + 1);
    const weekKey = monday.toISOString().split('T')[0];

    if (!weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, 0);
    }
    weeklyData.set(weekKey, weeklyData.get(weekKey)! + 1);
  });

  // Calcular frecuencia semanal promedio
  const totalWorkouts = Array.from(weeklyData.values()).reduce((sum, workouts) => sum + workouts, 0);
  const weeklyFrequency = totalWorkouts > 0
    ? roundToDecimals((Array.from(weeklyData.values()).reduce((sum, workouts) => sum + workouts, 0) / weeklyData.size))
    : 0;

  // Calcular fuerza del hábito basado en consistencia y frecuencia
  let habitStrength: WorkoutHabits['habitStrength'];
  const combinedScore = (consistencyScore + (weeklyFrequency * 20)) / 2;
  if (combinedScore >= 80) habitStrength = 'Muy Fuerte';
  else if (combinedScore >= 65) habitStrength = 'Fuerte';
  else if (combinedScore >= 45) habitStrength = 'Moderado';
  else if (combinedScore >= 25) habitStrength = 'Débil';
  else habitStrength = 'Muy Débil';

  // Calcular flexibilidad del horario
  let scheduleFlexibility: WorkoutHabits['scheduleFlexibility'];
  const timeVariety = Object.keys(hourCounts).length;
  if (timeVariety >= 4) scheduleFlexibility = 'Muy Flexible';
  else if (timeVariety >= 3) scheduleFlexibility = 'Flexible';
  else if (timeVariety >= 2) scheduleFlexibility = 'Rígido';
  else scheduleFlexibility = 'Muy Rígido';

  // Calcular patrón de motivación (basado en tendencia reciente vs histórica)
  let motivationPattern: WorkoutHabits['motivationPattern'];
  const recentRecords = records.slice(-14); // Últimas 2 semanas
  const olderRecords = records.slice(-28, -14); // 2 semanas anteriores
  const recentFreq = recentRecords.length / 2;
  const olderFreq = olderRecords.length / 2;

  if (Math.abs(recentFreq - olderFreq) < 0.5) motivationPattern = 'Estable';
  else if (recentFreq > olderFreq) motivationPattern = 'Creciente';
  else if (recentFreq < olderFreq) motivationPattern = 'Decreciente';
  else motivationPattern = 'Inconsistente';

  // Mejor día y hora de rendimiento (basado en volumen promedio)
  const bestPerformanceDay = dayMetrics.length > 0 ? dayMetrics.reduce((best, current) =>
    current.avgVolume > best.avgVolume ? current : best
  ).dayName : 'N/A';

  // Mejor hora de rendimiento basado en volumen por rango horario
  let bestPerformanceTime = 'N/A';
  if (Object.keys(hourCounts).length > 0) {
    const hourVolumes: Record<string, { volume: number; count: number }> = {};
    records.forEach(record => {
      const hour = getHours(new Date(record.date));
      let timeRange: string;
      if (hour >= 6 && hour < 12) timeRange = 'Mañana';
      else if (hour >= 12 && hour < 18) timeRange = 'Tarde';
      else if (hour >= 18 && hour < 22) timeRange = 'Noche';
      else timeRange = 'Madrugada';

      const volume = record.weight * record.reps * record.sets;
      if (!hourVolumes[timeRange]) hourVolumes[timeRange] = { volume: 0, count: 0 };
      hourVolumes[timeRange].volume += volume;
      hourVolumes[timeRange].count++;
    });

    bestPerformanceTime = Object.entries(hourVolumes).reduce((best, [timeRange, data]) => {
      const avgVolume = data.volume / data.count;
      const bestAvgVolume = hourVolumes[best].volume / hourVolumes[best].count;
      return avgVolume > bestAvgVolume ? timeRange : best;
    }, Object.keys(hourVolumes)[0]);
  }

  // Calcular rachas de entrenamiento
  const workoutStreaks = calculateWorkoutStreaks(records);

  // Generar insights de comportamiento
  const behaviorInsights: string[] = [];
  if (consistencyScore >= 70) {
    behaviorInsights.push('Tienes hábitos de entrenamiento muy consistentes');
  } else if (consistencyScore >= 50) {
    behaviorInsights.push('Tus hábitos de entrenamiento son moderadamente consistentes');
  } else {
    behaviorInsights.push('Tus hábitos de entrenamiento necesitan más consistencia');
  }

  if (timeVariety >= 3) {
    behaviorInsights.push('Tienes flexibilidad en tus horarios de entrenamiento');
  } else {
    behaviorInsights.push('Prefieres entrenar en horarios específicos');
  }

  if (workoutStreaks.longest >= 7) {
    behaviorInsights.push(`Tu racha más larga fue de ${workoutStreaks.longest} días`);
  }

  // Generar recomendaciones personalizadas
  const recommendations: string[] = [];
  if (consistencyScore < 50) {
    recommendations.push('Establece horarios fijos para crear rutina');
  }
  if (weeklyFrequency < 3) {
    recommendations.push('Intenta aumentar a 3-4 entrenamientos por semana');
  }
  if (scheduleFlexibility === 'Muy Rígido') {
    recommendations.push('Prueba entrenar en diferentes horarios para más flexibilidad');
  }
  if (motivationPattern === 'Decreciente') {
    recommendations.push('Considera variar tu rutina para mantener la motivación');
  }
  if (workoutStreaks.current === 0) {
    recommendations.push('Enfócate en crear una nueva racha de entrenamientos');
  }

  // Identificar factores de riesgo
  const riskFactors: string[] = [];
  if (consistencyScore < 30) {
    riskFactors.push('Baja consistencia puede llevar a pérdida de progreso');
  }
  if (weeklyFrequency < 2) {
    riskFactors.push('Frecuencia muy baja puede no generar adaptaciones');
  }
  if (motivationPattern === 'Decreciente') {
    riskFactors.push('Patrón decreciente sugiere riesgo de abandono');
  }
  if (workoutStreaks.current === 0 && workoutStreaks.longest > 7) {
    riskFactors.push('Has perdido rachas largas anteriores');
  }

  return {
    preferredDay,
    preferredTime: preferredTime.split(' (')[0], // Solo la parte del nombre
    avgSessionDuration,
    consistencyScore,
    peakProductivityHours: topTimePatterns,
    restDayPattern,
    weeklyFrequency,
    habitStrength,
    scheduleFlexibility,
    motivationPattern,
    bestPerformanceDay,
    bestPerformanceTime,
    workoutStreaks,
    behaviorInsights,
    recommendations,
    riskFactors
  };
}; 