import { Activity, Calendar, Clock, Target, TrendingUp } from 'lucide-react';
import React, { useMemo } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { formatNumber } from '../../../utils/functions';
import { calculateTrendsAnalysis } from '../../../utils/functions/trends-analysis';
import { Card, CardContent, CardHeader } from '../../card';
import { StatCard } from '../../stat-card';

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
        />
        <StatCard
          title="Hora Preferida"
          value={analysis.workoutHabits.preferredTime}
          icon={Clock}
          variant="success"
        />
        <StatCard
          title="Consistencia"
          value={`${analysis.workoutHabits.consistencyScore}%`}
          icon={Target}
          variant={analysis.workoutHabits.consistencyScore >= 70 ? 'success' :
            analysis.workoutHabits.consistencyScore >= 50 ? 'warning' : 'danger'}
        />
        <StatCard
          title="Patrón Descanso"
          value={analysis.workoutHabits.restDayPattern}
          icon={Activity}
          variant="teal"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Métricas por día de la semana */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Entrenamientos por Día
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.dayMetrics.slice(0, 5).map((day) => (
                <div
                  key={day.dayName}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-white">
                      {day.dayName}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {day.workouts} entrenamientos • {day.mostFrequentTime || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-400">
                      {formatNumber(day.totalVolume)} kg
                    </p>
                    <p className="text-xs text-gray-500">
                      {day.percentage}% del total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Patrones horarios */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Patrones Horarios
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.timePatterns.slice(0, 4).map((pattern) => (
                <div
                  key={pattern.timeRange}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-white text-sm">
                      {pattern.timeRange}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {pattern.workouts} entrenamientos
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-400">
                      {pattern.percentage}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatNumber(pattern.avgVolume)} kg promedio
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tendencias semanales */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Evolución Temporal
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Gráfico de barras de tendencias */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {analysis.temporalTrends.slice(-4).map((trend) => (
                  <div
                    key={trend.period}
                    className="p-3 bg-gray-800 rounded-lg text-center"
                  >
                    <p className="text-sm text-gray-400 mb-1">
                      Sem. {trend.period}
                    </p>
                    <p className="text-lg font-bold text-white">
                      {formatNumber(trend.volume)} kg
                    </p>
                    <p className="text-xs text-gray-400">
                      {trend.workouts} entrenamientos
                    </p>
                    <p className="text-xs text-blue-400">
                      {trend.avgWeight}kg promedio
                    </p>
                  </div>
                ))}
              </div>

              {/* Tendencias por día de la semana */}
              <div className="pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 mb-3">
                  Tendencia por Día (últimas 4 semanas)
                </h4>
                <div className="grid grid-cols-7 gap-2">
                  {analysis.volumeTrendByDay.map((dayTrend) => (
                    <div key={dayTrend.day} className="text-center">
                      <p className="text-xs text-gray-400 mb-1">
                        {dayTrend.day}
                      </p>
                      <p className={`text-sm font-medium ${dayTrend.trend > 0 ? 'text-green-400' :
                          dayTrend.trend < 0 ? 'text-red-400' : 'text-gray-400'
                        }`}>
                        {dayTrend.trend > 0 ? '+' : ''}{dayTrend.trend}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mejor período */}
              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300">
                      Mejor Período de Rendimiento
                    </h4>
                    <p className="text-xs text-gray-400">
                      Semana con mayor volumen total
                    </p>
                  </div>
                  <p className="text-lg font-bold text-yellow-400">
                    {analysis.bestPerformancePeriod}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de hábitos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Análisis de Hábitos
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-blue-400">
                  {analysis.workoutHabits.avgSessionDuration}
                </p>
                <p className="text-sm text-gray-400">Minutos/sesión (est.)</p>
              </div>

              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-green-400">
                  {analysis.workoutHabits.peakProductivityHours.length}
                </p>
                <p className="text-sm text-gray-400">Horas productivas</p>
              </div>

              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-purple-400">
                  {analysis.dayMetrics.filter(d => d.workouts > 0).length}
                </p>
                <p className="text-sm text-gray-400">Días activos</p>
              </div>

              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-yellow-400">
                  {Math.round((analysis.dayMetrics.reduce((sum, d) => sum + d.workouts, 0) / 7) * 10) / 10}
                </p>
                <p className="text-sm text-gray-400">Entrenamientos/semana</p>
              </div>
            </div>

            {/* Horas de mayor productividad */}
            {analysis.workoutHabits.peakProductivityHours.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  Horarios de Mayor Productividad
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.workoutHabits.peakProductivityHours.map((hour, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm"
                    >
                      {hour}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 