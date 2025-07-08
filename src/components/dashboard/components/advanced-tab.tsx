import { Activity, AlertTriangle, ArrowDown, ArrowUp, Award, BarChart, Brain, Calendar, CheckCircle, Clock, Lightbulb, Shield, Target, TrendingUp, Zap } from 'lucide-react';
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

  // Generar indicadores de rendimiento mejorados
  const enhancedPerformanceIndicators = useMemo(() => {
    const indicators: Array<{
      type: 'excellent' | 'good' | 'warning' | 'critical';
      icon: React.ComponentType<{ className?: string }>;
      title: string;
      description: string;
      value?: string;
      progress?: number;
    }> = [];

    // Análisis de consistencia
    const weeklyFrequency = records.slice(-7).length;
    if (weeklyFrequency >= 4) {
      indicators.push({
        type: 'excellent',
        icon: Calendar,
        title: 'Consistencia Excelente',
        description: `${weeklyFrequency} entrenamientos esta semana - rutina muy sólida`,
        value: `${weeklyFrequency}/7 días`,
        progress: (weeklyFrequency / 7) * 100
      });
    } else if (weeklyFrequency >= 3) {
      indicators.push({
        type: 'good',
        icon: Calendar,
        title: 'Buena Consistencia',
        description: `${weeklyFrequency} entrenamientos esta semana - mantén el ritmo`,
        value: `${weeklyFrequency}/7 días`,
        progress: (weeklyFrequency / 7) * 100
      });
    }

    // Análisis de progreso
    const recentComparison = analysis.periodComparisons.find(p => p.periodName === 'Último mes');
    if (recentComparison && recentComparison.improvement > 10) {
      indicators.push({
        type: 'excellent',
        icon: TrendingUp,
        title: 'Progreso Sobresaliente',
        description: `Mejora del ${recentComparison.improvement}% en el último mes`,
        value: `+${recentComparison.improvement}%`,
        progress: Math.min(100, recentComparison.improvement * 2)
      });
    } else if (recentComparison && recentComparison.improvement > 0) {
      indicators.push({
        type: 'good',
        icon: ArrowUp,
        title: 'Progreso Positivo',
        description: `Mejora del ${recentComparison.improvement}% en el último mes`,
        value: `+${recentComparison.improvement}%`,
        progress: recentComparison.improvement * 5
      });
    }

    // Análisis de intensidad
    if (analysis.intensityMetrics.overallIntensity === 'Óptima') {
      indicators.push({
        type: 'excellent',
        icon: Zap,
        title: 'Intensidad Perfecta',
        description: 'Tu intensidad está en el rango óptimo para progreso',
        value: analysis.intensityMetrics.averageIntensity + '%',
        progress: analysis.intensityMetrics.averageIntensity
      });
    } else if (analysis.intensityMetrics.overallIntensity === 'Alta') {
      indicators.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Intensidad Elevada',
        description: 'Considera moderar la intensidad para evitar sobrecarga',
        value: analysis.intensityMetrics.averageIntensity + '%',
        progress: analysis.intensityMetrics.averageIntensity
      });
    }

    // Análisis de fatiga
    if (analysis.fatigueAnalysis.fatigueIndex <= 30) {
      indicators.push({
        type: 'excellent',
        icon: Shield,
        title: 'Excelente Recuperación',
        description: 'Niveles óptimos de fatiga y recuperación',
        value: `${analysis.fatigueAnalysis.fatigueIndex}%`,
        progress: 100 - analysis.fatigueAnalysis.fatigueIndex
      });
    } else if (analysis.fatigueAnalysis.fatigueIndex <= 60) {
      indicators.push({
        type: 'good',
        icon: Activity,
        title: 'Recuperación Adecuada',
        description: 'Niveles de fatiga controlados',
        value: `${analysis.fatigueAnalysis.fatigueIndex}%`,
        progress: 100 - analysis.fatigueAnalysis.fatigueIndex
      });
    } else {
      indicators.push({
        type: 'critical',
        icon: AlertTriangle,
        title: 'Fatiga Elevada',
        description: 'Considera aumentar días de descanso',
        value: `${analysis.fatigueAnalysis.fatigueIndex}%`,
        progress: 100 - analysis.fatigueAnalysis.fatigueIndex
      });
    }

    // Análisis de eficiencia
    if (analysis.trainingEfficiency.timeEfficiencyScore >= 70) {
      indicators.push({
        type: 'excellent',
        icon: Clock,
        title: 'Alta Eficiencia',
        description: 'Excelente aprovechamiento del tiempo de entrenamiento',
        value: `${analysis.trainingEfficiency.timeEfficiencyScore}%`,
        progress: analysis.trainingEfficiency.timeEfficiencyScore
      });
    }

    // Análisis de volumen
    const totalVolume = records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
    if (totalVolume > 50000) {
      indicators.push({
        type: 'excellent',
        icon: Award,
        title: 'Alto Volumen Trabajado',
        description: `${formatNumber(totalVolume)}kg de volumen total acumulado`,
        value: formatNumber(totalVolume) + 'kg'
      });
    }

    return indicators;
  }, [records, analysis]);

  // Generar sugerencias de optimización categorizadas
  const categorizedSuggestions = useMemo(() => {
    const suggestions: Array<{
      category: 'intensity' | 'volume' | 'recovery' | 'frequency' | 'technique' | 'planning';
      priority: 'high' | 'medium' | 'low';
      icon: React.ComponentType<{ className?: string }>;
      title: string;
      description: string;
      action: string;
    }> = [];

    // Sugerencias de intensidad
    if (analysis.intensityMetrics.averageIntensity < 60) {
      suggestions.push({
        category: 'intensity',
        priority: 'high',
        icon: ArrowUp,
        title: 'Aumentar Intensidad',
        description: `Tu intensidad promedio es del ${analysis.intensityMetrics.averageIntensity}%, por debajo del rango óptimo`,
        action: 'Incrementa los pesos gradualmente en un 2.5-5% cada semana'
      });
    } else if (analysis.intensityMetrics.averageIntensity > 85) {
      suggestions.push({
        category: 'intensity',
        priority: 'medium',
        icon: ArrowDown,
        title: 'Moderar Intensidad',
        description: `Intensidad muy alta (${analysis.intensityMetrics.averageIntensity}%), riesgo de fatiga`,
        action: 'Considera una semana de descarga con pesos 20% menores'
      });
    }

    // Sugerencias de volumen
    if (analysis.intensityMetrics.volumeIntensity < 50) {
      suggestions.push({
        category: 'volume',
        priority: 'medium',
        icon: BarChart,
        title: 'Incrementar Volumen',
        description: `Volumen actual por debajo del potencial (${analysis.intensityMetrics.volumeIntensity}%)`,
        action: 'Añade 1-2 series adicionales a tus ejercicios principales'
      });
    }

    // Sugerencias de frecuencia
    const weeklyFrequency = records.slice(-7).length;
    if (weeklyFrequency < 3) {
      suggestions.push({
        category: 'frequency',
        priority: 'high',
        icon: Calendar,
        title: 'Aumentar Frecuencia',
        description: `Solo ${weeklyFrequency} entrenamientos esta semana, recomendado 3-5`,
        action: 'Programa al menos 3 sesiones semanales para progreso óptimo'
      });
    } else if (weeklyFrequency > 6) {
      suggestions.push({
        category: 'frequency',
        priority: 'medium',
        icon: Shield,
        title: 'Moderar Frecuencia',
        description: `${weeklyFrequency} entrenamientos pueden ser excesivos`,
        action: 'Incluye al menos 1-2 días de descanso completo por semana'
      });
    }

    // Sugerencias de recuperación
    if (analysis.fatigueAnalysis.fatigueIndex > 60) {
      suggestions.push({
        category: 'recovery',
        priority: 'high',
        icon: AlertTriangle,
        title: 'Priorizar Recuperación',
        description: `Índice de fatiga elevado (${analysis.fatigueAnalysis.fatigueIndex}%)`,
        action: analysis.fatigueAnalysis.restRecommendation
      });
    } else if (analysis.fatigueAnalysis.recoveryDays > 3) {
      suggestions.push({
        category: 'recovery',
        priority: 'low',
        icon: Activity,
        title: 'Retomar Gradualmente',
        description: `${analysis.fatigueAnalysis.recoveryDays} días sin entrenar`,
        action: 'Comienza con 70-80% de tu intensidad habitual'
      });
    }

    // Sugerencias de planificación
    if (analysis.progressPrediction.plateauRisk > 60) {
      suggestions.push({
        category: 'planning',
        priority: 'high',
        icon: Target,
        title: 'Prevenir Meseta',
        description: `Alto riesgo de estancamiento (${analysis.progressPrediction.plateauRisk}%)`,
        action: 'Varía ejercicios, rangos de repeticiones o esquemas de series'
      });
    }

    // Sugerencias de técnica (basadas en eficiencia)
    if (analysis.trainingEfficiency.timeEfficiencyScore < 50) {
      suggestions.push({
        category: 'technique',
        priority: 'medium',
        icon: Lightbulb,
        title: 'Optimizar Eficiencia',
        description: `Eficiencia temporal baja (${analysis.trainingEfficiency.timeEfficiencyScore}%)`,
        action: 'Reduce descansos entre series o aumenta peso por ejercicio'
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [records, analysis]);

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

        {/* Indicadores de rendimiento mejorados */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Indicadores de Rendimiento
              <InfoTooltip
                content="Análisis detallado de tu rendimiento actual con métricas específicas y progreso medible."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enhancedPerformanceIndicators.length > 0 ? (
                enhancedPerformanceIndicators.map((indicator, index) => {
                  const getIndicatorStyles = (type: string) => {
                    switch (type) {
                      case 'excellent':
                        return 'bg-green-900/20 border-green-500/30 text-green-400';
                      case 'good':
                        return 'bg-blue-900/20 border-blue-500/30 text-blue-400';
                      case 'warning':
                        return 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400';
                      case 'critical':
                        return 'bg-red-900/20 border-red-500/30 text-red-400';
                      default:
                        return 'bg-gray-900/20 border-gray-500/30 text-gray-400';
                    }
                  };

                  return (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg ${getIndicatorStyles(indicator.type)}`}
                    >
                      <div className="flex items-start space-x-3">
                        <indicator.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{indicator.title}</h4>
                            {indicator.value && (
                              <span className="text-sm font-bold">{indicator.value}</span>
                            )}
                          </div>
                          <p className="text-xs opacity-90 mb-2">{indicator.description}</p>
                          {indicator.progress !== undefined && (
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${indicator.type === 'excellent' ? 'bg-green-500' :
                                  indicator.type === 'good' ? 'bg-blue-500' :
                                    indicator.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                style={{ width: `${Math.min(100, indicator.progress)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-400 text-center py-4">
                  Continúa entrenando para desarrollar indicadores de rendimiento
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sugerencias de optimización mejoradas */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Sugerencias de Optimización
              <InfoTooltip
                content="Recomendaciones personalizadas y priorizadas basadas en análisis detallado de tus datos de entrenamiento."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categorizedSuggestions.length > 0 ? (
                categorizedSuggestions.map((suggestion, index) => {
                  const getCategoryStyles = (category: string) => {
                    switch (category) {
                      case 'intensity':
                        return 'bg-red-900/20 border-red-500/30 text-red-400';
                      case 'volume':
                        return 'bg-blue-900/20 border-blue-500/30 text-blue-400';
                      case 'recovery':
                        return 'bg-green-900/20 border-green-500/30 text-green-400';
                      case 'frequency':
                        return 'bg-purple-900/20 border-purple-500/30 text-purple-400';
                      case 'technique':
                        return 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400';
                      case 'planning':
                        return 'bg-indigo-900/20 border-indigo-500/30 text-indigo-400';
                      default:
                        return 'bg-gray-900/20 border-gray-500/30 text-gray-400';
                    }
                  };

                  const getPriorityBadge = (priority: string) => {
                    switch (priority) {
                      case 'high':
                        return 'bg-red-600 text-white';
                      case 'medium':
                        return 'bg-yellow-600 text-white';
                      case 'low':
                        return 'bg-gray-600 text-white';
                      default:
                        return 'bg-gray-600 text-white';
                    }
                  };

                  return (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg ${getCategoryStyles(suggestion.category)}`}
                    >
                      <div className="flex items-start space-x-3">
                        <suggestion.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{suggestion.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityBadge(suggestion.priority)}`}>
                              {suggestion.priority === 'high' ? 'ALTA' :
                                suggestion.priority === 'medium' ? 'MEDIA' : 'BAJA'}
                            </span>
                          </div>
                          <p className="text-xs opacity-90 mb-2">{suggestion.description}</p>
                          <div className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
                            <p className="text-xs font-medium">{suggestion.action}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 font-medium">¡Excelente trabajo!</p>
                  <p className="text-gray-400 text-sm">Tu entrenamiento está bien optimizado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};