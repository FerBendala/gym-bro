import { clamp, roundToDecimals } from './math-utils';
import { calculateVolume } from './volume-calculations';

import type { WorkoutRecord } from '@/interfaces';

/**
 * Obtiene el nombre del día de la semana en español
 */
export const getDayName = (date: Date): string => {
  return date.toLocaleDateString('es-ES', { weekday: 'long' });
};

/**
 * Calcula el VOLUMEN TOTAL por día de la semana (agrupa por fecha)
 * CORRECCIÓN CRÍTICA: Suma volumen total del día, no promedio de registros individuales
 */
export const getVolumeByDayOfWeek = (records: WorkoutRecord[]): Record<string, number> => {
  // Agrupar por fecha completa primero
  const volumeByDate: Record<string, number> = {};

  records.forEach(record => {
    const dateKey = record.date.toISOString().split('T')[0]; // YYYY-MM-DD
    const volume = calculateVolume(record);

    if (!volumeByDate[dateKey]) {
      volumeByDate[dateKey] = 0;
    }
    volumeByDate[dateKey] += volume; // Sumar volumen total del día
  });

  // Ahora agrupar por día de la semana usando el volumen total de cada fecha
  const volumeByDay: Record<string, number[]> = {};

  Object.entries(volumeByDate).forEach(([dateKey, totalDayVolume]) => {
    const date = new Date(dateKey);
    const dayName = getDayName(date);

    if (!volumeByDay[dayName]) {
      volumeByDay[dayName] = [];
    }
    volumeByDay[dayName].push(totalDayVolume);
  });

  // Calcular promedio por día de la semana
  const avgVolumeByDay: Record<string, number> = {};
  Object.entries(volumeByDay).forEach(([day, dayVolumes]) => {
    avgVolumeByDay[day] = dayVolumes.reduce((sum, vol) => sum + vol, 0) / dayVolumes.length;
  });

  return avgVolumeByDay;
};

/**
 * Normaliza un volumen de un día específico basado en el patrón semanal
 * Usa volumen total del día, no registro individual
 */
export const normalizeVolumeByDay = (
  date: Date,
  dayTotalVolume: number,
  avgVolumeByDay: Record<string, number>,
): number => {
  const dayName = getDayName(date);
  const expectedVolumeForDay = avgVolumeByDay[dayName] || dayTotalVolume;

  // Si no hay datos históricos para este día, no normalizar
  if (expectedVolumeForDay === 0) return dayTotalVolume;

  // Factor de normalización: qué tan arriba/abajo del promedio está
  const normalizationFactor = dayTotalVolume / expectedVolumeForDay;

  // Promedio semanal general
  const weeklyAvg = Object.values(avgVolumeByDay).reduce((sum, vol) => sum + vol, 0) /
    Object.values(avgVolumeByDay).length;

  // Volumen normalizado = factor × promedio semanal
  return normalizationFactor * weeklyAvg;
};

/**
 * Calcula tendencia de volumen normalizada por día de la semana
 * CORRECCIÓN CRÍTICA: Límites ajustados para volúmenes altos realistas
 */
export const calculateNormalizedVolumeTrend = (records: WorkoutRecord[]): number => {
  if (records.length < 6) return 0; // Necesitamos datos suficientes

  // Calcular volúmenes totales por fecha
  const volumeByDate: Record<string, { volume: number; date: Date }> = {};

  records.forEach(record => {
    const dateKey = record.date.toISOString().split('T')[0];
    const volume = calculateVolume(record);

    if (!volumeByDate[dateKey]) {
      volumeByDate[dateKey] = { volume: 0, date: new Date(record.date) };
    }
    volumeByDate[dateKey].volume += volume;
  });

  // Convertir a array y ordenar cronológicamente
  const dailyVolumes = Object.values(volumeByDate).sort((a, b) =>
    a.date.getTime() - b.date.getTime(),
  );

  if (dailyVolumes.length < 4) return 0; // Necesitamos al menos 4 días

  // Calcular patrones por día de la semana usando volúmenes totales
  const avgVolumeByDay = getVolumeByDayOfWeek(records);

  // Normalizar todos los días
  const normalizedDays = dailyVolumes.map(({ volume, date }) => ({
    date,
    originalVolume: volume,
    normalizedVolume: normalizeVolumeByDay(date, volume, avgVolumeByDay),
  }));

  // Usar períodos de tiempo reales para calcular tendencia
  const { length } = normalizedDays;
  const halfPoint = Math.floor(length / 2);

  const olderPeriod = normalizedDays.slice(0, halfPoint);
  const recentPeriod = normalizedDays.slice(halfPoint);

  const olderAvg = olderPeriod.reduce((sum, d) => sum + d.normalizedVolume, 0) / olderPeriod.length;
  const recentAvg = recentPeriod.reduce((sum, d) => sum + d.normalizedVolume, 0) / recentPeriod.length;

  if (olderAvg === 0) return 0;

  // Calcular días transcurridos entre períodos
  const oldestDate = olderPeriod[0].date.getTime();
  const newestDate = recentPeriod[recentPeriod.length - 1].date.getTime();
  const daysBetween = Math.max(1, (newestDate - oldestDate) / (1000 * 60 * 60 * 24));

  // Tendencia diaria realista
  const dailyTrend = (recentAvg - olderAvg) / daysBetween;

  // Convertir a tendencia semanal
  const weeklyTrend = dailyTrend * 7;

  // LÍMITES REALISTAS AJUSTADOS: Para volúmenes altos de entrenamiento completo
  // Límite más conservador: máximo ±5% del volumen promedio por semana
  const avgVolume = (olderAvg + recentAvg) / 2;
  const maxReasonableTrend = avgVolume * 0.05; // 5% del volumen promedio (más conservador)

  // Límite absoluto adicional: máximo ±300kg/sem para cualquier volumen
  const absoluteMaxTrend = 300;
  const finalMaxTrend = Math.min(maxReasonableTrend, absoluteMaxTrend);

  // Limitar la tendencia a un rango realista
  const limitedTrend = clamp(weeklyTrend, -finalMaxTrend, finalMaxTrend);

  return roundToDecimals(limitedTrend);
};

/**
 * Predice volumen para un día específico considerando patrón semanal
 * CORRECCIÓN CRÍTICA: Manejo inteligente de volúmenes altos
 */
export const predictVolumeForDay = (
  records: WorkoutRecord[],
  targetDate: Date,
  volumeTrend: number,
): number => {
  const avgVolumeByDay = getVolumeByDayOfWeek(records);
  const targetDayName = getDayName(targetDate);

  // Volumen base esperado para ese día
  const baseDayVolume = avgVolumeByDay[targetDayName] || 0;

  if (baseDayVolume === 0) {
    // Si no hay datos para ese día, usar promedio general
    const allDays = Object.values(avgVolumeByDay).filter(v => v > 0);
    return allDays.length > 0 ? allDays.reduce((a, b) => a + b) / allDays.length : 0;
  }

  // CORRECCIÓN INTELIGENTE: Aplicar tendencia como porcentaje para volúmenes altos
  const avgWeeklyVolume = Object.values(avgVolumeByDay).reduce((a, b) => a + b, 0);
  const trendPercentage = avgWeeklyVolume > 0 ? volumeTrend / avgWeeklyVolume : 0;

  // Aplicar tendencia como porcentaje (más realista para volúmenes altos)
  const predictedVolume = baseDayVolume * (1 + trendPercentage);

  // Validación: no permitir cambios mayores al 20% del volumen base
  const maxChange = baseDayVolume * 0.2;
  const limitedVolume = Math.max(
    baseDayVolume - maxChange,
    Math.min(baseDayVolume + maxChange, predictedVolume),
  );

  return roundToDecimals(Math.max(0, limitedVolume));
};

/**
 * Obtiene información de contexto sobre patrones semanales
 * Sin valores hardcodeados, lógica robusta
 */
export const getWeeklyVolumeInsights = (records: WorkoutRecord[]): {
  avgVolumeByDay: Record<string, number>;
  peakDay: string;
  restDay: string;
  weeklyPattern: string;
} => {
  const avgVolumeByDay = getVolumeByDayOfWeek(records);

  // Encontrar días con datos reales
  const daysWithData = Object.entries(avgVolumeByDay).filter(([, volume]) => volume > 0);

  if (daysWithData.length === 0) {
    return {
      avgVolumeByDay,
      peakDay: 'Sin datos',
      restDay: 'Sin datos',
      weeklyPattern: 'Sin datos',
    };
  }

  // Encontrar día pico y día de descanso SIN valores hardcodeados
  let peakDay = daysWithData[0][0];
  let restDay = daysWithData[0][0];
  let maxVolume = daysWithData[0][1];
  let minVolume = daysWithData[0][1];

  daysWithData.forEach(([day, volume]) => {
    if (volume > maxVolume) {
      maxVolume = volume;
      peakDay = day;
    }
    if (volume < minVolume) {
      minVolume = volume;
      restDay = day;
    }
  });

  // Análisis del patrón semanal
  let pattern: string;
  if (daysWithData.length < 3) {
    pattern = 'Datos insuficientes';
  } else if (maxVolume > minVolume * 2) {
    pattern = 'Muy variable';
  } else if (maxVolume > minVolume * 1.5) {
    pattern = 'Variable';
  } else {
    pattern = 'Consistente';
  }

  return {
    avgVolumeByDay,
    peakDay,
    restDay,
    weeklyPattern: pattern,
  };
};
