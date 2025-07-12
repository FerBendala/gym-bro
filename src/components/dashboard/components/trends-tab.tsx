import {
  Activity,
  AlertTriangle,
  BarChart,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Zap
} from 'lucide-react';
import React, { useMemo } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { formatNumber } from '../../../utils/functions';
import { calculateTrendsAnalysis } from '../../../utils/functions/trends-analysis';
import { Card, CardContent, CardHeader } from '../../card';
import { InfoTooltip } from '../../tooltip';

interface TrendsTabProps {
  records: WorkoutRecord[];
}

// Íconos para días de la semana
const dayIcons: Record<string, React.FC<any>> = {
  'Lunes': Target,
  'Martes': Activity,
  'Miércoles': Zap,
  'Jueves': BarChart,
  'Viernes': Trophy,
  'Sábado': Calendar,
  'Domingo': Clock
};

// Colores para días de la semana
const dayColors: Record<string, string> = {
  'Lunes': 'from-blue-500/80 to-cyan-500/80',
  'Martes': 'from-green-500/80 to-emerald-500/80',
  'Miércoles': 'from-purple-500/80 to-violet-500/80',
  'Jueves': 'from-orange-500/80 to-amber-500/80',
  'Viernes': 'from-red-500/80 to-pink-500/80',
  'Sábado': 'from-indigo-500/80 to-blue-500/80',
  'Domingo': 'from-teal-500/80 to-green-500/80'
};

// Función utilitaria para validar valores numéricos
const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return defaultValue;
  }
  return value;
};

export const TrendsTab: React.FC<TrendsTabProps> = ({ records }) => {
  const analysis = useMemo(() => calculateTrendsAnalysis(records), [records]);

  // Calcular indicador de experiencia basado en registros
  const experienceLevel = useMemo(() => {
    if (records.length < 10) return 'Principiante';
    if (records.length < 30) return 'Intermedio';
    if (records.length < 60) return 'Avanzado';
    return 'Experto';
  }, [records.length]);

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
      {/* Header informativo */}
      {records.length < 20 && (
        <Card className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-purple-500/30">
          <CardContent>
            <div className="flex items-start gap-3 p-2">
              <Activity className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-purple-300 mb-1">
                  Análisis adaptado a tu nivel ({experienceLevel})
                </h4>
                <p className="text-xs text-gray-400">
                  Las tendencias se analizan según tu historial de entrenamiento.
                  Con más datos, el análisis será más preciso.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evolución Temporal */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Evolución Temporal
            <InfoTooltip
              content="Análisis avanzado de tu progreso temporal con predicciones, volatilidad y comparaciones por períodos."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Métricas de tendencia general */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className={`w-5 h-5 ${analysis.temporalEvolution.overallTrend === 'Mejorando' ? 'text-green-400' :
                    analysis.temporalEvolution.overallTrend === 'Declinando' ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <div className="text-sm text-gray-400 mb-1">Tendencia</div>
                <div className={`text-lg font-semibold ${analysis.temporalEvolution.overallTrend === 'Mejorando' ? 'text-green-400' :
                  analysis.temporalEvolution.overallTrend === 'Declinando' ? 'text-red-400' : 'text-gray-400'}`}>
                  {analysis.temporalEvolution.overallTrend}
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-sm text-gray-400 mb-1">Crecimiento</div>
                <div className="text-lg font-semibold text-blue-400">
                  {analysis.temporalEvolution.growthRate > 0 ? '+' : ''}{analysis.temporalEvolution.growthRate}%
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Activity className={`w-5 h-5 ${analysis.temporalEvolution.volatility < 20 ? 'text-green-400' :
                    analysis.temporalEvolution.volatility < 40 ? 'text-yellow-400' : 'text-red-400'}`} />
                </div>
                <div className="text-sm text-gray-400 mb-1">Volatilidad</div>
                <div className={`text-lg font-semibold ${analysis.temporalEvolution.volatility < 20 ? 'text-green-400' :
                  analysis.temporalEvolution.volatility < 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {analysis.temporalEvolution.volatility}%
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-sm text-gray-400 mb-1">Confianza</div>
                <div className="text-lg font-semibold text-purple-400">
                  {Math.round(analysis.temporalEvolution.predictions.confidence * 100)}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análisis por Día de la Semana */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Análisis por Día de la Semana
            <InfoTooltip
              content="Análisis completo de tus patrones de entrenamiento por día, incluyendo rendimiento, tendencias y recomendaciones personalizadas."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.dayMetricsOrdered.map((day) => {
              const Icon = dayIcons[day.dayName] || Calendar;
              const colorGradient = dayColors[day.dayName] || 'from-gray-500/80 to-gray-600/80';

              const getPerformanceBadge = () => {
                if (day.performanceScore >= 80) return { text: 'Excelente', color: 'bg-green-500 text-white' };
                if (day.performanceScore >= 60) return { text: 'Bueno', color: 'bg-blue-500 text-white' };
                if (day.performanceScore >= 40) return { text: 'Regular', color: 'bg-yellow-500 text-black' };
                return { text: 'Necesita Mejora', color: 'bg-red-500 text-white' };
              };

              const performanceBadge = getPerformanceBadge();

              return (
                <div
                  key={day.dayName}
                  className={`relative p-4 sm:p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200`}
                >
                  {/* Header con ícono y estado */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-br ${colorGradient}`}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">
                          {day.dayName}
                        </h4>
                        <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                          {day.workouts > 0 && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${performanceBadge.color}`}>
                              {performanceBadge.text}
                            </span>
                          )}
                          {day.trend > 0 && (
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                          )}
                          {day.trend < 0 && (
                            <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-2 sm:ml-4">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                        {day.workouts}
                      </div>
                      <div className="text-xs text-gray-400">
                        entrenamientos
                      </div>
                      <div className="mt-1 sm:mt-2 flex justify-end">
                        {day.workouts > 0 ? (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {day.workouts > 0 ? (
                    <>
                      {/* Barra de progreso de volumen */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                          <span>Volumen: {formatNumber(day.totalVolume)} kg</span>
                          <span className="text-gray-300">
                            {day.percentage.toFixed(1)}% del total
                          </span>
                        </div>
                        <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`relative h-full bg-gradient-to-r ${colorGradient} transition-all duration-300`}
                            style={{ width: `${Math.min(100, safeNumber(day.percentage, 0))}%` }}
                          >
                            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                            {safeNumber(day.percentage, 0) > 15 && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-medium text-white drop-shadow-sm">
                                  {formatNumber(day.totalVolume)} kg
                                </span>
                              </div>
                            )}
                          </div>
                          {safeNumber(day.percentage, 0) <= 15 && safeNumber(day.percentage, 0) > 0 && (
                            <div className="absolute top-0 left-2 h-full flex items-center">
                              <span className="text-xs font-medium text-white drop-shadow-sm">
                                {formatNumber(day.totalVolume)} kg
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Grid de métricas responsivo */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4">
                        <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                          <div className="text-xs text-gray-400 mb-1">Peso Máximo</div>
                          <div className="text-sm sm:text-lg font-semibold text-white">
                            {day.maxWeight} kg
                          </div>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                          <div className="text-xs text-gray-400 mb-1">Ejercicios</div>
                          <div className="text-sm sm:text-lg font-semibold text-white">
                            {day.uniqueExercises}
                          </div>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                          <div className="text-xs text-gray-400 mb-1">Consistencia</div>
                          <div className="text-sm sm:text-lg font-semibold text-white">
                            {day.consistency}%
                          </div>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                          <div className="text-xs text-gray-400 mb-1">Peso Promedio</div>
                          <div className="text-sm sm:text-lg font-semibold text-white">
                            {day.avgWeight} kg
                          </div>
                        </div>
                      </div>

                      {/* Recomendaciones específicas */}
                      {day.recommendations.length > 0 && (
                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Zap className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-blue-300 break-words">
                                {day.recommendations[0]}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-yellow-300 break-words">
                              Sin entrenamientos registrados. Considera añadir entrenamientos en este día para equilibrar tu rutina semanal.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Análisis de Hábitos */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Análisis de Hábitos
            <InfoTooltip
              content="Análisis completo de tus patrones de entrenamiento, rachas y recomendaciones personalizadas."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Métricas de hábitos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-lg font-semibold text-white">
                  {analysis.workoutHabits.avgSessionDuration} min
                </div>
                <div className="text-xs text-gray-400">Duración promedio</div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-lg font-semibold text-white">
                  {analysis.workoutHabits.weeklyFrequency}
                </div>
                <div className="text-xs text-gray-400">Entrenamientos/semana</div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-lg font-semibold text-white">
                  {analysis.workoutHabits.workoutStreaks.longest}
                </div>
                <div className="text-xs text-gray-400">Racha más larga</div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-lg font-semibold text-white">
                  {analysis.workoutHabits.workoutStreaks.current}
                </div>
                <div className="text-xs text-gray-400">Racha actual</div>
              </div>
            </div>

            {/* Recomendaciones */}
            {analysis.workoutHabits.recommendations.length > 0 && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-300 mb-3 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Recomendaciones Personalizadas
                </h4>
                <div className="space-y-2">
                  {analysis.workoutHabits.recommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-300 break-words">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Factores de riesgo */}
            {analysis.workoutHabits.riskFactors.length > 0 && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-red-300 mb-3 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Factores de Riesgo
                </h4>
                <div className="space-y-2">
                  {analysis.workoutHabits.riskFactors.slice(0, 3).map((risk, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-300 break-words">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 