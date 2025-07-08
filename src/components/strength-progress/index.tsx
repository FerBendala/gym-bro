import { Award, BarChart3, Target, TrendingUp, Zap } from 'lucide-react';
import React, { useMemo } from 'react';
import type { WorkoutRecord } from '../../interfaces';
import { calculateAdvancedStrengthAnalysis, formatNumber } from '../../utils/functions';
import { Card, CardContent, CardHeader } from '../card';
import { InfoTooltip } from '../tooltip';

interface StrengthProgressProps {
  records: WorkoutRecord[];
}

/**
 * Componente especializado para análisis avanzado de progreso de fuerza
 */
export const StrengthProgress: React.FC<StrengthProgressProps> = ({ records }) => {
  const analysis = useMemo(() => calculateAdvancedStrengthAnalysis(records), [records]);

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Sin datos de fuerza
        </h3>
        <p className="text-gray-500">
          Registra entrenamientos para ver tu análisis avanzado de progreso de fuerza
        </p>
      </div>
    );
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'elite': return 'text-purple-400 bg-purple-900/20';
      case 'advanced': return 'text-orange-400 bg-orange-900/20';
      case 'intermediate': return 'text-blue-400 bg-blue-900/20';
      default: return 'text-green-400 bg-green-900/20';
    }
  };

  const getRateColor = (rate: string) => {
    switch (rate) {
      case 'exceptional': return 'text-purple-400';
      case 'fast': return 'text-green-400';
      case 'moderate': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'deload': return 'text-orange-400 bg-orange-900/20';
      case 'peaking': return 'text-purple-400 bg-purple-900/20';
      case 'intensity': return 'text-red-400 bg-red-900/20';
      default: return 'text-blue-400 bg-blue-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-600/20 rounded-lg">
          <TrendingUp className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Análisis Avanzado de Progreso de Fuerza</h2>
          <p className="text-gray-400">Evaluación comprehensiva de tu desarrollo de fuerza y recomendaciones</p>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(analysis.currentMax1RM)}kg
                </p>
                <p className="text-sm text-gray-400">1RM Máximo</p>
              </div>
              <Award className="w-6 h-6 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${getRateColor(analysis.overallProgress.rate)}`}>
                  {analysis.overallProgress.rate}
                </p>
                <p className="text-sm text-gray-400">Velocidad de Progreso</p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">
                  {analysis.consistencyMetrics.progressionConsistency}%
                </p>
                <p className="text-sm text-gray-400">Consistencia</p>
              </div>
              <Target className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">
                  {analysis.predictions.confidence}%
                </p>
                <p className="text-sm text-gray-400">Confianza Predicción</p>
              </div>
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progreso General */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Progreso General
              <InfoTooltip
                content="Análisis del progreso de fuerza considerando toda tu historia de entrenamiento."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">Progreso Total</span>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-400">
                    +{formatNumber(analysis.overallProgress.absolute)}kg
                  </p>
                  <p className="text-sm text-gray-400">
                    ({analysis.overallProgress.percentage > 0 ? '+' : ''}{analysis.overallProgress.percentage.toFixed(1)}%)
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">Ganancia Mensual</span>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-400">
                    {formatNumber(analysis.strengthCurve.gainRate)}kg/mes
                  </p>
                  <p className="text-sm text-gray-400">Promedio actual</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">Fase de Entrenamiento</span>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getPhaseColor(analysis.strengthCurve.phase)}`}>
                    {analysis.strengthCurve.phase}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">Potencial Alcanzado</span>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-400">
                    {analysis.strengthCurve.potential}%
                  </p>
                  <div className="w-20 bg-gray-700 rounded-full h-2 mt-1">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${analysis.strengthCurve.potential}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Predicciones */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Predicciones
              <InfoTooltip
                content="Proyecciones basadas en tu tendencia actual de progreso y análisis algorítmico."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">PR en 4 semanas</span>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-400">
                    {formatNumber(analysis.predictions.next4WeeksPR)}kg
                  </p>
                  <p className="text-sm text-gray-400">
                    +{formatNumber(analysis.predictions.next4WeeksPR - analysis.currentMax1RM)}kg
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">PR en 12 semanas</span>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-400">
                    {formatNumber(analysis.predictions.next12WeeksPR)}kg
                  </p>
                  <p className="text-sm text-gray-400">
                    +{formatNumber(analysis.predictions.next12WeeksPR - analysis.currentMax1RM)}kg
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">Riesgo de Meseta</span>
                <div className="text-right">
                  <p className={`text-lg font-bold ${analysis.predictions.plateauRisk > 70 ? 'text-red-400' : analysis.predictions.plateauRisk > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {analysis.predictions.plateauRisk}%
                  </p>
                  <div className="w-20 bg-gray-700 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${analysis.predictions.plateauRisk > 70 ? 'bg-red-500' : analysis.predictions.plateauRisk > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${analysis.predictions.plateauRisk}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">Tiempo a próximo PR</span>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-400">
                    {analysis.predictions.timeToNextPR > 0 ? `${analysis.predictions.timeToNextPR} sesiones` : 'Ya superado'}
                  </p>
                  <p className="text-sm text-gray-400">Estimación</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis de Consistencia */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Análisis de Consistencia
            <InfoTooltip
              content="Evaluación de la regularidad y estabilidad de tu progreso de fuerza."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold text-blue-400">
                {analysis.consistencyMetrics.progressionConsistency}%
              </p>
              <p className="text-sm text-gray-400">Progresión Consistente</p>
            </div>

            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold text-yellow-400">
                {analysis.consistencyMetrics.plateauPeriods}
              </p>
              <p className="text-sm text-gray-400">Períodos de Meseta</p>
            </div>

            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold text-green-400">
                {analysis.consistencyMetrics.breakthroughCount}
              </p>
              <p className="text-sm text-gray-400">Breakthroughs</p>
            </div>

            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold text-purple-400">
                {analysis.consistencyMetrics.volatilityIndex}%
              </p>
              <p className="text-sm text-gray-400">Índice de Volatilidad</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones de Entrenamiento */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Recomendaciones de Entrenamiento
            <InfoTooltip
              content="Sugerencias personalizadas basadas en tu fase actual y análisis de progreso."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">Zona de Intensidad</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getZoneColor(analysis.trainingRecommendations.intensityZone)}`}>
                  {analysis.trainingRecommendations.intensityZone}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">RPE Sugerido</span>
                <span className="text-lg font-bold text-white">
                  {analysis.trainingRecommendations.suggestedRPE}/10
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">Ajuste de Volumen</span>
                <span className={`text-lg font-bold ${analysis.trainingRecommendations.volumeAdjustment > 0 ? 'text-green-400' : analysis.trainingRecommendations.volumeAdjustment < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {analysis.trainingRecommendations.volumeAdjustment > 0 ? '+' : ''}{analysis.trainingRecommendations.volumeAdjustment}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">Frecuencia Semanal</span>
                <span className="text-lg font-bold text-blue-400">
                  {analysis.trainingRecommendations.frequencyAdjustment} sesiones
                </span>
              </div>
            </div>

            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <h4 className="text-sm font-medium text-blue-400 mb-2">Consejo de Periodización</h4>
              <p className="text-sm text-gray-300">
                {analysis.trainingRecommendations.periodizationTip}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análisis por Rangos de Repeticiones */}
      {analysis.repRangeAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Análisis por Rangos de Repeticiones
              <InfoTooltip
                content="Efectividad de diferentes rangos de repeticiones para tu progreso de fuerza."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.repRangeAnalysis.map((range, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{range.range}</h4>
                    <p className="text-sm text-gray-400">
                      {formatNumber(range.volume)}kg volumen • {formatNumber(range.maxWeight)}kg máximo
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${range.progressRate > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                      {range.progressRate > 0 ? '+' : ''}{range.progressRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      Efectividad: {range.effectiveness.toFixed(1)}/100
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas de Calidad */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Métricas de Calidad
            <InfoTooltip
              content="Evaluación de la calidad y eficiencia de tu entrenamiento de fuerza."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold text-green-400">
                {analysis.qualityMetrics.formConsistency}%
              </p>
              <p className="text-sm text-gray-400">Consistencia de Forma</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${analysis.qualityMetrics.formConsistency}%` }}
                />
              </div>
            </div>

            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold text-blue-400">
                {analysis.qualityMetrics.loadProgression}%
              </p>
              <p className="text-sm text-gray-400">Progresión de Carga</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${analysis.qualityMetrics.loadProgression}%` }}
                />
              </div>
            </div>

            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold text-purple-400">
                {analysis.qualityMetrics.volumeOptimization}%
              </p>
              <p className="text-sm text-gray-400">Optimización de Volumen</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${analysis.qualityMetrics.volumeOptimization}%` }}
                />
              </div>
            </div>

            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold text-yellow-400">
                {analysis.qualityMetrics.recoveryIndicators}%
              </p>
              <p className="text-sm text-gray-400">Indicadores de Recuperación</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${analysis.qualityMetrics.recoveryIndicators}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 