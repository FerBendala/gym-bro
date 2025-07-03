import { AlertTriangle, BarChart, Brain, Clock, Target, TrendingUp, Zap } from 'lucide-react';
import React, { useMemo } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { formatNumber } from '../../../utils/functions';
import { calculateAdvancedAnalysis } from '../../../utils/functions/advanced-analysis';
import { Card, CardContent, CardHeader } from '../../card';
import { StatCard } from '../../stat-card';

interface AdvancedTabProps {
  records: WorkoutRecord[];
}

export const AdvancedTab: React.FC<AdvancedTabProps> = ({ records }) => {
  const analysis = useMemo(() => calculateAdvancedAnalysis(records), [records]);

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Brain className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Sin datos para análisis avanzado
        </h3>
        <p className="text-gray-500">
          Registra al menos 10 entrenamientos para obtener métricas avanzadas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas clave de análisis avanzado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Eficiencia Temporal"
          value={`${analysis.trainingEfficiency.timeEfficiencyScore}%`}
          icon={Clock}
          variant={analysis.trainingEfficiency.timeEfficiencyScore >= 70 ? 'success' :
            analysis.trainingEfficiency.timeEfficiencyScore >= 50 ? 'warning' : 'danger'}
        />
        <StatCard
          title="Índice de Fatiga"
          value={`${analysis.fatigueAnalysis.fatigueIndex}%`}
          icon={AlertTriangle}
          variant={analysis.fatigueAnalysis.fatigueIndex <= 30 ? 'success' :
            analysis.fatigueAnalysis.fatigueIndex <= 60 ? 'warning' : 'danger'}
        />
        <StatCard
          title="Intensidad General"
          value={analysis.intensityMetrics.overallIntensity}
          icon={Zap}
          variant={analysis.intensityMetrics.overallIntensity === 'Óptima' ? 'success' :
            analysis.intensityMetrics.overallIntensity === 'Alta' ? 'warning' : 'primary'}
        />
        <StatCard
          title="Riesgo Meseta"
          value={`${analysis.progressPrediction.plateauRisk}%`}
          icon={TrendingUp}
          variant={analysis.progressPrediction.plateauRisk <= 30 ? 'success' :
            analysis.progressPrediction.plateauRisk <= 60 ? 'warning' : 'danger'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Densidad de entrenamiento */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <BarChart className="w-5 h-5 mr-2" />
              Densidad de Entrenamiento
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.trainingDensity.map((density) => (
                <div
                  key={density.period}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-white">
                      {density.period}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {density.workoutsPerWeek} entrenamientos/semana
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${density.intensityLevel === 'Muy Alta' ? 'text-red-400' :
                        density.intensityLevel === 'Alta' ? 'text-yellow-400' :
                          density.intensityLevel === 'Media' ? 'text-green-400' : 'text-gray-400'
                      }`}>
                      {density.intensityLevel}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatNumber(density.volumePerWorkout)} kg/sesión
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Análisis de fatiga */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Análisis de Fatiga
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-white">
                    {analysis.fatigueAnalysis.recoveryDays}
                  </p>
                  <p className="text-sm text-gray-400">Días descanso</p>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <p className={`text-2xl font-bold ${analysis.fatigueAnalysis.overreachingRisk === 'Bajo' ? 'text-green-400' :
                      analysis.fatigueAnalysis.overreachingRisk === 'Medio' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                    {analysis.fatigueAnalysis.overreachingRisk}
                  </p>
                  <p className="text-sm text-gray-400">Riesgo sobreentrenamiento</p>
                </div>
              </div>

              {analysis.fatigueAnalysis.volumeDropIndicators && (
                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400 font-medium">
                    ⚠️ Caída significativa en volumen detectada
                  </p>
                </div>
              )}

              <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-400 font-medium">Recomendación:</p>
                <p className="text-sm text-gray-300 mt-1">
                  {analysis.fatigueAnalysis.restRecommendation}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparación de períodos */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Comparación Temporal
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.periodComparisons.slice(0, 3).map((period) => (
                <div
                  key={period.periodName}
                  className="p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">
                      {period.periodName}
                    </h4>
                    <p className={`text-sm font-medium ${period.improvement > 0 ? 'text-green-400' :
                        period.improvement < 0 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                      {period.improvement > 0 ? '+' : ''}{period.improvement}%
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <p className="text-gray-400">
                      Volumen: {period.volumeChange > 0 ? '+' : ''}{period.volumeChange}%
                    </p>
                    <p className="text-gray-400">
                      Fuerza: {period.strengthChange > 0 ? '+' : ''}{period.strengthChange}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Predicciones */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Predicciones
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <p className="text-lg font-bold text-blue-400">
                    {analysis.progressPrediction.nextWeekWeight}kg
                  </p>
                  <p className="text-xs text-gray-400">Peso proyectado</p>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <p className="text-lg font-bold text-green-400">
                    {formatNumber(analysis.progressPrediction.nextWeekVolume)}
                  </p>
                  <p className="text-xs text-gray-400">Volumen proyectado</p>
                </div>
              </div>

              <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <p className="text-sm text-purple-400 font-medium mb-1">
                  Próximo PR predicho:
                </p>
                <p className="text-lg font-bold text-white">
                  {analysis.progressPrediction.predictedPR.weight}kg
                </p>
                <p className="text-xs text-gray-400">
                  Confianza: {analysis.progressPrediction.predictedPR.confidence}%
                </p>
              </div>

              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <p className="text-lg font-bold text-yellow-400">
                  {analysis.progressPrediction.monthlyGrowthRate > 0 ? '+' : ''}{analysis.progressPrediction.monthlyGrowthRate}kg
                </p>
                <p className="text-xs text-gray-400">Crecimiento mensual</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas de intensidad */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Análisis de Intensidad
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Gráfico de barras de intensidad */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Intensidad Peso</p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, analysis.intensityMetrics.averageIntensity)}%` }}
                    />
                  </div>
                  <p className="text-lg font-bold text-white">
                    {analysis.intensityMetrics.averageIntensity}%
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Intensidad Volumen</p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, analysis.intensityMetrics.volumeIntensity)}%` }}
                    />
                  </div>
                  <p className="text-lg font-bold text-white">
                    {analysis.intensityMetrics.volumeIntensity}%
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Intensidad Frecuencia</p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, analysis.intensityMetrics.frequencyIntensity)}%` }}
                    />
                  </div>
                  <p className="text-lg font-bold text-white">
                    {analysis.intensityMetrics.frequencyIntensity}%
                  </p>
                </div>
              </div>

              {/* Rango óptimo de carga */}
              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300">
                      Rango Óptimo de Carga
                    </h4>
                    <p className="text-xs text-gray-400">
                      Basado en historial de entrenamientos
                    </p>
                  </div>
                  <p className="text-lg font-bold text-blue-400">
                    {analysis.trainingEfficiency.optimalLoadRange.min}-{analysis.trainingEfficiency.optimalLoadRange.max}kg
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Indicadores de rendimiento pico */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Indicadores de Rendimiento
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.peakPerformanceIndicators.length > 0 ? (
                analysis.peakPerformanceIndicators.map((indicator, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-green-900/20 border border-green-500/30 rounded-lg"
                  >
                    <Target className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                    <p className="text-sm text-green-400">{indicator}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">
                  Continúa entrenando para alcanzar indicadores de rendimiento pico
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sugerencias de optimización */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Sugerencias de Optimización
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.optimizationSuggestions.slice(0, 5).map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-start p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg"
                >
                  <Brain className="w-4 h-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-400">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};