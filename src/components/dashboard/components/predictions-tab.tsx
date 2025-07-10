import {
  Activity,
  AlertTriangle,
  BarChart,
  Brain,
  CheckCircle,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Weight
} from 'lucide-react';
import React, { useMemo } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { calculateAdvancedAnalysis } from '../../../utils/functions/advanced-analysis';
import { formatNumber } from '../../../utils/functions/stats-utils';
import { Card, CardContent, CardHeader } from '../../card';
import { StatCard } from '../../stat-card';
import { InfoTooltip } from '../../tooltip';

interface PredictionsTabProps {
  records: WorkoutRecord[];
}

export const PredictionsTab: React.FC<PredictionsTabProps> = ({ records }) => {
  const analysis = useMemo(() => calculateAdvancedAnalysis(records), [records]);

  // Función utilitaria para validar valores numéricos
  const safeNumber = (value: any, defaultValue: number = 0): number => {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      return defaultValue;
    }
    return value;
  };

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
          tooltip="Peso estimado que podrías manejar la próxima semana basado en tu progresión actual."
          tooltipPosition="top"
        />
        <StatCard
          title="Próximo PR"
          value={`${analysis.progressPrediction.predictedPR.weight}kg`}
          icon={Trophy}
          variant={analysis.progressPrediction.predictedPR.confidence >= 70 ? 'success' :
            analysis.progressPrediction.predictedPR.confidence >= 50 ? 'warning' : 'danger'}
          tooltip="Tu próximo récord personal estimado por la IA. Confianza basada en patrones de entrenamiento."
          tooltipPosition="top"
        />
        <StatCard
          title="Crecimiento Mensual"
          value={`+${analysis.progressPrediction.monthlyGrowthRate}kg`}
          icon={BarChart}
          variant={analysis.progressPrediction.monthlyGrowthRate > 5 ? 'success' :
            analysis.progressPrediction.monthlyGrowthRate > 2 ? 'warning' : 'danger'}
          tooltip="Tasa de crecimiento mensual estimada basada en tu progresión actual."
          tooltipPosition="top"
        />
        <StatCard
          title="Riesgo Meseta"
          value={`${analysis.progressPrediction.plateauRisk}%`}
          icon={AlertTriangle}
          variant={analysis.progressPrediction.plateauRisk < 30 ? 'success' :
            analysis.progressPrediction.plateauRisk <= 60 ? 'warning' : 'danger'}
          tooltip="Probabilidad de entrar en una meseta de progreso. ≤30% es bajo riesgo, >60% requiere cambios."
          tooltipPosition="top"
        />
      </div>

      {/* Análisis de Tendencia Principal - Estilo Balance Muscular */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Análisis de Tendencia IA
            <InfoTooltip
              content="Análisis de tendencia avanzado que combina múltiples factores para predecir tu progreso futuro."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="relative p-4 sm:p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200">
            {/* Header con ícono y estado */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-br ${analysis.progressPrediction.trendAnalysis === 'mejorando' ? 'from-green-500/80 to-emerald-500/80' :
                  analysis.progressPrediction.trendAnalysis === 'estable' ? 'from-blue-500/80 to-cyan-500/80' :
                    analysis.progressPrediction.trendAnalysis === 'empeorando' ? 'from-red-500/80 to-orange-500/80' :
                      'from-gray-500/80 to-gray-600/80'}`}>
                  {analysis.progressPrediction.trendAnalysis === 'mejorando' ? (
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  ) : analysis.progressPrediction.trendAnalysis === 'empeorando' ? (
                    <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  ) : (
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">
                    Análisis de Tendencia
                  </h4>
                  <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${analysis.progressPrediction.trendAnalysis === 'mejorando' ? 'bg-green-500 text-white' :
                      analysis.progressPrediction.trendAnalysis === 'estable' ? 'bg-blue-500 text-white' :
                        analysis.progressPrediction.trendAnalysis === 'empeorando' ? 'bg-red-500 text-white' :
                          'bg-gray-500 text-white'}`}>
                      {analysis.progressPrediction.trendAnalysis === 'mejorando' ? '📈 MEJORANDO' :
                        analysis.progressPrediction.trendAnalysis === 'estable' ? '➡️ ESTABLE' :
                          analysis.progressPrediction.trendAnalysis === 'empeorando' ? '📉 EMPEORANDO' :
                            '❓ INSUFICIENTE'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${analysis.progressPrediction.confidenceLevel >= 70 ? 'bg-green-500 text-white' :
                      analysis.progressPrediction.confidenceLevel >= 50 ? 'bg-yellow-500 text-black' :
                        'bg-red-500 text-white'}`}>
                      Confianza: {analysis.progressPrediction.confidenceLevel}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right ml-2 sm:ml-4">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  {analysis.progressPrediction.nextWeekWeight}kg
                </div>
                <div className="text-xs text-gray-400">
                  próxima semana
                </div>
              </div>
            </div>

            {/* Barra de progreso de confianza */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Nivel de Confianza</span>
                <span className="text-gray-300">
                  {analysis.progressPrediction.confidenceLevel}%
                </span>
              </div>
              <div className="relative h-3 sm:h-4 md:h-6 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`relative h-full bg-gradient-to-r ${analysis.progressPrediction.confidenceLevel >= 70 ? 'from-green-500/80 to-emerald-500/80' :
                    analysis.progressPrediction.confidenceLevel >= 50 ? 'from-yellow-500/80 to-orange-500/80' :
                      'from-red-500/80 to-pink-500/80'} transition-all duration-300`}
                  style={{ width: `${Math.min(100, safeNumber(analysis.progressPrediction.confidenceLevel, 0))}%` }}
                >
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                  {safeNumber(analysis.progressPrediction.confidenceLevel, 0) > 15 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white drop-shadow-sm">
                        {safeNumber(analysis.progressPrediction.confidenceLevel, 0)}%
                      </span>
                    </div>
                  )}
                </div>
                {safeNumber(analysis.progressPrediction.confidenceLevel, 0) <= 15 && safeNumber(analysis.progressPrediction.confidenceLevel, 0) > 0 && (
                  <div className="absolute top-0 left-2 h-full flex items-center">
                    <span className="text-xs font-medium text-white drop-shadow-sm">
                      {safeNumber(analysis.progressPrediction.confidenceLevel, 0)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Grid de métricas - Estilo Balance Muscular */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Tendencia Fuerza</div>
                <div className={`text-sm sm:text-lg font-semibold ${analysis.progressPrediction.strengthTrend > 0 ? 'text-green-400' :
                  analysis.progressPrediction.strengthTrend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {analysis.progressPrediction.strengthTrend > 0 ? '+' : ''}{analysis.progressPrediction.strengthTrend}kg
                </div>
                <div className="relative w-full bg-gray-700 rounded-full h-2 mt-1">
                  <div
                    className={`${analysis.progressPrediction.strengthTrend > 0 ? 'bg-green-500' : 'bg-red-500'} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(100, Math.max(10, Math.abs(safeNumber(analysis.progressPrediction.strengthTrend, 0)) * 5))}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Tendencia Volumen</div>
                <div className={`text-sm sm:text-lg font-semibold ${analysis.progressPrediction.volumeTrend > 0 ? 'text-green-400' :
                  analysis.progressPrediction.volumeTrend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {analysis.progressPrediction.volumeTrend > 0 ? '+' : ''}{analysis.progressPrediction.volumeTrend}kg
                </div>
                <div className="relative w-full bg-gray-700 rounded-full h-2 mt-1">
                  <div
                    className={`${analysis.progressPrediction.volumeTrend > 0 ? 'bg-blue-500' : 'bg-orange-500'} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(100, Math.max(10, Math.abs(safeNumber(analysis.progressPrediction.volumeTrend, 0)) / 10))}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Crecimiento Mensual</div>
                <div className="text-sm sm:text-lg font-semibold text-white">
                  {analysis.progressPrediction.monthlyGrowthRate}kg
                </div>
                <div className="text-xs text-gray-500">por mes</div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Riesgo Meseta</div>
                <div className={`text-sm sm:text-lg font-semibold ${analysis.progressPrediction.plateauRisk < 30 ? 'text-green-400' :
                  analysis.progressPrediction.plateauRisk <= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {analysis.progressPrediction.plateauRisk}%
                </div>
                <div className="relative w-full bg-gray-700 rounded-full h-2 mt-1">
                  <div
                    className={`${analysis.progressPrediction.plateauRisk < 30 ? 'bg-green-500' :
                      analysis.progressPrediction.plateauRisk <= 60 ? 'bg-yellow-500' : 'bg-red-500'} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${safeNumber(analysis.progressPrediction.plateauRisk, 0)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predicción de PR Principal - Estilo Balance Muscular */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            Predicción de Récord Personal
            <InfoTooltip
              content="Predicción de tu próximo récord personal basada en patrones de entrenamiento y algoritmos avanzados."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="relative p-4 sm:p-6 rounded-xl bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-br from-purple-500/80 to-violet-500/80">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">
                    Próximo Récord Personal
                  </h4>
                  <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
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
              <div className="text-right ml-2 sm:ml-4">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-400">
                  {analysis.progressPrediction.predictedPR.weight}kg
                </div>
                <div className="text-xs text-gray-400">
                  record estimado
                </div>
              </div>
            </div>

            {/* Barra de progreso hacia el PR */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Progreso hacia PR</span>
                <span className="text-purple-300">
                  {analysis.progressPrediction.predictedPR.confidence}% probabilidad
                </span>
              </div>
              <div className="relative h-3 sm:h-4 md:h-6 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="relative h-full bg-gradient-to-r from-purple-500/80 to-violet-500/80 transition-all duration-300"
                  style={{ width: `${Math.min(100, safeNumber(analysis.progressPrediction.predictedPR.confidence, 0))}%` }}
                >
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                  {safeNumber(analysis.progressPrediction.predictedPR.confidence, 0) > 15 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white drop-shadow-sm">
                        {analysis.progressPrediction.predictedPR.weight}kg
                      </span>
                    </div>
                  )}
                </div>
                {safeNumber(analysis.progressPrediction.predictedPR.confidence, 0) <= 15 && safeNumber(analysis.progressPrediction.predictedPR.confidence, 0) > 0 && (
                  <div className="absolute top-0 left-2 h-full flex items-center">
                    <span className="text-xs font-medium text-white drop-shadow-sm">
                      {analysis.progressPrediction.predictedPR.weight}kg
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Grid de métricas del PR */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="bg-purple-800/30 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-xs text-purple-300 mb-1">Peso Actual Máximo</div>
                <div className="text-sm sm:text-lg font-semibold text-white">
                  {Math.max(...records.map(r => r.weight))}kg
                </div>
              </div>
              <div className="bg-purple-800/30 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-xs text-purple-300 mb-1">Mejora Esperada</div>
                <div className="text-sm sm:text-lg font-semibold text-purple-400">
                  +{(analysis.progressPrediction.predictedPR.weight - Math.max(...records.map(r => r.weight))).toFixed(1)}kg
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predicciones Semanales */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Predicciones Semanales
            <InfoTooltip
              content="Predicciones específicas para la próxima semana basadas en tu progresión actual."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative p-4 rounded-xl bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/80 to-cyan-500/80">
                  <Weight className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-white">Peso Próxima Semana</h5>
                  <p className="text-xs text-gray-400">Predicción de fuerza</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-400 mb-2">
                {analysis.progressPrediction.nextWeekWeight}kg
              </div>
              <div className="text-xs text-gray-400">
                Basado en tendencia actual de {analysis.progressPrediction.strengthTrend > 0 ? '+' : ''}{analysis.progressPrediction.strengthTrend}kg/semana
              </div>
            </div>

            <div className="relative p-4 rounded-xl bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/80 to-emerald-500/80">
                  <BarChart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-white">Volumen Próxima Semana</h5>
                  <p className="text-xs text-gray-400">Predicción de carga</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-400 mb-2">
                {formatNumber(analysis.progressPrediction.nextWeekVolume)}
              </div>
              <div className="text-xs text-gray-400">
                Basado en tendencia de {analysis.progressPrediction.volumeTrend > 0 ? '+' : ''}{analysis.progressPrediction.volumeTrend}kg/semana
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
                content="Recomendaciones personalizadas generadas por inteligencia artificial basadas en tu progreso y patrones."
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
                <h5 className="text-sm font-medium text-white">Recomendaciones Personalizadas</h5>
              </div>
              <div className="space-y-2">
                {analysis.progressPrediction.recommendations.slice(0, 5).map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-300 break-words">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 