import { WorkoutRecord } from '../../interfaces';

// ========================================
// 🎯 UTILIDADES MATEMÁTICAS COMPARTIDAS
// ========================================

/**
 * Redondea un número a 2 decimales
 * Patrón usado +10 veces: Math.round(x * 100) / 100
 */
export const roundToDecimals = (value: number, decimals: number = 2): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

/**
 * Clamp: Limita un valor entre un mínimo y máximo
 * Patrón usado +15 veces: Math.max(min, Math.min(max, value))
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

// ========================================
// 🎯 UTILIDADES DE PESO COMPARTIDAS
// ========================================

/**
 * Calcula el peso máximo de una lista de registros
 * Patrón usado en 6 archivos: Math.max(...records.map(r => r.weight))
 */
export const getMaxWeight = (records: WorkoutRecord[]): number => {
  if (records.length === 0) return 0;
  return Math.max(...records.map(r => r.weight));
};

/**
 * Calcula el peso promedio de una lista de registros
 * Patrón común para baselines y promedios
 */
export const getAverageWeight = (records: WorkoutRecord[]): number => {
  if (records.length === 0) return 0;
  const sum = records.reduce((acc, r) => acc + r.weight, 0);
  return sum / records.length;
};

/**
 * Obtiene el peso máximo redondeado a 2 decimales
 * Combina los dos patrones más comunes
 */
export const getMaxWeightRounded = (records: WorkoutRecord[]): number => {
  return roundToDecimals(getMaxWeight(records));
};

// ========================================
// 🎯 UTILIDADES DE FECHA COMPARTIDAS
// ========================================

/**
 * Filtra registros por los últimos X días
 * Patrón usado en getRecentRecords y otros componentes
 */
export const getRecordsFromLastDays = (records: WorkoutRecord[], days: number = 30): WorkoutRecord[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentRecords = records.filter(r => new Date(r.date) >= cutoffDate);

  // Fallback inteligente si no hay datos recientes
  if (recentRecords.length === 0) {
    const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sortedRecords.slice(0, 5);
  }

  return recentRecords;
};

/**
 * Crea una nueva fecha retrocediendo X días
 * Patrón usado en timeline y análisis temporales
 */
export const subtractDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() - days);
  return newDate;
};

/**
 * Crea una nueva fecha retrocediendo X semanas
 * Patrón usado en timelines y predicciones
 */
export const subtractWeeks = (date: Date, weeks: number): Date => {
  return subtractDays(date, weeks * 7);
};

// ========================================
// 🎯 UTILIDADES DE VALIDACIÓN COMPARTIDAS
// ========================================

/**
 * Valida tendencia de fuerza en rango realista
 * Patrón usado en múltiples validaciones: clamp(-2, 2, value)
 */
export const validateStrengthTrend = (trend: number): number => {
  return roundToDecimals(clamp(trend, -2, 2));
};

/**
 * Valida crecimiento mensual en rango realista
 * Patrón usado en validaciones: clamp(-5, 10, value)
 */
export const validateMonthlyGrowth = (growth: number): number => {
  return roundToDecimals(clamp(growth, -5, 10));
};

/**
 * Valida tiempo a próximo PR en semanas
 * Patrón usado en predicciones: clamp(1, 52, value)
 */
export const validateTimeToNextPR = (weeks: number): number => {
  return clamp(weeks || 8, 1, 52);
};

/**
 * Valida porcentaje de confianza
 * Patrón usado en gauges: clamp(5, 95, value)
 */
export const validateConfidence = (confidence: number): number => {
  return clamp(confidence || 50, 5, 95);
};

/**
 * Valida mejora de peso en rango realista
 * Patrón usado en validaciones: clamp(0, 15, value)
 */
export const validateImprovement = (improvement: number): number => {
  return roundToDecimals(clamp(improvement, 0, 15));
};

// ========================================
// 🎯 UTILIDADES DE ANÁLISIS COMPARTIDAS
// ========================================

/**
 * Calcula el peso actual validado (peso máximo reciente)
 * Combina getRecordsFromLastDays + getMaxWeightRounded
 */
export const getCurrentWeight = (records: WorkoutRecord[], days: number = 30): number => {
  const recentRecords = getRecordsFromLastDays(records, days);
  return getMaxWeightRounded(recentRecords);
};

/**
 * Calcula baseline 1RM como promedio de registros recientes
 * Lógica común para baselines de predicciones
 */
export const getBaseline1RM = (records: WorkoutRecord[], days: number = 30): number => {
  const recentRecords = getRecordsFromLastDays(records, days);
  if (recentRecords.length === 0) return 0;

  const baseline = getAverageWeight(recentRecords);
  return roundToDecimals(baseline);
};

/**
 * Calcula la mejora total validada
 * predictedWeight - currentWeight con validación
 */
export const calculateImprovement = (records: WorkoutRecord[], predictedWeight: number): number => {
  const currentWeight = getCurrentWeight(records);
  const improvement = predictedWeight - currentWeight;
  return validateImprovement(improvement);
};

// ========================================
// 🎯 NORMALIZACIÓN POR DÍA DE LA SEMANA
// ========================================

/**
 * Calcula el volumen real de un registro (sets × reps × peso)
 */
const calculateRecordVolume = (record: WorkoutRecord): number => {
  return record.sets * record.reps * record.weight;
};

/**
 * Obtiene el nombre del día de la semana en español
 */
export const getDayName = (date: Date): string => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
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
    const volume = calculateRecordVolume(record);

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
 * CORRECCIÓN: Usa volumen total del día, no registro individual
 */
export const normalizeVolumeByDay = (
  date: Date,
  dayTotalVolume: number,
  avgVolumeByDay: Record<string, number>
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
    const volume = calculateRecordVolume(record);

    if (!volumeByDate[dateKey]) {
      volumeByDate[dateKey] = { volume: 0, date: new Date(record.date) };
    }
    volumeByDate[dateKey].volume += volume;
  });

  // Convertir a array y ordenar cronológicamente
  const dailyVolumes = Object.values(volumeByDate).sort((a, b) =>
    a.date.getTime() - b.date.getTime()
  );

  if (dailyVolumes.length < 4) return 0; // Necesitamos al menos 4 días

  // Calcular patrones por día de la semana usando volúmenes totales
  const avgVolumeByDay = getVolumeByDayOfWeek(records);

  // Normalizar todos los días
  const normalizedDays = dailyVolumes.map(({ volume, date }) => ({
    date,
    originalVolume: volume,
    normalizedVolume: normalizeVolumeByDay(date, volume, avgVolumeByDay)
  }));

  // CORRECCIÓN CRÍTICA: Usar períodos de tiempo reales para calcular tendencia
  const length = normalizedDays.length;
  const halfPoint = Math.floor(length / 2);

  const olderPeriod = normalizedDays.slice(0, halfPoint);
  const recentPeriod = normalizedDays.slice(halfPoint);

  const olderAvg = olderPeriod.reduce((sum, d) => sum + d.normalizedVolume, 0) / olderPeriod.length;
  const recentAvg = recentPeriod.reduce((sum, d) => sum + d.normalizedVolume, 0) / recentPeriod.length;

  if (olderAvg === 0) return 0;

  // CORRECCIÓN CRÍTICA: Calcular días transcurridos entre períodos
  const oldestDate = olderPeriod[0].date.getTime();
  const newestDate = recentPeriod[recentPeriod.length - 1].date.getTime();
  const daysBetween = Math.max(1, (newestDate - oldestDate) / (1000 * 60 * 60 * 24));

  // Tendencia diaria realista
  const dailyTrend = (recentAvg - olderAvg) / daysBetween;

  // Convertir a tendencia semanal
  const weeklyTrend = dailyTrend * 7;

  // LÍMITES REALISTAS AJUSTADOS: Para volúmenes altos de entrenamiento completo
  // Límite basado en porcentaje del volumen promedio (máximo ±15% por semana)
  const avgVolume = (olderAvg + recentAvg) / 2;
  const maxReasonableTrend = avgVolume * 0.15; // 15% del volumen promedio
  const limitedTrend = Math.max(-maxReasonableTrend, Math.min(maxReasonableTrend, weeklyTrend));

  return roundToDecimals(limitedTrend);
};

/**
 * Predice volumen para un día específico considerando patrón semanal
 * CORRECCIÓN CRÍTICA: Manejo inteligente de volúmenes altos
 */
export const predictVolumeForDay = (
  records: WorkoutRecord[],
  targetDate: Date,
  volumeTrend: number
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
    Math.min(baseDayVolume + maxChange, predictedVolume)
  );

  return roundToDecimals(Math.max(0, limitedVolume));
};

/**
 * Obtiene información de contexto sobre patrones semanales
 * CORRECCIÓN: Sin valores hardcodeados, lógica robusta
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
      weeklyPattern: 'Sin datos'
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
    weeklyPattern: pattern
  };
}; 