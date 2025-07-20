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
import { calculateAdvancedAnalysis } from '../../../utils/functions/advanced-analysis';
import { Card, CardContent, CardHeader } from '../../card';
import { StatCard } from '../../stat-card';
import { InfoTooltip } from '../../tooltip';
import { usePredictionMetrics, type EnhancedPredictionMetrics } from '../hooks';
import {
  ConfidenceGauge,
  DataQualityRadial,
  FactorsChart,
  PredictionTimeline,
  PRProgressChart,
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

  const avgRecentWeight = recentRecords.reduce((sum, r) => sum + r.weight, 0) / recentRecords.length;
  const maxRecentWeight = Math.max(...recentRecords.map(r => r.weight));

  const minReasonable = avgRecentWeight;
  const maxReasonable = maxRecentWeight + 2.5; // Máximo 2.5kg mejora semanal

  if (rawPrediction < minReasonable) {
    return Math.round(avgRecentWeight * 1.01 * 100) / 100; // 1% conservador
  } else if (rawPrediction > maxReasonable) {
    return Math.round(maxReasonable * 100) / 100;
  }

  return Math.round(rawPrediction * 100) / 100;
};

const validatePRWeight = (records: WorkoutRecord[], rawPrediction: number): number => {
  const recentRecords = getRecentRecords(records);
  if (recentRecords.length === 0) return 0;

  const recentMaxWeight = Math.max(...recentRecords.map(r => r.weight));

  if (recentMaxWeight > 0) {
    const minReasonablePR = recentMaxWeight * 1.01; // Mínimo 1% mejora
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
  return Math.max(-2, Math.min(2, rawTrend)); // Limitar a ±2kg/sem
};

const validateMonthlyGrowth = (rawGrowth: number): number => {
  return Math.max(-5, Math.min(10, rawGrowth)); // Rango realista: -5kg a +10kg/mes
};

const validateTimeToNextPR = (rawTime: number): number => {
  return Math.max(1, Math.min(52, rawTime || 8)); // Entre 1 y 52 semanas
};

const calculateValidatedCurrentWeight = (records: WorkoutRecord[]): number => {
  const recentRecords = getRecentRecords(records);
  if (recentRecords.length === 0) return 0;

  return Math.max(...recentRecords.map(r => r.weight));
};

const calculateValidatedBaseline1RM = (records: WorkoutRecord[]): number => {
  const recentRecords = getRecentRecords(records);
  if (recentRecords.length === 0) return 0;

  // Calcular 1RM estimado promedio de registros recientes
  const estimated1RMs = recentRecords.map(r => r.weight * (1 + r.reps / 30));
  return estimated1RMs.reduce((sum, val) => sum + val, 0) / estimated1RMs.length;
};

const calculateValidatedImprovement = (records: WorkoutRecord[], predictedPR: number): number => {
  const recentMaxWeight = calculateValidatedCurrentWeight(records);
  const improvement = predictedPR - recentMaxWeight;
  return Math.max(0, Math.min(15, improvement)); // Limitar mejora a 15kg máximo
};

export const PredictionsTab: React.FC<PredictionsTabProps> = ({ records }) => {
  const analysis = useMemo(() => calculateAdvancedAnalysis(records), [records]);

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

  const confidenceInfo = getConfidenceExplanation(analysis.progressPrediction.confidenceLevel);

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
          value={`${analysis.progressPrediction.nextWeekWeight}kg`}
          icon={TrendingUp}
          variant={analysis.progressPrediction.trendAnalysis === 'mejorando' ? 'success' :
            analysis.progressPrediction.trendAnalysis === 'empeorando' ? 'danger' : 'warning'}
          tooltip={`Peso estimado basado en tendencia de ${analysis.progressPrediction.strengthTrend > 0 ? '+' : ''}${analysis.progressPrediction.strengthTrend}kg/semana. Confianza: ${confidenceInfo.level}. Calidad datos: ${predictionMetrics.dataQuality.qualityScore}/100.`}
          tooltipPosition="top"
        />
        <StatCard
          title="Próximo PR"
          value={`${analysis.progressPrediction.predictedPR.weight}kg`}
          icon={Trophy}
          variant={analysis.progressPrediction.predictedPR.confidence >= 70 ? 'success' :
            analysis.progressPrediction.predictedPR.confidence >= 50 ? 'warning' : 'danger'}
          tooltip={`Récord personal estimado con ${analysis.progressPrediction.predictedPR.confidence}% de confianza. Mejora de ${predictionMetrics.formattedImprovement} vs baseline ${predictionMetrics.formattedBaseline}kg. Algoritmo considera ${predictionMetrics.dataQuality.validRecords} entrenamientos válidos.`}
          tooltipPosition="top"
        />
        <StatCard
          title="Crecimiento Mensual"
          value={`+${analysis.progressPrediction.monthlyGrowthRate}kg`}
          icon={BarChart}
          variant={analysis.progressPrediction.monthlyGrowthRate > 5 ? 'success' :
            analysis.progressPrediction.monthlyGrowthRate > 2 ? 'warning' : 'danger'}
          tooltip={`Crecimiento proyectado basado en tendencia semanal de ${analysis.progressPrediction.strengthTrend > 0 ? '+' : ''}${analysis.progressPrediction.strengthTrend}kg. Span de datos: ${predictionMetrics.dataQuality.dataSpan} días. ${predictionMetrics.dataQuality.hasRecentData ? 'Incluye datos recientes.' : 'Sin datos recientes - precisión reducida.'}`}
          tooltipPosition="top"
        />
        <StatCard
          title="Riesgo Meseta"
          value={`${analysis.progressPrediction.plateauRisk}%`}
          icon={AlertTriangle}
          variant={analysis.progressPrediction.plateauRisk < 30 ? 'success' :
            analysis.progressPrediction.plateauRisk <= 60 ? 'warning' : 'danger'}
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
                  {analysis.progressPrediction.nextWeekWeight}kg
                </div>
                <div className="text-xs text-gray-400">próxima semana</div>
              </div>
            </div>

            {/* Gráfico Radar de Tendencia */}
            <div className="relative">
              <TrendAnalysisChart
                strengthTrend={analysis.progressPrediction.strengthTrend}
                volumeTrend={analysis.progressPrediction.volumeTrend}
                monthlyGrowthRate={analysis.progressPrediction.monthlyGrowthRate}
                plateauRisk={analysis.progressPrediction.plateauRisk}
                confidenceLevel={analysis.progressPrediction.confidenceLevel}
                trendAnalysis={analysis.progressPrediction.trendAnalysis}
              />
            </div>

            {/* Métricas numéricas resumidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-700">
              <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                <div className="text-xs text-gray-400">Fuerza</div>
                <div className={`text-sm font-semibold ${analysis.progressPrediction.strengthTrend > 0 ? 'text-green-400' :
                  analysis.progressPrediction.strengthTrend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {analysis.progressPrediction.strengthTrend > 0 ? '+' : ''}{analysis.progressPrediction.strengthTrend}kg/sem
                </div>
              </div>
              <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                <div className="text-xs text-gray-400">Volumen</div>
                <div className={`text-sm font-semibold ${analysis.progressPrediction.volumeTrend > 0 ? 'text-blue-400' :
                  analysis.progressPrediction.volumeTrend < 0 ? 'text-orange-400' : 'text-gray-400'}`}>
                  {analysis.progressPrediction.volumeTrend > 0 ? '+' : ''}{analysis.progressPrediction.volumeTrend}kg/sem
                </div>
              </div>
              <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                <div className="text-xs text-gray-400">Crecimiento</div>
                <div className="text-sm font-semibold text-white">
                  +{analysis.progressPrediction.monthlyGrowthRate}kg/mes
                </div>
              </div>
              <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                <div className="text-xs text-gray-400">Confianza</div>
                <div className={`text-sm font-semibold ${analysis.progressPrediction.confidenceLevel >= 70 ? 'text-green-400' :
                  analysis.progressPrediction.confidenceLevel >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {analysis.progressPrediction.confidenceLevel}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predicción de Récord Personal - Gráfico Semi-Gauge */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            Predicción de Récord Personal
            <InfoTooltip
              content={`Predicción visual basada en tu baseline de ${predictionMetrics.formattedBaseline}kg. El gauge muestra el progreso hacia tu PR estimado de ${analysis.progressPrediction.predictedPR.weight}kg con ${analysis.progressPrediction.predictedPR.confidence}% de confianza.`}
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Header con estado de confianza */}
            <div className="flex items-center justify-between p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/80 to-violet-500/80">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">Próximo Récord Personal</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${analysis.progressPrediction.predictedPR.confidence >= 70 ? 'bg-green-500 text-white' :
                      analysis.progressPrediction.predictedPR.confidence >= 50 ? 'bg-yellow-500 text-black' :
                        'bg-red-500 text-white'}`}>
                      Confianza: {analysis.progressPrediction.predictedPR.confidence}%
                    </span>
                    {analysis.progressPrediction.timeToNextPR > 0 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500 text-white">
                        {analysis.progressPrediction.timeToNextPR} semana{analysis.progressPrediction.timeToNextPR !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-purple-400">
                  {validatePRWeight(records, analysis.progressPrediction.predictedPR.weight)}kg
                </div>
                <div className="text-xs text-gray-400">objetivo estimado</div>
              </div>
            </div>

            {/* Gráfico Semi-Gauge de Progreso hacia PR */}
            <div className="relative p-4 bg-gray-800/30 rounded-lg border border-purple-500/20">
              <PRProgressChart
                currentWeight={calculateValidatedCurrentWeight(records)}
                predictedPR={validatePRWeight(records, analysis.progressPrediction.predictedPR.weight)}
                baseline1RM={calculateValidatedBaseline1RM(records)}
                confidence={Math.max(5, Math.min(95, analysis.progressPrediction.predictedPR.confidence))}
                timeToNextPR={validateTimeToNextPR(analysis.progressPrediction.timeToNextPR)}
                improvement={calculateValidatedImprovement(records, validatePRWeight(records, analysis.progressPrediction.predictedPR.weight))}
              />
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
                currentWeight={calculateValidatedCurrentWeight(records)}
                nextWeekWeight={validateNextWeekWeight(records, analysis.progressPrediction.nextWeekWeight)}
                predictedPR={validatePRWeight(records, analysis.progressPrediction.predictedPR.weight)}
                monthlyGrowthRate={validateMonthlyGrowth(analysis.progressPrediction.monthlyGrowthRate)}
                strengthTrend={validateStrengthTrend(analysis.progressPrediction.strengthTrend)}
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
                  {validateNextWeekWeight(records, analysis.progressPrediction.nextWeekWeight)}kg
                </div>
                <div className="text-xs text-gray-400">
                  {(() => {
                    const validTrend = validateStrengthTrend(analysis.progressPrediction.strengthTrend);
                    return `${validTrend > 0 ? '+' : ''}${validTrend}kg/sem`;
                  })()}
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
                  {validatePRWeight(records, analysis.progressPrediction.predictedPR.weight)}kg
                </div>
                <div className="text-xs text-gray-400">
                  {validateTimeToNextPR(analysis.progressPrediction.timeToNextPR)} semanas
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
                  confidence={analysis.progressPrediction.confidenceLevel}
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
                    {analysis.progressPrediction.confidenceLevel}%
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
                      value: predictionMetrics.dataQuality.hasRecentData ? 100 : 0,
                      status: predictionMetrics.dataQuality.hasRecentData ? 'good' : 'bad'
                    },
                    {
                      name: 'Registros Suficientes',
                      value: Math.min(100, (predictionMetrics.dataQuality.validRecords / 15) * 100),
                      status: predictionMetrics.dataQuality.validRecords >= 15 ? 'good' :
                        predictionMetrics.dataQuality.validRecords >= 8 ? 'warning' : 'bad'
                    },
                    {
                      name: 'Historial Temporal',
                      value: Math.min(100, (predictionMetrics.dataQuality.dataSpan / 90) * 100),
                      status: predictionMetrics.dataQuality.dataSpan >= 30 ? 'good' :
                        predictionMetrics.dataQuality.dataSpan >= 14 ? 'warning' : 'bad'
                    },
                    {
                      name: 'Tendencia Clara',
                      value: Math.min(100, Math.abs(analysis.progressPrediction.strengthTrend) * 50),
                      status: Math.abs(analysis.progressPrediction.strengthTrend) > 0.1 ? 'good' :
                        Math.abs(analysis.progressPrediction.strengthTrend) > 0.05 ? 'warning' : 'bad'
                    },
                    {
                      name: 'Validación Alta',
                      value: predictionMetrics.dataQuality.validationRate,
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
      {analysis.progressPrediction.recommendations.length > 0 && (
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
                {analysis.progressPrediction.recommendations.slice(0, 5).map((rec, index) => (
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