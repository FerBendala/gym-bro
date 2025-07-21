import {
  Activity,
  AlertTriangle,
  BarChart,
  Brain,
  CheckCircle,
  Database,
  Info,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Weight
} from 'lucide-react';
import React, { useMemo } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { formatNumber } from '../../../utils/functions';
import { calculateAdvancedAnalysis } from '../../../utils/functions/advanced-analysis';
// 🎯 NUEVAS IMPORTACIONES: Funciones para normalización por día de la semana
import {
  calculateNormalizedVolumeTrend,
  getDayName,
  getWeeklyVolumeInsights,
  predictVolumeForDay
} from '../../../utils/functions';
import { Card, CardContent, CardHeader } from '../../card';
import { StatCard } from '../../stat-card';
import { InfoTooltip } from '../../tooltip';
import { usePredictionMetrics, type EnhancedPredictionMetrics } from '../hooks';
import {
  ConfidenceGauge,
  DataQualityRadial,
  FactorsChart,
  PredictionTimeline,
  TrendAnalysisChart
} from './predictions-charts';

interface PredictionsTabProps {
  records: WorkoutRecord[];
}

/**
 * FUNCIONES AUXILIARES PARA VALIDACIÓN DE PREDICCIONES
 * 
 * Estas funciones resuelven los problemas de lógica identificados en las métricas:
 * 
 * PROBLEMAS CORREGIDOS:
 * 1. ❌ Predicciones irreales (36kg próxima semana vs 133kg actual)
 * 2. ❌ Decimales excesivos (133.3333333333334kg)
 * 3. ❌ Inconsistencias entre secciones (diferentes fuentes de datos)
 * 4. ❌ Falta de validación de rangos realistas
 * 
 * SOLUCIONES IMPLEMENTADAS:
 * ✅ Uso de registros recientes (30 días) como base
 * ✅ Validación de rangos realistas para todas las métricas
 * ✅ Consistencia entre componentes (mismas funciones)
 * ✅ Redondeo a 2 decimales máximo
 * ✅ Fallbacks inteligentes para datos insuficientes
 */

// Obtener registros recientes con fallback inteligente
const getRecentRecords = (records: WorkoutRecord[], days: number = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const recentRecords = records.filter(r => new Date(r.date) >= cutoffDate);

  if (recentRecords.length === 0) {
    const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sortedRecords.slice(0, 5);
  }

  return recentRecords;
};

const validateNextWeekWeight = (records: WorkoutRecord[], rawPrediction: number): number => {
  const recentRecords = getRecentRecords(records);
  if (recentRecords.length === 0) return 0;

  const maxRecentWeight = Math.max(...recentRecords.map(r => r.weight));

  // CORRECCIÓN CRÍTICA: usar el peso máximo como base, NO el promedio
  // La próxima semana debe estar cerca del peso máximo actual
  const minReasonable = maxRecentWeight * 0.95; // Mínimo 95% del peso máximo
  const maxReasonable = maxRecentWeight + 2.5; // Máximo +2.5kg mejora semanal

  let result: number;

  if (rawPrediction < minReasonable) {
    result = Math.round(maxRecentWeight * 1.01 * 100) / 100; // 1% mejora conservadora del peso máximo
  } else if (rawPrediction > maxReasonable) {
    result = Math.round(maxReasonable * 100) / 100;
  } else {
    result = Math.round(rawPrediction * 100) / 100;
  }



  return result;
};

const validatePRWeight = (records: WorkoutRecord[], rawPrediction: number, nextWeekWeight?: number): number => {
  const recentRecords = getRecentRecords(records);
  if (recentRecords.length === 0) return 0;

  const recentMaxWeight = Math.max(...recentRecords.map(r => r.weight));

  if (recentMaxWeight > 0) {
    // CORRECCIÓN: PR futuro debe ser progresivo (6 semanas = +5-15kg adicionales)
    const baseNextWeek = nextWeekWeight || (recentMaxWeight * 1.01);
    const minReasonablePR = Math.max(
      baseNextWeek + 2.5, // Al menos 2.5kg más que próxima semana
      recentMaxWeight * 1.05  // O mínimo 5% mejora total
    );
    const maxReasonablePR = recentMaxWeight * 1.20; // Máximo 20% mejora

    if (rawPrediction < minReasonablePR) {
      return Math.round(minReasonablePR * 100) / 100;
    } else if (rawPrediction > maxReasonablePR) {
      return Math.round(maxReasonablePR * 100) / 100;
    }
  }

  return Math.round(rawPrediction * 100) / 100;
};

const validateStrengthTrend = (rawTrend: number): number => {
  const validTrend = Math.max(-2, Math.min(2, rawTrend)); // Limitar a ±2kg/sem
  return Math.round(validTrend * 100) / 100; // Redondear a 2 decimales
};

const validateMonthlyGrowth = (rawGrowth: number): number => {
  const validGrowth = Math.max(-5, Math.min(10, rawGrowth)); // Rango realista: -5kg a +10kg/mes
  return Math.round(validGrowth * 100) / 100; // Redondear a 2 decimales
};

const validateTimeToNextPR = (rawTime: number, nextWeekWeight?: number, prWeight?: number, strengthTrend?: number): number => {
  // Si tenemos datos para calcular tiempo realista desde próxima semana
  if (nextWeekWeight && prWeight && strengthTrend && strengthTrend > 0) {
    const weightDifference = prWeight - nextWeekWeight; // Desde próxima semana, no desde hoy
    const weeksNeeded = Math.max(1, Math.ceil(weightDifference / strengthTrend));

    // ✅ Cálculo realista implementado

    return Math.max(1, Math.min(52, weeksNeeded));
  }

  // Fallback al valor original validado
  return Math.max(1, Math.min(52, rawTime || 8)); // Entre 1 y 52 semanas
};

const calculateValidatedCurrentWeight = (records: WorkoutRecord[]): number => {
  const recentRecords = getRecentRecords(records);
  if (recentRecords.length === 0) return 0;

  const currentWeight = Math.max(...recentRecords.map(r => r.weight));
  return Math.round(currentWeight * 100) / 100; // Redondear a 2 decimales
};

const calculateValidatedBaseline1RM = (records: WorkoutRecord[]): number => {
  const recentRecords = getRecentRecords(records);
  if (recentRecords.length === 0) return 0;

  // Calcular 1RM estimado promedio de registros recientes
  const estimated1RMs = recentRecords.map(r => r.weight * (1 + r.reps / 30));
  const baseline = estimated1RMs.reduce((sum, val) => sum + val, 0) / estimated1RMs.length;
  return Math.round(baseline * 100) / 100; // Redondear a 2 decimales
};

const calculateValidatedImprovement = (records: WorkoutRecord[], predictedPR: number): number => {
  const recentMaxWeight = calculateValidatedCurrentWeight(records);
  const improvement = predictedPR - recentMaxWeight;
  return Math.max(0, Math.min(15, improvement)); // Limitar mejora a 15kg máximo
};

export const PredictionsTab: React.FC<PredictionsTabProps> = ({ records }) => {
  const analysis = useMemo(() => calculateAdvancedAnalysis(records), [records]);

  // 🎯 MÉTRICAS CENTRALIZADAS COMPLETAS - Una sola fuente de verdad
  const centralizedMetrics = useMemo(() => {
    const currentWeight = calculateValidatedCurrentWeight(records);
    const nextWeekWeight = validateNextWeekWeight(records, analysis.progressPrediction.nextWeekWeight);
    const prWeight = validatePRWeight(records, analysis.progressPrediction.predictedPR.weight, nextWeekWeight);
    const strengthTrend = validateStrengthTrend(analysis.progressPrediction.strengthTrend);
    const monthlyGrowth = validateMonthlyGrowth(analysis.progressPrediction.monthlyGrowthRate);
    const timeToNextPR = validateTimeToNextPR(
      analysis.progressPrediction.timeToNextPR,
      nextWeekWeight,
      prWeight,
      strengthTrend
    );

    // ✅ Todas las métricas centralizadas y sincronizadas

    // 🎯 DEMO: Normalización por día de la semana
    const weeklyInsights = getWeeklyVolumeInsights(records);
    const normalizedVolumeTrend = calculateNormalizedVolumeTrend(records);
    const todayVolumePrediction = predictVolumeForDay(records, new Date(), normalizedVolumeTrend);

    // 🔍 DEBUG DETALLADO: Investigar volúmenes altos
    const sampleRecords = records.slice(0, 5).map(r => ({
      fecha: r.date.toISOString().split('T')[0],
      ejercicio: r.exercise?.name || 'desconocido',
      sets: r.sets,
      reps: r.reps,
      peso: r.weight,
      volumen: r.sets * r.reps * r.weight
    }));

    console.log('🔍 DEBUG VOLÚMENES ALTOS:', {
      registrosMuestra: sampleRecords,
      totalRegistros: records.length,
      volumenMedioRegistro: records.reduce((sum, r) => sum + (r.sets * r.reps * r.weight), 0) / records.length,
      registroMasAlto: Math.max(...records.map(r => r.sets * r.reps * r.weight)),
      registroMasBajo: Math.min(...records.map(r => r.sets * r.reps * r.weight)),

      explicacion: '✅ Volúmenes altos son NORMALES para entrenamientos completos',
      ejemplo: 'Press pierna 156kg × 12 reps × 3 sets = 5640kg (normal)',
      volumenDiaCompleto: '7000-8000kg por día de entrenamiento es realista'
    });

    console.log('🎯 TENDENCIA NORMALIZADA POR DÍA DE LA SEMANA:', {
      diaActual: getDayName(new Date()),
      problemaUsuario: '¿Por qué tendencia negativa si lunes aumentó volumen?',

      // 🔄 COMPARACIÓN ANTES vs DESPUÉS
      tendenciaAnterior: {
        metodo: 'Compara días diferentes (injusto)',
        valor: analysis.progressPrediction.volumeTrend.toFixed(1) + 'kg/sem',
        problema: '❌ Compara lunes vs otros días directamente'
      },

      tendenciaNormalizada: {
        metodo: 'Compara lunes con lunes anteriores (justo)',
        valor: normalizedVolumeTrend.toFixed(1) + 'kg/sem',
        correccion: '✅ Detecta si ESTE lunes vs lunes anteriores'
      },

      // Patrones detectados
      patrones: {
        diaPico: weeklyInsights.peakDay,
        diaDescanso: weeklyInsights.restDay,
        variabilidad: weeklyInsights.weeklyPattern
      },

      // Volúmenes por día para entender el patrón
      volumenPromedioPorDia: Object.entries(weeklyInsights.avgVolumeByDay)
        .map(([dia, vol]) => `${dia}: ${vol.toFixed(0)}kg`)
        .join(', '),

      // Predicción realista
      prediccionHoy: todayVolumePrediction.toFixed(1) + 'kg',

      // Resultado
      ahoraEnUI: '✅ UI usa tendencia normalizada (no la original)',
      explicacion: 'Si lunes aumentó → tendencia normalizada será positiva'
    });

    return {
      // Métricas validadas centralizadas
      currentWeight,
      nextWeekWeight,
      prWeight,
      strengthTrend,
      monthlyGrowth,
      timeToNextPR,
      improvement: prWeight - currentWeight,
      improvementPercentage: ((prWeight / currentWeight - 1) * 100).toFixed(1),
      nextWeekIncrease: nextWeekWeight - currentWeight,
      prIncrease: prWeight - nextWeekWeight,

      // 🎯 CORRECCIÓN CRÍTICA: Usar tendencia normalizada, no la original
      volumeTrend: normalizedVolumeTrend, // ✅ Tendencia corregida por día de la semana
      plateauRisk: analysis.progressPrediction.plateauRisk,
      confidenceLevel: analysis.progressPrediction.confidenceLevel,
      prConfidence: analysis.progressPrediction.predictedPR.confidence,
      trendAnalysis: analysis.progressPrediction.trendAnalysis,
      recommendations: analysis.progressPrediction.recommendations,

      // Valores raw para tooltips y comparaciones
      rawNextWeek: analysis.progressPrediction.nextWeekWeight,
      rawPR: analysis.progressPrediction.predictedPR.weight,
      rawStrengthTrend: analysis.progressPrediction.strengthTrend,
      rawMonthlyGrowth: analysis.progressPrediction.monthlyGrowthRate
    };
  }, [records, analysis]);

  // Usar el hook mejorado para calcular métricas de forma optimizada
  const predictionMetrics: EnhancedPredictionMetrics = usePredictionMetrics(
    records,
    analysis.progressPrediction.predictedPR.weight
  );

  // Función utilitaria para validar valores numéricos
  const safeNumber = (value: number | undefined | null, defaultValue: number = 0): number => {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      return defaultValue;
    }
    return value;
  };

  // Función para obtener explicación de nivel de confianza
  const getConfidenceExplanation = (confidence: number): {
    level: string;
    description: string;
    color: string;
    factors: string[];
  } => {
    if (confidence >= 80) {
      return {
        level: 'Muy Alta',
        description: 'Predicción muy confiable basada en datos consistentes y patrones claros',
        color: 'text-green-400',
        factors: [
          'Datos abundantes y consistentes',
          'Progresión clara y estable',
          'Entrenamientos regulares recientes'
        ]
      };
    } else if (confidence >= 60) {
      return {
        level: 'Alta',
        description: 'Predicción confiable con datos suficientes para análisis preciso',
        color: 'text-blue-400',
        factors: [
          'Suficientes datos históricos',
          'Patrones de progreso identificables',
          'Regularidad en entrenamientos'
        ]
      };
    } else if (confidence >= 40) {
      return {
        level: 'Moderada',
        description: 'Predicción con incertidumbre moderada, usar como orientación general',
        color: 'text-yellow-400',
        factors: [
          'Datos limitados o irregulares',
          'Progresión variable o inconsistente',
          'Períodos largos sin entrenar'
        ]
      };
    } else if (confidence >= 20) {
      return {
        level: 'Baja',
        description: 'Predicción incierta, requiere más datos para mayor precisión',
        color: 'text-orange-400',
        factors: [
          'Pocos datos históricos',
          'Gran variabilidad en rendimiento',
          'Entrenamientos muy esporádicos'
        ]
      };
    } else {
      return {
        level: 'Muy Baja',
        description: 'Predicción no confiable, se necesitan más entrenamientos consistentes',
        color: 'text-red-400',
        factors: [
          'Datos insuficientes o de mala calidad',
          'Sin patrones identificables',
          'Falta de consistencia temporal'
        ]
      };
    }
  };

  const confidenceInfo = getConfidenceExplanation(centralizedMetrics.confidenceLevel);

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Brain className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Sin datos para predicciones
        </h3>
        <p className="text-gray-500">
          Registra al menos 10 entrenamientos para obtener predicciones con inteligencia artificial
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicadores predictivos principales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Próxima Semana"
          value={`${centralizedMetrics.nextWeekWeight}kg`}
          icon={TrendingUp}
          variant={centralizedMetrics.trendAnalysis === 'mejorando' ? 'success' :
            centralizedMetrics.trendAnalysis === 'empeorando' ? 'danger' : 'warning'}
          tooltip={`Peso estimado basado en tendencia de ${centralizedMetrics.strengthTrend > 0 ? '+' : ''}${centralizedMetrics.strengthTrend}kg/semana. Confianza: ${confidenceInfo.level}. Calidad datos: ${predictionMetrics.dataQuality.qualityScore}/100.`}
          tooltipPosition="top"
        />
        <StatCard
          title="Próximo PR"
          value={`${centralizedMetrics.prWeight}kg`}
          icon={Trophy}
          variant={centralizedMetrics.prConfidence >= 70 ? 'success' :
            centralizedMetrics.prConfidence >= 50 ? 'warning' : 'danger'}
          tooltip={`Récord personal estimado con ${centralizedMetrics.prConfidence}% de confianza. Mejora de ${predictionMetrics.formattedImprovement} vs baseline ${predictionMetrics.formattedBaseline}kg. Algoritmo considera ${predictionMetrics.dataQuality.validRecords} entrenamientos válidos.`}
          tooltipPosition="top"
        />
        <StatCard
          title="Crecimiento Mensual"
          value={`+${centralizedMetrics.monthlyGrowth}kg`}
          icon={BarChart}
          variant={centralizedMetrics.monthlyGrowth > 5 ? 'success' :
            centralizedMetrics.monthlyGrowth > 2 ? 'warning' : 'danger'}
          tooltip={`Crecimiento proyectado basado en tendencia semanal de ${centralizedMetrics.strengthTrend > 0 ? '+' : ''}${centralizedMetrics.strengthTrend}kg. Span de datos: ${predictionMetrics.dataQuality.dataSpan} días. ${predictionMetrics.dataQuality.hasRecentData ? 'Incluye datos recientes.' : 'Sin datos recientes - precisión reducida.'}`}
          tooltipPosition="top"
        />
        <StatCard
          title="Riesgo Meseta"
          value={`${centralizedMetrics.plateauRisk}%`}
          icon={AlertTriangle}
          variant={centralizedMetrics.plateauRisk < 30 ? 'success' :
            centralizedMetrics.plateauRisk <= 60 ? 'warning' : 'danger'}
          tooltip={`Probabilidad de estancamiento calculada con ${predictionMetrics.dataQuality.validRecords} registros. Factores: variabilidad de progreso, consistencia temporal, tendencias recientes. ≤30% = bajo riesgo, 31-60% = moderado, >60% = alto riesgo.`}
          tooltipPosition="top"
        />
      </div>

      {/* Análisis de Tendencia IA - Gráfico Radar */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Análisis de Tendencia IA
            <InfoTooltip
              content={`Análisis multidimensional basado en ${predictionMetrics.dataQuality.validRecords} registros válidos. El gráfico radar muestra 5 dimensiones clave: tendencias de fuerza y volumen, crecimiento mensual, confianza IA y estabilidad.`}
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Header con estado de tendencia */}
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${analysis.progressPrediction.trendAnalysis === 'mejorando' ? 'from-green-500/80 to-emerald-500/80' :
                  analysis.progressPrediction.trendAnalysis === 'estable' ? 'from-blue-500/80 to-cyan-500/80' :
                    analysis.progressPrediction.trendAnalysis === 'empeorando' ? 'from-red-500/80 to-orange-500/80' :
                      'from-gray-500/80 to-gray-600/80'}`}>
                  {analysis.progressPrediction.trendAnalysis === 'mejorando' ? (
                    <TrendingUp className="w-5 h-5 text-white" />
                  ) : analysis.progressPrediction.trendAnalysis === 'empeorando' ? (
                    <TrendingDown className="w-5 h-5 text-white" />
                  ) : (
                    <Activity className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">Estado General</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${analysis.progressPrediction.trendAnalysis === 'mejorando' ? 'bg-green-500 text-white' :
                    analysis.progressPrediction.trendAnalysis === 'estable' ? 'bg-blue-500 text-white' :
                      analysis.progressPrediction.trendAnalysis === 'empeorando' ? 'bg-red-500 text-white' :
                        'bg-gray-500 text-white'}`}>
                    {analysis.progressPrediction.trendAnalysis === 'mejorando' ? '📈 MEJORANDO' :
                      analysis.progressPrediction.trendAnalysis === 'estable' ? '➡️ ESTABLE' :
                        analysis.progressPrediction.trendAnalysis === 'empeorando' ? '📉 EMPEORANDO' :
                          '❓ INSUFICIENTE'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-white">
                  {centralizedMetrics.nextWeekWeight}kg
                </div>
                <div className="text-xs text-gray-400">próxima semana</div>
              </div>
            </div>

            {/* Gráfico Radar de Tendencia */}
            <div className="relative">
              <TrendAnalysisChart
                strengthTrend={centralizedMetrics.strengthTrend}
                volumeTrend={centralizedMetrics.volumeTrend}
                monthlyGrowthRate={centralizedMetrics.monthlyGrowth}
                plateauRisk={centralizedMetrics.plateauRisk}
                confidenceLevel={centralizedMetrics.confidenceLevel}
                trendAnalysis={centralizedMetrics.trendAnalysis}
              />
            </div>

            {/* 🧠 EXPLICACIÓN DEL ANÁLISIS IA */}
            <div className="p-4 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl border border-indigo-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-semibold text-indigo-200">¿Por qué estos resultados?</h4>
              </div>

              <div className="space-y-3 text-sm text-gray-300">
                {/* Explicación del Estado General */}
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-white">Estado "{centralizedMetrics.trendAnalysis.toUpperCase()}":</span>
                    <span className="ml-1">
                      {centralizedMetrics.trendAnalysis === 'mejorando' ?
                        `Tu tendencia de fuerza (${centralizedMetrics.strengthTrend > 0 ? '+' : ''}${centralizedMetrics.strengthTrend}kg/sem) y volumen (${centralizedMetrics.volumeTrend > 0 ? '+' : ''}${centralizedMetrics.volumeTrend}kg/sem) muestran progreso consistente. La IA detectó patrones de crecimiento sostenible.` :
                        centralizedMetrics.trendAnalysis === 'estable' ?
                          `Tu progreso se mantiene constante. La fuerza (${centralizedMetrics.strengthTrend > 0 ? '+' : ''}${centralizedMetrics.strengthTrend}kg/sem) y volumen muestran estabilidad, lo cual es normal en fases de consolidación o cambios de rutina.` :
                          centralizedMetrics.trendAnalysis === 'empeorando' ?
                            `Se detectaron tendencias negativas en tus métricas. Esto puede deberse a fatiga acumulada, cambios en la rutina, o necesidad de descanso. Considera revisar tu programa.` :
                            'Datos insuficientes para determinar una tendencia clara. Necesitas más entrenamientos consistentes para análisis precisos.'}
                    </span>
                  </div>
                </div>

                {/* Explicación de Fuerza */}
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-white">Tendencia de Fuerza ({centralizedMetrics.strengthTrend > 0 ? '+' : ''}{centralizedMetrics.strengthTrend}kg/sem):</span>
                    <span className="ml-1">
                      {centralizedMetrics.strengthTrend > 1.5 ?
                        'Excelente progresión. Tu sistema neuromuscular se adapta eficientemente al estímulo de entrenamiento.' :
                        centralizedMetrics.strengthTrend > 0.5 ?
                          'Progreso sólido y sostenible. Ritmo ideal para ganancias a largo plazo sin sobreentrenamiento.' :
                          centralizedMetrics.strengthTrend > -0.5 ?
                            'Progreso mínimo o estancamiento. Considera variar intensidad, volumen o ejercicios para nuevos estímulos.' :
                            'Declive en fuerza. Puede indicar fatiga, recuperación insuficiente o necesidad de deload/cambio de programa.'
                      }
                    </span>
                  </div>
                </div>

                {/* Explicación de Volumen */}
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-white">Tendencia de Volumen ({centralizedMetrics.volumeTrend > 0 ? '+' : ''}{centralizedMetrics.volumeTrend}kg/sem):</span>
                    <span className="ml-1">
                      {centralizedMetrics.volumeTrend > 15 ?
                        'Incremento de volumen muy alto. Asegúrate de que tu recuperación sea adecuada para evitar sobreentrenamiento.' :
                        centralizedMetrics.volumeTrend > 5 ?
                          'Aumento de volumen apropiado. Tu capacidad de trabajo está mejorando gradualmente.' :
                          centralizedMetrics.volumeTrend > -5 ?
                            'Volumen estable. Fase de mantenimiento o consolidación de ganancias previas.' :
                            'Reducción de volumen. Puede ser estratégico (deload) o indicar fatiga/desmotivación.'
                      }
                      <span className="block mt-1 text-xs text-indigo-300">
                        💡 <strong>Normalizado por día:</strong> Esta tendencia compara lunes con lunes, viernes con viernes, etc.
                        Así evitamos confundir días naturalmente bajos (descanso) con días altos (entrenamiento intenso).
                      </span>
                    </span>
                  </div>
                </div>

                {/* Explicación de Riesgo de Meseta */}
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-white">Riesgo de Meseta ({centralizedMetrics.plateauRisk}%):</span>
                    <span className="ml-1">
                      {centralizedMetrics.plateauRisk < 30 ?
                        'Bajo riesgo. Tu progreso es variable y adaptativo, señal de buena respuesta al entrenamiento.' :
                        centralizedMetrics.plateauRisk < 60 ?
                          'Riesgo moderado. Algunos patrones repetitivos detectados. Considera variaciones en tu programa.' :
                          'Alto riesgo de estancamiento. La IA detectó patrones muy consistentes que sugieren adaptación completa. Tiempo de cambios significativos.'
                      }
                    </span>
                  </div>
                </div>

                {/* Explicación de Confianza */}
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-white">Confianza IA ({centralizedMetrics.confidenceLevel}%):</span>
                    <span className="ml-1">
                      {centralizedMetrics.confidenceLevel >= 80 ?
                        `Muy alta. Con ${predictionMetrics.dataQuality.validRecords} registros válidos y patrones claros, las predicciones son altamente confiables.` :
                        centralizedMetrics.confidenceLevel >= 60 ?
                          `Buena. Suficientes datos para predicciones sólidas, pero más entrenamientos mejorarán la precisión.` :
                          centralizedMetrics.confidenceLevel >= 40 ?
                            `Moderada. Patrones detectados pero datos limitados. Continúa entrenando consistentemente para mejorar precisión.` :
                            `Baja. Datos insuficientes o muy variables. Las predicciones son aproximaciones generales.`
                      }
                    </span>
                  </div>
                </div>
                <div>
                  <strong className="text-slate-200">📊 Cálculo de Tendencias:</strong>
                  <ul className="mt-1 ml-4 space-y-1">
                    <li>• <strong>Fuerza:</strong> Regresión lineal sobre últimos {predictionMetrics.dataQuality.dataSpan} días, ponderada por recencia</li>
                    <li>• <strong>Volumen:</strong> ⚡ NORMALIZADO POR DÍA - Compara lunes con lunes, evita sesgo de días altos/bajos</li>
                    <li>• <strong>Crecimiento:</strong> Tendencia semanal × 4.33 (factor mensual promedio)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 💡 RECOMENDACIONES PERSONALIZADAS */}
            <div className="p-4 bg-gradient-to-br from-emerald-900/20 to-green-900/20 rounded-xl border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-emerald-200">Recomendaciones IA Personalizadas</h4>
              </div>

              <div className="space-y-2 text-sm text-gray-300">
                {/* Recomendaciones basadas en tendencia de fuerza */}
                {centralizedMetrics.strengthTrend > 1.5 && (
                  <div className="flex items-start gap-2 p-2 bg-green-900/20 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                    <span><strong className="text-green-200">Mantén el momentum:</strong> Tu progreso en fuerza es excelente. Continúa con tu programa actual y asegúrate de la recuperación adecuada.</span>
                  </div>
                )}

                {centralizedMetrics.strengthTrend >= 0.5 && centralizedMetrics.strengthTrend <= 1.5 && (
                  <div className="flex items-start gap-2 p-2 bg-blue-900/20 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                    <span><strong className="text-blue-200">Progreso sostenible:</strong> Ritmo ideal. Considera aumentar gradualmente la intensidad o volumen cuando te sientas cómodo.</span>
                  </div>
                )}

                {centralizedMetrics.strengthTrend < 0.5 && centralizedMetrics.strengthTrend >= -0.5 && (
                  <div className="flex items-start gap-2 p-2 bg-yellow-900/20 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 flex-shrink-0"></div>
                    <span><strong className="text-yellow-200">Necesitas variación:</strong> Prueba nuevos ejercicios, cambia el rango de repeticiones, o incrementa la frecuencia de entrenamiento.</span>
                  </div>
                )}

                {centralizedMetrics.strengthTrend < -0.5 && (
                  <div className="flex items-start gap-2 p-2 bg-red-900/20 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
                    <span><strong className="text-red-200">Tiempo de descanso:</strong> Considera una semana de deload (50% volumen/intensidad) o evalúa tu recuperación (sueño, nutrición, estrés).</span>
                  </div>
                )}

                {/* Recomendaciones basadas en riesgo de meseta */}
                {centralizedMetrics.plateauRisk > 60 && (
                  <div className="flex items-start gap-2 p-2 bg-orange-900/20 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0"></div>
                    <span><strong className="text-orange-200">Cambio urgente:</strong> Alto riesgo de meseta. Cambia ejercicios principales, prueba periodización diferente o consulta a un entrenador.</span>
                  </div>
                )}

                {/* Recomendaciones basadas en volumen */}
                {centralizedMetrics.volumeTrend > 15 && (
                  <div className="flex items-start gap-2 p-2 bg-purple-900/20 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                    <span><strong className="text-purple-200">Monitorea la recuperación:</strong> Incremento de volumen muy alto. Asegúrate de dormir 7-9h, buena nutrición y gestión del estrés.</span>
                  </div>
                )}

                {/* Recomendaciones basadas en confianza */}
                {centralizedMetrics.confidenceLevel < 40 && (
                  <div className="flex items-start gap-2 p-2 bg-gray-700/30 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                    <span><strong className="text-gray-200">Más datos necesarios:</strong> Registra entrenamientos más consistentemente para obtener predicciones más precisas de la IA.</span>
                  </div>
                )}

                {/* Recomendación general basada en el crecimiento mensual */}
                {centralizedMetrics.monthlyGrowth > 8 && (
                  <div className="flex items-start gap-2 p-2 bg-emerald-900/20 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></div>
                    <span><strong className="text-emerald-200">¡Excelente!</strong> Tu crecimiento mensual de +{centralizedMetrics.monthlyGrowth}kg es outstanding. Documenta qué estás haciendo bien para mantener este ritmo.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Métricas numéricas resumidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-700">
              <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                <div className="text-xs text-gray-400">Fuerza</div>
                <div className={`text-sm font-semibold ${centralizedMetrics.strengthTrend > 0 ? 'text-green-400' :
                  centralizedMetrics.strengthTrend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {centralizedMetrics.strengthTrend > 0 ? '+' : ''}{centralizedMetrics.strengthTrend}kg/sem
                </div>
              </div>
              <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                <div className="text-xs text-gray-400">Volumen</div>
                <div className={`text-sm font-semibold ${centralizedMetrics.volumeTrend > 0 ? 'text-blue-400' :
                  centralizedMetrics.volumeTrend < 0 ? 'text-orange-400' : 'text-gray-400'}`}>
                  {centralizedMetrics.volumeTrend > 0 ? '+' : ''}{centralizedMetrics.volumeTrend}kg/sem
                </div>
              </div>
              <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                <div className="text-xs text-gray-400">Crecimiento</div>
                <div className="text-sm font-semibold text-white">
                  +{centralizedMetrics.monthlyGrowth}kg/mes
                </div>
              </div>
              <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                <div className="text-xs text-gray-400">Confianza</div>
                <div className={`text-sm font-semibold ${centralizedMetrics.confidenceLevel >= 70 ? 'text-green-400' :
                  centralizedMetrics.confidenceLevel >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {centralizedMetrics.confidenceLevel}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🏆 PREDICCIÓN DE RÉCORD PERSONAL - REDISEÑO MODERNO */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Hero Section con Gradiente */}
          <div className="relative bg-gradient-to-br from-purple-900/40 via-violet-900/30 to-pink-900/20 p-6 border-b border-purple-500/20">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/25">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Predicción de Récord Personal</h3>
                  <p className="text-sm text-purple-200 opacity-90">Tu próximo hito basado en progreso actual</p>
                </div>
              </div>

              {/* PR Principal */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-white">
                      {centralizedMetrics.prWeight}
                    </span>
                    <span className="text-xl text-purple-300">kg</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${centralizedMetrics.prConfidence >= 80 ? 'bg-emerald-500 text-white' :
                      centralizedMetrics.prConfidence >= 60 ? 'bg-yellow-500 text-black' :
                        'bg-red-500 text-white'
                      }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {centralizedMetrics.prConfidence}% confianza
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-500 text-white">
                      {(() => {
                        if (centralizedMetrics.timeToNextPR >= 4) {
                          const months = Math.round(centralizedMetrics.timeToNextPR / 4 * 10) / 10;
                          return months === 1 ? '1 mes' : `${months} meses`;
                        } else {
                          return centralizedMetrics.timeToNextPR === 1 ? '1 semana' : `${centralizedMetrics.timeToNextPR} semanas`;
                        }
                      })()}
                    </span>
                  </div>
                </div>

                {/* Progress Ring */}
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="rgb(124 58 237 / 0.2)"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="url(#progressGradient)"
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(centralizedMetrics.prConfidence * 283) / 100} 283`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgb(168 85 247)" />
                        <stop offset="100%" stopColor="rgb(236 72 153)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{centralizedMetrics.prConfidence}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Métricas Clave */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Progreso Actual */}
              <div className="relative p-4 rounded-xl bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 hover:border-blue-400/50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                    <Weight className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-blue-200">Peso Actual</span>
                </div>
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {centralizedMetrics.currentWeight}kg
                </div>
                <div className="text-xs text-blue-300 opacity-75">
                  Último máximo registrado
                </div>
              </div>

              {/* Próxima Semana */}
              <div className="relative p-4 rounded-xl bg-gradient-to-br from-emerald-900/20 to-green-900/20 border border-emerald-500/30 hover:border-emerald-400/50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-emerald-200">Próxima Semana</span>
                </div>
                <div className="text-2xl font-bold text-emerald-400 mb-1">
                  {centralizedMetrics.nextWeekWeight}kg
                </div>
                <div className="text-xs text-emerald-300 opacity-75">
                  +{centralizedMetrics.nextWeekIncrease.toFixed(1)}kg esperado
                </div>
              </div>

              {/* Mejora Total */}
              <div className="relative p-4 rounded-xl bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30 hover:border-amber-400/50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-amber-200">Mejora Total</span>
                </div>
                <div className="text-2xl font-bold text-amber-400 mb-1">
                  +{centralizedMetrics.improvement.toFixed(1)}kg
                </div>
                <div className="text-xs text-amber-300 opacity-75">
                  {centralizedMetrics.improvementPercentage}% incremento
                </div>
              </div>
            </div>

            {/* Mini Timeline */}
            <div className="mt-6 p-4 bg-gray-800/30 rounded-xl border border-gray-600/30">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <BarChart className="w-4 h-4" />
                Proyección de Progreso
              </h4>
              <div className="flex items-center justify-between text-sm">
                <div className="text-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mx-auto mb-1"></div>
                  <div className="text-blue-400 font-semibold">{centralizedMetrics.currentWeight}kg</div>
                  <div className="text-gray-400 text-xs">Hoy</div>
                </div>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500 mx-4"></div>
                <div className="text-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto mb-1"></div>
                  <div className="text-emerald-400 font-semibold">{centralizedMetrics.nextWeekWeight}kg</div>
                  <div className="text-gray-400 text-xs">1 sem</div>
                </div>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-emerald-500 to-purple-500 mx-4"></div>
                <div className="text-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mx-auto mb-1"></div>
                  <div className="text-purple-400 font-semibold">
                    {centralizedMetrics.prWeight}kg
                  </div>
                  <div className="text-gray-400 text-xs">
                    {(() => {
                      if (centralizedMetrics.timeToNextPR >= 4) {
                        const months = Math.round(centralizedMetrics.timeToNextPR / 4 * 10) / 10;
                        return months === 1 ? '1 mes' : `${months} meses`;
                      } else {
                        return centralizedMetrics.timeToNextPR === 1 ? '1 sem' : `${centralizedMetrics.timeToNextPR} sem`;
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Insights Adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-gray-700">
              <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                <div className="p-1.5 rounded bg-violet-500/20">
                  <TrendingUp className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Tendencia de Fuerza</div>
                  <div className={`text-sm font-semibold ${centralizedMetrics.strengthTrend > 0 ? 'text-green-400' :
                    centralizedMetrics.strengthTrend < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                    {centralizedMetrics.strengthTrend > 0 ? '+' : ''}
                    {centralizedMetrics.strengthTrend}kg/sem
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                <div className="p-1.5 rounded bg-emerald-500/20">
                  <BarChart className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Crecimiento Mensual</div>
                  <div className="text-sm font-semibold text-emerald-400">
                    +{centralizedMetrics.monthlyGrowth}kg/mes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline de Predicciones */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Timeline de Predicciones
            <InfoTooltip
              content="Progresión histórica y predicciones futuras visualizadas en el tiempo. Muestra tendencias pasadas y proyecciones basadas en tu progreso actual."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Gráfico de Timeline */}
            <div className="relative">
              <PredictionTimeline
                currentWeight={centralizedMetrics.currentWeight}
                nextWeekWeight={centralizedMetrics.nextWeekWeight}
                predictedPR={centralizedMetrics.prWeight}
                monthlyGrowthRate={centralizedMetrics.monthlyGrowth}
                strengthTrend={centralizedMetrics.strengthTrend}
              />
            </div>

            {/* Métricas de resumen - VALIDADAS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-700">
              <div className="relative p-4 rounded-xl bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/80 to-cyan-500/80">
                    <Weight className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h5 className="text-xs font-medium text-white">Próxima Semana</h5>
                  </div>
                </div>
                <div className="text-xl font-bold text-blue-400 mb-1">
                  {centralizedMetrics.nextWeekWeight}kg
                </div>
                <div className="text-xs text-gray-400">
                  {centralizedMetrics.strengthTrend > 0 ? '+' : ''}{centralizedMetrics.strengthTrend}kg/sem
                </div>
              </div>

              <div className="relative p-4 rounded-xl bg-gradient-to-br from-purple-900/20 to-violet-900/20 border border-purple-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/80 to-violet-500/80">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h5 className="text-xs font-medium text-white">Próximo PR</h5>
                  </div>
                </div>
                <div className="text-xl font-bold text-purple-400 mb-1">
                  {centralizedMetrics.prWeight}kg
                </div>
                <div className="text-xs text-gray-400">
                  {(() => {
                    if (centralizedMetrics.timeToNextPR >= 4) {
                      const months = Math.round(centralizedMetrics.timeToNextPR / 4 * 10) / 10;
                      return months === 1 ? '1 mes' : `${months} meses`;
                    } else {
                      return centralizedMetrics.timeToNextPR === 1 ? '1 semana' : `${centralizedMetrics.timeToNextPR} semanas`;
                    }
                  })()}
                </div>
              </div>

              <div className="relative p-4 rounded-xl bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/80 to-emerald-500/80">
                    <BarChart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h5 className="text-xs font-medium text-white">Crecimiento Mensual</h5>
                  </div>
                </div>
                <div className="text-xl font-bold text-green-400 mb-1">
                  {(() => {
                    const validMonthlyGrowth = validateMonthlyGrowth(analysis.progressPrediction.monthlyGrowthRate);
                    return `${validMonthlyGrowth > 0 ? '+' : ''}${validMonthlyGrowth}kg`;
                  })()}
                </div>
                <div className="text-xs text-gray-400">
                  por mes estimado
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calidad de Datos y Confianza - Nueva sección */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Calidad de Datos y Confianza
            <InfoTooltip
              content="Análisis de la calidad de tus datos y explicación del nivel de confianza de las predicciones."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Calidad de Datos - Radial Chart */}
            <div className="relative rounded-xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30">
              <div className="p-4 border-b border-indigo-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/80 to-purple-500/80">
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">Calidad de Datos</h4>
                    <p className="text-xs text-gray-400">Análisis visual de datos disponibles</p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <DataQualityRadial
                  qualityScore={predictionMetrics.dataQuality.qualityScore}
                  validationRate={predictionMetrics.dataQuality.validationRate}
                  hasRecentData={predictionMetrics.dataQuality.hasRecentData}
                  dataSpan={predictionMetrics.dataQuality.dataSpan}
                />

                {/* Métricas de resumen debajo del gráfico */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-indigo-500/20">
                  <div className="text-center">
                    <div className="text-xs text-gray-400">Registros Válidos</div>
                    <div className="text-sm font-medium text-white">
                      {predictionMetrics.dataQuality.validRecords}/{predictionMetrics.dataQuality.totalRecords}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">Span Temporal</div>
                    <div className="text-sm font-medium text-white">
                      {predictionMetrics.dataQuality.dataSpan} días
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico de Nivel de Confianza - Gauge Chart */}
            <div className="relative rounded-xl bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30">
              <div className="p-4 border-b border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/80 to-cyan-500/80">
                    <Info className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">Nivel de Confianza</h4>
                    <p className="text-xs text-gray-400">Precisión esperada de predicciones</p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <ConfidenceGauge
                  confidence={centralizedMetrics.confidenceLevel}
                  level={confidenceInfo.level}
                  color={confidenceInfo.color}
                />

                {/* Descripción y factores debajo del gráfico */}
                <div className="mt-4 pt-4 border-t border-blue-500/20">
                  <p className="text-xs text-gray-300 leading-relaxed mb-3">
                    {confidenceInfo.description}
                  </p>
                  <div className="space-y-1">
                    <h5 className="text-xs font-medium text-gray-300">Factores principales:</h5>
                    {confidenceInfo.factors.slice(0, 2).map((factor, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                        <p className="text-xs text-gray-400">{factor}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advertencias de calidad de datos */}
          {predictionMetrics.dataQuality.qualityScore < 70 && (
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-300 font-medium mb-1">
                    Calidad de datos mejorable
                  </p>
                  <p className="text-xs text-yellow-200">
                    Para predicciones más precisas: entrena más regularmente, asegúrate de registrar todos los datos correctamente y mantén consistencia en tus entrenamientos.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Precisión y Contexto de Predicciones */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Precisión y Limitaciones
            <InfoTooltip
              content={`Contexto sobre la precisión de predicciones. Calidad de datos: ${predictionMetrics.dataQuality.qualityScore}/100. Confianza: ${confidenceInfo.level}.`}
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Indicador de precisión principal */}
            <div className="relative p-4 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/30">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-white">Precisión Estimada de Predicciones</h4>
                <div className={`text-lg font-bold ${confidenceInfo.color}`}>
                  {confidenceInfo.level}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Datos Válidos</div>
                  <div className={`text-sm font-semibold ${predictionMetrics.dataQuality.validationRate >= 90 ? 'text-green-400' :
                    predictionMetrics.dataQuality.validationRate >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {predictionMetrics.dataQuality.validationRate}%
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Confianza IA</div>
                  <div className={`text-sm font-semibold ${confidenceInfo.color}`}>
                    {centralizedMetrics.confidenceLevel}%
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Score Global</div>
                  <div className={`text-sm font-semibold ${predictionMetrics.dataQuality.qualityScore >= 80 ? 'text-green-400' :
                    predictionMetrics.dataQuality.qualityScore >= 60 ? 'text-blue-400' :
                      predictionMetrics.dataQuality.qualityScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {predictionMetrics.dataQuality.qualityScore}/100
                  </div>
                </div>
              </div>

              {/* Gráfico de Factores que afectan precisión */}
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-gray-300 mb-4">Factores que afectan la precisión:</h5>
                <FactorsChart
                  factors={[
                    {
                      name: 'Datos Recientes',
                      value: formatNumber(predictionMetrics.dataQuality.hasRecentData ? 100 : 0),
                      status: predictionMetrics.dataQuality.hasRecentData ? 'good' : 'bad'
                    },
                    {
                      name: 'Registros Suficientes',
                      value: formatNumber(Math.min(100, (predictionMetrics.dataQuality.validRecords / 15) * 100)),
                      status: predictionMetrics.dataQuality.validRecords >= 15 ? 'good' :
                        predictionMetrics.dataQuality.validRecords >= 8 ? 'warning' : 'bad'
                    },
                    {
                      name: 'Historial Temporal',
                      value: formatNumber(Math.min(100, (predictionMetrics.dataQuality.dataSpan / 90) * 100)),
                      status: predictionMetrics.dataQuality.dataSpan >= 30 ? 'good' :
                        predictionMetrics.dataQuality.dataSpan >= 14 ? 'warning' : 'bad'
                    },
                    {
                      name: 'Tendencia Clara',
                      value: formatNumber(Math.min(100, Math.abs(centralizedMetrics.strengthTrend) * 50)),
                      status: Math.abs(centralizedMetrics.strengthTrend) > 0.1 ? 'good' :
                        Math.abs(centralizedMetrics.strengthTrend) > 0.05 ? 'warning' : 'bad'
                    },
                    {
                      name: 'Validación Alta',
                      value: formatNumber(predictionMetrics.dataQuality.validationRate),
                      status: predictionMetrics.dataQuality.validationRate >= 90 ? 'good' :
                        predictionMetrics.dataQuality.validationRate >= 70 ? 'warning' : 'bad'
                    }
                  ]}
                />
              </div>
            </div>

            {/* Limitaciones importantes */}
            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-300 mb-2">Limitaciones importantes</h4>
                  <ul className="space-y-1 text-xs text-blue-200">
                    <li>• Las predicciones son estimaciones estadísticas, no garantías</li>
                    <li>• Factores externos (nutrición, descanso, estrés) no están considerados</li>
                    <li>• Resultados más precisos con entrenamientos regulares y consistentes</li>
                    <li>• Para mejores predicciones: registra todos los datos correctamente</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones IA */}
      {centralizedMetrics.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Recomendaciones IA
              <InfoTooltip
                content={`Recomendaciones personalizadas basadas en ${predictionMetrics.dataQuality.validRecords} entrenamientos válidos. Precisión: ${confidenceInfo.level}.`}
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="relative p-4 sm:p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/80 to-blue-500/80">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-white">Recomendaciones Personalizadas</h5>
                  <p className="text-xs text-gray-400">Basadas en calidad de datos: {predictionMetrics.dataQuality.qualityScore}/100</p>
                </div>
              </div>
              <div className="space-y-2">
                {centralizedMetrics.recommendations.slice(0, 5).map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-300 break-words">{rec}</p>
                  </div>
                ))}
              </div>

              {/* Recomendación específica para mejorar precisión */}
              {predictionMetrics.dataQuality.qualityScore < 70 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-300 font-medium">Para mejorar precisión de predicciones:</p>
                      <ul className="text-xs text-blue-200 mt-1 space-y-1">
                        {!predictionMetrics.dataQuality.hasRecentData && (
                          <li>• Entrena más regularmente (al menos cada 7 días)</li>
                        )}
                        {predictionMetrics.dataQuality.validRecords < 15 && (
                          <li>• Registra más entrenamientos (tienes {predictionMetrics.dataQuality.validRecords}, ideal: 15+)</li>
                        )}
                        {predictionMetrics.dataQuality.validationRate < 90 && (
                          <li>• Asegúrate de registrar todos los datos correctamente</li>
                        )}
                        {predictionMetrics.dataQuality.dataSpan < 30 && (
                          <li>• Mantén consistencia por períodos más largos</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 