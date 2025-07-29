import type { WorkoutRecord } from '@/interfaces';
import { differenceInDays, endOfWeek, startOfWeek, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { clamp, roundToDecimals } from './math-utils';
import { calculateVolume } from './volume-calculations';
import { getLatestDate, getRecordsByDayRange } from './workout-utils';

/**
 * Interfaz para análisis de fatiga y recuperación
 */
export interface FatigueAnalysis {
  fatigueIndex: number; // 0-100, donde 100 es fatiga máxima
  recoveryDays: number;
  volumeDropIndicators: boolean;
  overreachingRisk: 'Bajo' | 'Medio' | 'Alto';
  restRecommendation: string;
  // Nuevas métricas
  fatigueLevel: 'Muy Baja' | 'Baja' | 'Moderada' | 'Alta' | 'Muy Alta';
  recoveryRate: number; // 0-100, qué tan bien te recuperas
  workloadTrend: 'Aumentando' | 'Estable' | 'Disminuyendo';
  recoveryScore: number; // 0-100, score general de recuperación
  stressFactors: {
    volumeStress: number;
    frequencyStress: number;
    intensityStress: number;
    recoveryStress: number;
  };
  recoveryRecommendations: string[];
  predictedRecoveryTime: number; // Horas estimadas para recuperación completa
  fatigueHistory: {
    trend: 'Mejorando' | 'Estable' | 'Empeorando';
    consistency: number; // 0-100, qué tan consistente es tu recuperación
  };
}

/**
 * Analiza fatiga y recuperación
 * Refactorizado para usar funciones centralizadas
 */
export const analyzeFatigue = (records: WorkoutRecord[]): FatigueAnalysis => {
  if (records.length < 7) {
    return {
      fatigueIndex: 0,
      recoveryDays: 0,
      volumeDropIndicators: false,
      overreachingRisk: 'Bajo',
      restRecommendation: 'Datos insuficientes para análisis',
      fatigueLevel: 'Muy Baja',
      recoveryRate: 0,
      workloadTrend: 'Estable',
      recoveryScore: 0,
      stressFactors: {
        volumeStress: 0,
        frequencyStress: 0,
        intensityStress: 0,
        recoveryStress: 0
      },
      recoveryRecommendations: [],
      predictedRecoveryTime: 0,
      fatigueHistory: {
        trend: 'Estable',
        consistency: 0
      }
    };
  }

  // OPCIÓN A: Usar semanas completas (excluyendo semana actual) para consistencia temporal
  const now = new Date();

  // Semana anterior completa (base de referencia)
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { locale: es });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { locale: es });
  const recentRecords = records.filter(r => {
    const recordDate = new Date(r.date);
    return recordDate >= lastWeekStart && recordDate <= lastWeekEnd;
  });

  // Semana anterior a la anterior (para comparación)
  const previousWeekStart = startOfWeek(subWeeks(now, 2), { locale: es });
  const previousWeekEnd = endOfWeek(subWeeks(now, 2), { locale: es });
  const olderRecords = records.filter(r => {
    const recordDate = new Date(r.date);
    return recordDate >= previousWeekStart && recordDate <= previousWeekEnd;
  });

  // **CORRECCIÓN CLAVE**: Calcular tanto volumen total (para stress) como promedio por sesión (para comparación justa)
  // Usar función centralizada para calcular volumen
  let recentVolume = recentRecords.reduce((sum, r) => sum + calculateVolume(r), 0);
  let olderVolume = olderRecords.reduce((sum, r) => sum + calculateVolume(r), 0);

  // OPCIÓN A: Fallback si no hay datos en semanas anteriores completas
  if (recentRecords.length === 0 || olderRecords.length === 0) {
    // Usar últimos 7-14 días como fallback
    const recent7Days = getRecordsByDayRange(records, 0, 7);
    const older7Days = getRecordsByDayRange(records, 7, 14);

    if (recentRecords.length === 0 && recent7Days.length > 0) {
      recentVolume = recent7Days.reduce((sum, r) => sum + calculateVolume(r), 0);
      // Actualizar recentRecords para cálculos posteriores
      recentRecords.length = 0;
      recentRecords.push(...recent7Days);
    }

    if (olderRecords.length === 0 && older7Days.length > 0) {
      olderVolume = older7Days.reduce((sum, r) => sum + calculateVolume(r), 0);
    }
  }

  const recentAvgVolume = recentRecords.length > 0 ? recentVolume / recentRecords.length : 0;
  const olderAvgVolume = olderRecords.length > 0 ? olderVolume / olderRecords.length : 0;

  const volumeChange = olderAvgVolume > 0 ? ((recentAvgVolume - olderAvgVolume) / olderAvgVolume) * 100 : 0;
  const volumeDropIndicators = volumeChange < -15; // Caída > 15%

  // Calcular días desde último entrenamiento usando función centralizada
  const lastWorkout = getLatestDate(records);
  const recoveryDays = differenceInDays(new Date(), lastWorkout);

  // OPCIÓN A: Índice de fatiga basado en semana anterior completa (no semana actual)
  // Usar recentRecords (semana anterior) en lugar de semana actual
  const weeklyFrequency = new Set(recentRecords.map(r => r.date.toDateString())).size;
  const frequencyFactor = weeklyFrequency > 5 ? 30 : weeklyFrequency > 3 ? 15 : 0;
  const volumeFactor = volumeDropIndicators ? 25 : 0;
  const recoveryFactor = recoveryDays === 0 ? 20 : recoveryDays > 3 ? -10 : 0;

  // Usar función centralizada para validar rango
  const fatigueIndex = clamp(frequencyFactor + volumeFactor + recoveryFactor, 0, 100);

  // Riesgo de sobreentrenamiento
  let overreachingRisk: FatigueAnalysis['overreachingRisk'];
  if (fatigueIndex > 70) overreachingRisk = 'Alto';
  else if (fatigueIndex > 40) overreachingRisk = 'Medio';
  else overreachingRisk = 'Bajo';

  // Recomendación de descanso
  let restRecommendation: string;
  if (fatigueIndex > 70) restRecommendation = 'Descanso activo 2-3 días';
  else if (fatigueIndex > 40) restRecommendation = 'Reducir intensidad próxima sesión';
  else if (recoveryDays > 4) restRecommendation = 'Retomar entrenamientos gradualmente';
  else restRecommendation = 'Continuar rutina normal';

  // Nuevas métricas
  let fatigueLevel: FatigueAnalysis['fatigueLevel'];
  if (fatigueIndex < 20) fatigueLevel = 'Muy Baja';
  else if (fatigueIndex < 40) fatigueLevel = 'Baja';
  else if (fatigueIndex < 60) fatigueLevel = 'Moderada';
  else if (fatigueIndex < 80) fatigueLevel = 'Alta';
  else fatigueLevel = 'Muy Alta';

  // Usar función centralizada para validar rango
  const recoveryRate = clamp(100 - (fatigueIndex * 0.8), 0, 100);

  // Calcular workload trend
  let workloadTrend: FatigueAnalysis['workloadTrend'];
  if (volumeChange > 10) workloadTrend = 'Aumentando';
  else if (volumeChange < -10) workloadTrend = 'Disminuyendo';
  else workloadTrend = 'Estable';

  // Calcular recovery score basado en múltiples factores
  const recoveryScore = clamp(
    100 - (fatigueIndex * 0.6) - (recoveryDays > 2 ? (recoveryDays - 2) * 5 : 0),
    0, 100
  );

  // Calcular stress factors más realistas basados en niveles actuales
  const stressFactors: FatigueAnalysis['stressFactors'] = {
    // Volume stress: basado en el volumen actual relativo + cambios
    volumeStress: clamp(
      // Base stress por volumen semanal (normalizado)
      Math.min(60, (recentVolume / 1000) * 10) +
      // Stress adicional por aumentos súbitos
      (volumeChange > 15 ? (volumeChange - 15) * 2 : 0),
      0, 100
    ),

    // Frequency stress: basado en frecuencia actual
    frequencyStress: clamp(
      weeklyFrequency <= 2 ? 10 :  // Muy poca frecuencia = bajo stress
        weeklyFrequency <= 3 ? 30 :  // Frecuencia normal = stress moderado
          weeklyFrequency <= 4 ? 50 :  // Frecuencia buena = stress medio-alto
            weeklyFrequency <= 5 ? 70 :  // Frecuencia alta = stress alto
              weeklyFrequency <= 6 ? 85 :  // Frecuencia muy alta = stress muy alto
                100,  // Entrenamiento diario = stress máximo
      0, 100
    ),

    // Intensity stress: basado en el índice de fatiga
    intensityStress: clamp(fatigueIndex, 0, 100),

    // Recovery stress: basado en tiempo desde último entrenamiento
    recoveryStress: clamp(
      recoveryDays === 0 ? 80 :      // Sin descanso = alto stress
        recoveryDays === 1 ? 40 :      // 1 día descanso = stress medio
          recoveryDays === 2 ? 20 :      // 2 días descanso = stress bajo
            recoveryDays >= 3 ? 10 : 0,     // 3+ días descanso = stress muy bajo
      0, 100
    )
  };

  // Recomendaciones de recuperación mejoradas
  const recoveryRecommendations: string[] = [];

  if (fatigueIndex > 70) {
    recoveryRecommendations.push('Descanso completo 2-3 días');
    recoveryRecommendations.push('Enfócate en hidratación y nutrición');
  } else if (fatigueIndex > 50) {
    recoveryRecommendations.push('Reducir intensidad 20-30% próxima sesión');
    recoveryRecommendations.push('Añadir 10-15 min de estiramiento post-entrenamiento');
  } else if (fatigueIndex > 30) {
    recoveryRecommendations.push('Mantener intensidad pero observar signos de fatiga');
    recoveryRecommendations.push('Priorizar sueño de calidad (7-9 horas)');
  } else {
    recoveryRecommendations.push('Recuperación óptima - puedes mantener o incrementar carga');
  }

  if (recoveryDays > 5) {
    recoveryRecommendations.push('Retomar gradualmente con 60-70% de intensidad habitual');
  } else if (recoveryDays === 0) {
    recoveryRecommendations.push('Considera al menos 1 día de descanso por semana');
  }

  if (volumeDropIndicators) {
    recoveryRecommendations.push('Caída de volumen detectada - evaluar factores externos');
  }

  // Tiempo estimado de recuperación más realista
  const predictedRecoveryTime = Math.round(clamp(
    (fatigueIndex / 100) * 48 + (recoveryDays === 0 ? 12 : 0),
    8, 72
  ));

  // Análisis de historial de fatiga usando semanas completas CON CONTEXTO
  // Considerar si el aumento es progreso controlado o deterioro
  let trend: FatigueAnalysis['fatigueHistory']['trend'];

  if (volumeChange > 25) {
    trend = 'Empeorando'; // Aumento excesivo >25%
  } else if (volumeChange > 15) {
    // Aumento moderado 15-25%: evaluar contexto
    // Si hay otros indicadores positivos, interpretar como progreso
    if (fatigueIndex < 50 && recoveryDays <= 2) {
      trend = 'Mejorando'; // Progreso acelerado controlado
    } else {
      trend = 'Empeorando'; // Aumento problemático
    }
  } else if (volumeChange < -15) {
    trend = 'Mejorando'; // Reducción significativa
  } else {
    trend = 'Estable'; // Cambio normal ±15%
  }

  const fatigueHistory: FatigueAnalysis['fatigueHistory'] = {
    trend,
    consistency: roundToDecimals(Math.min(100, Math.max(0, 100 - Math.abs(volumeChange))))
  };

  return {
    fatigueIndex,
    recoveryDays,
    volumeDropIndicators,
    overreachingRisk,
    restRecommendation,
    fatigueLevel,
    recoveryRate,
    workloadTrend,
    recoveryScore,
    stressFactors,
    recoveryRecommendations,
    predictedRecoveryTime,
    fatigueHistory
  };
}; 