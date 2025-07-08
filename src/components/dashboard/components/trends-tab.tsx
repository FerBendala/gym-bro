import { Activity, AlertTriangle, Brain, Calendar, CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';
import React, { useMemo } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { formatNumber } from '../../../utils/functions';
import { calculateTrendsAnalysis } from '../../../utils/functions/trends-analysis';
import { Card, CardContent, CardHeader } from '../../card';
import { StatCard } from '../../stat-card';
import { InfoTooltip } from '../../tooltip';

interface TrendsTabProps {
  records: WorkoutRecord[];
}

export const TrendsTab: React.FC<TrendsTabProps> = ({ records }) => {
  const analysis = useMemo(() => calculateTrendsAnalysis(records), [records]);

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Sin datos de tendencias
        </h3>
        <p className="text-gray-500">
          Registra algunos entrenamientos para ver tus patrones temporales
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hábitos principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Día Preferido"
          value={analysis.workoutHabits.preferredDay}
          icon={Calendar}
          variant="primary"
          tooltip="El día de la semana en el que entrenas con mayor frecuencia. Útil para planificar tu rutina semanal."
          tooltipPosition="top"
        />
        <StatCard
          title="Hora Preferida"
          value={analysis.workoutHabits.preferredTime}
          icon={Clock}
          variant="success"
          tooltip="El rango horario en el que realizas la mayoría de tus entrenamientos. Indica tu ventana de mayor energía."
          tooltipPosition="top"
        />
        <StatCard
          title="Consistencia"
          value={`${analysis.workoutHabits.consistencyScore}%`}
          icon={Target}
          variant={analysis.workoutHabits.consistencyScore >= 70 ? 'success' :
            analysis.workoutHabits.consistencyScore >= 50 ? 'warning' : 'danger'}
          tooltip="Puntuación de qué tan regular eres en tus entrenamientos. 70%+ es excelente, 50-69% es bueno, <50% necesita mejoras."
          tooltipPosition="top"
        />
        <StatCard
          title="Patrón Descanso"
          value={analysis.workoutHabits.restDayPattern}
          icon={Activity}
          variant="teal"
          tooltip="Tu patrón típico de días de descanso entre entrenamientos. Importante para la recuperación muscular."
          tooltipPosition="top"
        />
      </div>

      <div className="space-y-6">
        {/* Entrenamientos por Día Mejorado */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Análisis por Día de la Semana
              <InfoTooltip
                content="Análisis completo de tus patrones de entrenamiento por día, incluyendo rendimiento, tendencias, consistencia y recomendaciones personalizadas."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">

              {/* Resumen visual por día */}
              <div className="grid grid-cols-7 gap-2">
                {analysis.dayMetricsOrdered.map((day) => (
                  <div
                    key={day.dayName}
                    className="text-center p-2 bg-gray-800 rounded-lg"
                  >
                    <p className="text-xs font-medium text-gray-300 mb-1">
                      {day.dayName.slice(0, 3)}
                    </p>
                    <div className={`w-full h-16 rounded-md mb-2 flex items-end justify-center ${day.workouts === 0 ? 'bg-gray-700' :
                      day.performanceScore >= 70 ? 'bg-green-600' :
                        day.performanceScore >= 50 ? 'bg-yellow-600' :
                          'bg-red-600'
                      }`}>
                      <span className="text-white text-xs font-bold mb-1">
                        {day.workouts}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {day.performanceScore}%
                    </p>
                  </div>
                ))}
              </div>

              {/* Lista detallada de días */}
              <div className="space-y-3">
                {analysis.dayMetricsOrdered.map((day) => (
                  <div
                    key={day.dayName}
                    className="p-4 bg-gray-800 rounded-lg border-l-4 border-l-blue-500"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-white">
                          {day.dayName}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${day.performanceScore >= 80 ? 'bg-green-600 text-white' :
                          day.performanceScore >= 60 ? 'bg-blue-600 text-white' :
                            day.performanceScore >= 40 ? 'bg-yellow-600 text-white' :
                              day.performanceScore >= 20 ? 'bg-orange-600 text-white' :
                                'bg-red-600 text-white'
                          }`}>
                          Score: {day.performanceScore}
                        </span>
                        {day.trend !== 0 && (
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${day.trend > 0 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                            }`}>
                            {day.trend > 0 ? '+' : ''}{day.trend}%
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-400">
                          {formatNumber(day.totalVolume)} kg
                        </p>
                        <p className="text-xs text-gray-400">
                          {day.percentage}% del total
                        </p>
                      </div>
                    </div>

                    {day.workouts > 0 ? (
                      <>
                        {/* Métricas básicas */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div className="text-center">
                            <p className="text-xl font-bold text-white">{day.workouts}</p>
                            <p className="text-xs text-gray-400">Entrenamientos</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xl font-bold text-purple-400">{day.uniqueExercises}</p>
                            <p className="text-xs text-gray-400">Ejercicios únicos</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xl font-bold text-orange-400">{day.maxWeight}kg</p>
                            <p className="text-xs text-gray-400">Peso máximo</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xl font-bold text-green-400">{day.consistency}%</p>
                            <p className="text-xs text-gray-400">Consistencia</p>
                          </div>
                        </div>

                        {/* Detalles adicionales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Hora preferida:</span>
                              <span className="text-gray-300">{day.mostFrequentTime || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Ejercicio principal:</span>
                              <span className="text-gray-300 truncate ml-2">{day.topExercise}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Peso promedio:</span>
                              <span className="text-gray-300">{day.avgWeight}kg</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Reps promedio:</span>
                              <span className="text-gray-300">{day.avgReps}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Series promedio:</span>
                              <span className="text-gray-300">{day.avgSets}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Eficiencia:</span>
                              <span className="text-gray-300">{formatNumber(day.efficiency)} kg/sesión</span>
                            </div>
                          </div>
                        </div>

                        {/* Recomendaciones */}
                        {day.recommendations.length > 0 && (
                          <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                            <h5 className="text-sm text-blue-400 font-medium mb-2">
                              Recomendaciones para {day.dayName}:
                            </h5>
                            <ul className="space-y-1">
                              {day.recommendations.map((rec, index) => (
                                <li key={index} className="text-xs text-gray-300 flex items-start">
                                  <span className="text-blue-400 mr-2">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-400 mb-2">Sin entrenamientos registrados</p>
                        <div className="p-2 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                          <p className="text-xs text-yellow-400">
                            Considera añadir entrenamientos en este día para equilibrar tu rutina semanal
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Evolución Temporal Mejorada */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Evolución Temporal
              <InfoTooltip
                content="Análisis avanzado de tu progreso temporal con predicciones, volatilidad, hitos y comparaciones por períodos."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">

              {/* Métricas de tendencia general */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-800 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className={`w-6 h-6 ${analysis.temporalEvolution.overallTrend === 'Mejorando' ? 'text-green-400' :
                      analysis.temporalEvolution.overallTrend === 'Declinando' ? 'text-red-400' :
                        'text-gray-400'
                      }`} />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Tendencia General</p>
                  <p className={`text-lg font-bold ${analysis.temporalEvolution.overallTrend === 'Mejorando' ? 'text-green-400' :
                    analysis.temporalEvolution.overallTrend === 'Declinando' ? 'text-red-400' :
                      'text-gray-400'
                    }`}>
                    {analysis.temporalEvolution.overallTrend}
                  </p>
                </div>

                <div className="p-4 bg-gray-800 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Crecimiento Semanal</p>
                  <p className="text-lg font-bold text-blue-400">
                    {analysis.temporalEvolution.growthRate > 0 ? '+' : ''}{analysis.temporalEvolution.growthRate}%
                  </p>
                </div>

                <div className="p-4 bg-gray-800 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Activity className={`w-6 h-6 ${analysis.temporalEvolution.volatility < 20 ? 'text-green-400' :
                      analysis.temporalEvolution.volatility < 40 ? 'text-yellow-400' :
                        'text-red-400'
                      }`} />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Volatilidad</p>
                  <p className={`text-lg font-bold ${analysis.temporalEvolution.volatility < 20 ? 'text-green-400' :
                    analysis.temporalEvolution.volatility < 40 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                    {analysis.temporalEvolution.volatility}%
                  </p>
                </div>

                <div className="p-4 bg-gray-800 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Confianza</p>
                  <p className="text-lg font-bold text-purple-400">
                    {Math.round(analysis.temporalEvolution.predictions.confidence * 100)}%
                  </p>
                </div>
              </div>

              {/* Progreso semanal con más detalles */}
              <div>
                <h4 className="text-md font-medium text-white mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Progreso Semanal Detallado
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {analysis.temporalEvolution.trends.slice(-4).map((trend) => (
                    <div key={trend.period} className="p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Sem. {trend.period}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${trend.momentum === 'Creciente' ? 'bg-green-600 text-white' :
                          trend.momentum === 'Decreciente' ? 'bg-red-600 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                          {trend.momentum}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-white mb-1">
                        {formatNumber(trend.volume)} kg
                      </p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Entrenamientos:</span>
                          <span className="text-gray-300">{trend.workouts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Peso máx:</span>
                          <span className="text-gray-300">{trend.maxWeight}kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Consistencia:</span>
                          <span className={`${trend.consistency > 70 ? 'text-green-400' : trend.consistency > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {trend.consistency}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Cambio:</span>
                          <span className={`${trend.volumeChangePercent > 0 ? 'text-green-400' : trend.volumeChangePercent < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                            {trend.volumeChangePercent > 0 ? '+' : ''}{trend.volumeChangePercent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Predicciones y proyecciones */}
              <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <h4 className="text-md font-medium text-blue-400 mb-3 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Predicciones para la Próxima Semana
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">
                      {formatNumber(analysis.temporalEvolution.predictions.nextWeekVolume)} kg
                    </p>
                    <p className="text-sm text-gray-400">Volumen estimado</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">
                      {analysis.temporalEvolution.predictions.nextWeekWorkouts}
                    </p>
                    <p className="text-sm text-gray-400">Entrenamientos estimados</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${analysis.temporalEvolution.predictions.trend === 'Alcista' ? 'text-green-400' :
                      analysis.temporalEvolution.predictions.trend === 'Bajista' ? 'text-red-400' :
                        'text-gray-400'
                      }`}>
                      {analysis.temporalEvolution.predictions.trend}
                    </p>
                    <p className="text-sm text-gray-400">Tendencia proyectada</p>
                  </div>
                </div>
              </div>

              {/* Hitos y logros */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-md font-medium text-white mb-3">Hitos Destacados</h4>
                  <div className="space-y-2">
                    {analysis.temporalEvolution.milestones.bestWeek && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Mejor semana:</span>
                        <span className="text-sm font-medium text-green-400">
                          {analysis.temporalEvolution.milestones.bestWeek.period}
                        </span>
                      </div>
                    )}
                    {analysis.temporalEvolution.milestones.mostConsistentWeek && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Más consistente:</span>
                        <span className="text-sm font-medium text-blue-400">
                          {analysis.temporalEvolution.milestones.mostConsistentWeek.period}
                        </span>
                      </div>
                    )}
                    {analysis.temporalEvolution.milestones.biggestImprovement && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Mayor mejora:</span>
                        <span className="text-sm font-medium text-purple-400">
                          {analysis.temporalEvolution.milestones.biggestImprovement.period}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-md font-medium text-white mb-3">Comparación por Períodos</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Últimas 4 semanas:</span>
                      <span className="text-sm font-medium text-white">
                        {formatNumber(analysis.temporalEvolution.periodComparisons.last4Weeks.volume)} kg
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Anteriores 4 semanas:</span>
                      <span className="text-sm font-medium text-gray-300">
                        {formatNumber(analysis.temporalEvolution.periodComparisons.previous4Weeks.volume)} kg
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Mejora promedio:</span>
                      <span className={`text-sm font-medium ${analysis.temporalEvolution.periodComparisons.improvement.volume > 0 ? 'text-green-400' :
                        analysis.temporalEvolution.periodComparisons.improvement.volume < 0 ? 'text-red-400' :
                          'text-gray-400'
                        }`}>
                        {analysis.temporalEvolution.periodComparisons.improvement.volume > 0 ? '+' : ''}
                        {formatNumber(analysis.temporalEvolution.periodComparisons.improvement.volume)} kg
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights */}
              {analysis.temporalEvolution.insights.length > 0 && (
                <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <h4 className="text-sm text-green-400 font-medium mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Insights Temporales
                  </h4>
                  <ul className="space-y-1">
                    {analysis.temporalEvolution.insights.map((insight, index) => (
                      <li key={index} className="text-xs text-gray-300 flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Advertencias */}
              {analysis.temporalEvolution.warnings.length > 0 && (
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <h4 className="text-sm text-red-400 font-medium mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Advertencias Temporales
                  </h4>
                  <ul className="space-y-1">
                    {analysis.temporalEvolution.warnings.map((warning, index) => (
                      <li key={index} className="text-xs text-gray-300 flex items-start">
                        <span className="text-red-400 mr-2">⚠</span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </CardContent>
        </Card>

        {/* Análisis de Hábitos Mejorado */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Análisis de Hábitos
              <InfoTooltip
                content="Análisis completo de tus patrones de entrenamiento, rachas, motivación y recomendaciones personalizadas para mejorar tus hábitos."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">

              {/* Métricas principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-white">
                    {analysis.workoutHabits.avgSessionDuration}min
                  </p>
                  <p className="text-xs text-gray-400">Duración promedio</p>
                </div>

                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-white">
                    {analysis.workoutHabits.consistencyScore}%
                  </p>
                  <p className="text-xs text-gray-400">Consistencia</p>
                </div>

                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-white">
                    {analysis.workoutHabits.weeklyFrequency}
                  </p>
                  <p className="text-xs text-gray-400">Entrenamientos/semana</p>
                </div>

                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <Activity className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-white">
                    {analysis.workoutHabits.workoutStreaks.longest}
                  </p>
                  <p className="text-xs text-gray-400">Racha más larga</p>
                </div>
              </div>

              {/* Análisis de hábitos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-300">Fuerza del Hábito</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${analysis.workoutHabits.habitStrength === 'Muy Fuerte' ? 'bg-green-600 text-white' :
                      analysis.workoutHabits.habitStrength === 'Fuerte' ? 'bg-blue-600 text-white' :
                        analysis.workoutHabits.habitStrength === 'Moderado' ? 'bg-yellow-600 text-white' :
                          analysis.workoutHabits.habitStrength === 'Débil' ? 'bg-orange-600 text-white' :
                            'bg-red-600 text-white'
                      }`}>
                      {analysis.workoutHabits.habitStrength}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Evaluación general de tus hábitos</p>
                </div>

                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-300">Flexibilidad</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${analysis.workoutHabits.scheduleFlexibility === 'Muy Flexible' ? 'bg-green-600 text-white' :
                      analysis.workoutHabits.scheduleFlexibility === 'Flexible' ? 'bg-blue-600 text-white' :
                        analysis.workoutHabits.scheduleFlexibility === 'Rígido' ? 'bg-yellow-600 text-white' :
                          'bg-red-600 text-white'
                      }`}>
                      {analysis.workoutHabits.scheduleFlexibility}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Adaptabilidad de horarios</p>
                </div>

                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-300">Motivación</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${analysis.workoutHabits.motivationPattern === 'Creciente' ? 'bg-green-600 text-white' :
                      analysis.workoutHabits.motivationPattern === 'Estable' ? 'bg-blue-600 text-white' :
                        analysis.workoutHabits.motivationPattern === 'Decreciente' ? 'bg-red-600 text-white' :
                          'bg-yellow-600 text-white'
                      }`}>
                      {analysis.workoutHabits.motivationPattern}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Patrón de motivación reciente</p>
                </div>
              </div>

              {/* Rachas de entrenamiento */}
              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="text-md font-medium text-white mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Rachas de Entrenamiento
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${analysis.workoutHabits.workoutStreaks.current > 0 ? 'text-green-400' : 'text-gray-400'
                      }`}>
                      {analysis.workoutHabits.workoutStreaks.current}
                    </p>
                    <p className="text-xs text-gray-400">Racha actual</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">
                      {analysis.workoutHabits.workoutStreaks.longest}
                    </p>
                    <p className="text-xs text-gray-400">Racha más larga</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">
                      {analysis.workoutHabits.workoutStreaks.average}
                    </p>
                    <p className="text-xs text-gray-400">Promedio de rachas</p>
                  </div>
                </div>
              </div>

              {/* Insights de comportamiento */}
              {analysis.workoutHabits.behaviorInsights.length > 0 && (
                <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <h4 className="text-sm text-blue-400 font-medium mb-2 flex items-center">
                    <Brain className="w-4 h-4 mr-2" />
                    Insights de Comportamiento
                  </h4>
                  <ul className="space-y-1">
                    {analysis.workoutHabits.behaviorInsights.map((insight, index) => (
                      <li key={index} className="text-xs text-gray-300 flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recomendaciones */}
              {analysis.workoutHabits.recommendations.length > 0 && (
                <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <h4 className="text-sm text-green-400 font-medium mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Recomendaciones Personalizadas
                  </h4>
                  <ul className="space-y-1">
                    {analysis.workoutHabits.recommendations.map((rec, index) => (
                      <li key={index} className="text-xs text-gray-300 flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Factores de riesgo */}
              {analysis.workoutHabits.riskFactors.length > 0 && (
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <h4 className="text-sm text-red-400 font-medium mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Factores de Riesgo
                  </h4>
                  <ul className="space-y-1">
                    {analysis.workoutHabits.riskFactors.map((risk, index) => (
                      <li key={index} className="text-xs text-gray-300 flex items-start">
                        <span className="text-red-400 mr-2">⚠</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 