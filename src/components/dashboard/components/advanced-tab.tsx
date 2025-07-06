import { AlertTriangle, BarChart, Brain, Clock, Target, TrendingUp, Zap } from 'lucide-react';
import React, { useMemo } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { formatNumber } from '../../../utils/functions';
import { calculateAdvancedAnalysis } from '../../../utils/functions/advanced-analysis';
import { Card, CardContent, CardHeader } from '../../card';
import { StatCard } from '../../stat-card';
import { InfoTooltip } from '../../tooltip';

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
          tooltip="Mide qué tan eficientemente utilizas tu tiempo de entrenamiento. 70%+ es excelente, 50-69% es bueno, <50% necesita optimización."
          tooltipPosition="top"
        />
        <StatCard
          title="Índice de Fatiga"
          value={`${analysis.fatigueAnalysis.fatigueIndex}%`}
          icon={AlertTriangle}
          variant={analysis.fatigueAnalysis.fatigueIndex <= 30 ? 'success' :
            analysis.fatigueAnalysis.fatigueIndex <= 60 ? 'warning' : 'danger'}
          tooltip="Indica tu nivel de fatiga acumulada. ≤30% es óptimo, 31-60% requiere atención, >60% sugiere descanso inmediato."
          tooltipPosition="top"
        />
        <StatCard
          title="Intensidad General"
          value={analysis.intensityMetrics.overallIntensity}
          icon={Zap}
          variant={analysis.intensityMetrics.overallIntensity === 'Óptima' ? 'success' :
            analysis.intensityMetrics.overallIntensity === 'Alta' ? 'warning' : 'primary'}
          tooltip="Evaluación de la intensidad general de tus entrenamientos. 'Óptima' es ideal para progreso sostenible, 'Alta' requiere monitoreo."
          tooltipPosition="top"
        />
        <StatCard
          title="Riesgo Meseta"
          value={`${analysis.progressPrediction.plateauRisk}%`}
          icon={TrendingUp}
          variant={analysis.progressPrediction.plateauRisk <= 30 ? 'success' :
            analysis.progressPrediction.plateauRisk <= 60 ? 'warning' : 'danger'}
          tooltip="Probabilidad de entrar en una meseta de progreso. ≤30% es bajo riesgo, 31-60% moderado, >60% alto riesgo de estancamiento."
          tooltipPosition="top"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Densidad de entrenamiento */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <BarChart className="w-5 h-5 mr-2" />
              Densidad de Entrenamiento
              <InfoTooltip
                content="Análisis de la concentración e intensidad de tus entrenamientos por período. Te ayuda a identificar patrones de carga de trabajo."
                position="top"
                className="ml-2"
              />
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
              <InfoTooltip
                content="Evaluación de tu estado de fatiga y riesgo de sobreentrenamiento. Fundamental para prevenir lesiones y optimizar recuperación."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-white">
                    {analysis.fatigueAnalysis.recoveryDays}
                  </p>
                  <div className="text-sm text-gray-400 flex items-center justify-center">
                    <span>Días descanso</span>
                    <InfoTooltip
                      content="Días promedio de descanso entre entrenamientos intensos. Importante para la recuperación muscular."
                      position="top"
                      className="ml-1"
                    />
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <p className={`text-2xl font-bold ${analysis.fatigueAnalysis.overreachingRisk === 'Bajo' ? 'text-green-400' :
                    analysis.fatigueAnalysis.overreachingRisk === 'Medio' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                    {analysis.fatigueAnalysis.overreachingRisk}
                  </p>
                  <div className="text-sm text-gray-400 flex items-center justify-center">
                    <span>Riesgo sobreentrenamiento</span>
                    <InfoTooltip
                      content="Evaluación del riesgo de entrenar más allá de tu capacidad de recuperación. Alto riesgo requiere descanso inmediato."
                      position="top"
                      className="ml-1"
                    />
                  </div>
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
              <InfoTooltip
                content="Comparación de tu rendimiento entre diferentes períodos de tiempo. Te ayuda a identificar tendencias de mejora o declive."
                position="top"
                className="ml-2"
              />
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
              <InfoTooltip
                content="Proyecciones basadas en tus patrones de entrenamiento actuales. Útil para planificar objetivos y expectativas realistas."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <p className="text-lg font-bold text-blue-400">
                    {analysis.progressPrediction.nextWeekWeight}kg
                  </p>
                  <div className="text-xs text-gray-400 flex items-center justify-center">
                    <span>Peso proyectado</span>
                    <InfoTooltip
                      content="Peso estimado que podrías manejar la próxima semana basado en tu progresión actual."
                      position="top"
                      className="ml-1"
                    />
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <p className="text-lg font-bold text-green-400">
                    {formatNumber(analysis.progressPrediction.nextWeekVolume)}
                  </p>
                  <div className="text-xs text-gray-400 flex items-center justify-center">
                    <span>Volumen proyectado</span>
                    <InfoTooltip
                      content="Volumen total estimado para la próxima semana basado en tu tendencia actual."
                      position="top"
                      className="ml-1"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm text-purple-400 font-medium">
                    Próximo PR predicho:
                  </p>
                  <InfoTooltip
                    content="Predicción de tu próximo récord personal basado en análisis de progresión y patrones de entrenamiento."
                    position="top"
                  />
                </div>
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
                <div className="text-xs text-gray-400 flex items-center justify-center">
                  <span>Crecimiento mensual</span>
                  <InfoTooltip
                    content="Tasa de crecimiento promedio en peso por mes basada en tu historial de entrenamientos."
                    position="top"
                    className="ml-1"
                  />
                </div>
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
              <InfoTooltip
                content="Evaluación detallada de la intensidad en diferentes aspectos de tu entrenamiento. Clave para optimizar el estímulo de crecimiento."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Gráfico de barras de intensidad */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <p className="text-sm text-gray-400">Intensidad Peso</p>
                    <InfoTooltip
                      content="Porcentaje de tu peso máximo que utilizas en promedio. Mayor intensidad = mayor estímulo de fuerza."
                      position="top"
                    />
                  </div>
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
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <p className="text-sm text-gray-400">Intensidad Volumen</p>
                    <InfoTooltip
                      content="Intensidad basada en el volumen total de trabajo. Mayor volumen = mayor estímulo de hipertrofia."
                      position="top"
                    />
                  </div>
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
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <p className="text-sm text-gray-400">Intensidad Frecuencia</p>
                    <InfoTooltip
                      content="Intensidad basada en la frecuencia de entrenamientos. Mayor frecuencia = mayor estímulo de adaptación."
                      position="top"
                    />
                  </div>
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
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-300">
                        Rango Óptimo de Carga
                      </h4>
                      <InfoTooltip
                        content="Rango de peso recomendado para maximizar el progreso basado en tu historial y capacidades actuales."
                        position="top"
                      />
                    </div>
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
              <InfoTooltip
                content="Señales que indican que estás alcanzando tu máximo potencial de rendimiento en diferentes aspectos del entrenamiento."
                position="top"
                className="ml-2"
              />
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
              <InfoTooltip
                content="Recomendaciones personalizadas basadas en análisis de tus datos para mejorar tu entrenamiento y resultados."
                position="top"
                className="ml-2"
              />
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