import { Award, Calendar, Flame, TrendingUp } from 'lucide-react';
import React, { useMemo } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { formatNumber, getDaysAgo } from '../../../utils/functions';
import { calculatePerformanceMetrics } from '../../../utils/functions/performance-metrics';
import { Card, CardContent, CardHeader } from '../../card';
import { StatCard } from '../../stat-card';
import { InfoTooltip } from '../../tooltip';

interface PerformanceTabProps {
  records: WorkoutRecord[];
}

export const PerformanceTab: React.FC<PerformanceTabProps> = ({ records }) => {
  const metrics = useMemo(() => calculatePerformanceMetrics(records), [records]);

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Sin datos de rendimiento
        </h3>
        <p className="text-gray-500">
          Registra algunos entrenamientos para ver tu análisis de rendimiento
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales de rendimiento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tendencia Volumen"
          value={`${metrics.totalVolumeTrend > 0 ? '+' : ''}${metrics.totalVolumeTrend}%`}
          icon={TrendingUp}
          variant={metrics.totalVolumeTrend > 0 ? 'success' : metrics.totalVolumeTrend < 0 ? 'danger' : 'indigo'}
          tooltip="Cambio porcentual en el volumen total de entrenamiento comparado con el período anterior"
          tooltipPosition="top"
        />
        <StatCard
          title="Ganancia Fuerza"
          value={`${metrics.strengthGains > 0 ? '+' : ''}${metrics.strengthGains}%`}
          icon={Award}
          variant={metrics.strengthGains > 0 ? 'success' : metrics.strengthGains < 0 ? 'danger' : 'indigo'}
          tooltip="Incremento porcentual en la fuerza máxima registrada en tus ejercicios principales"
          tooltipPosition="top"
        />
        <StatCard
          title="Racha Actual"
          value={`${metrics.consistency.currentStreak} días`}
          icon={Flame}
          variant="warning"
          tooltip="Número consecutivo de días que has mantenido tu rutina de entrenamiento activa"
          tooltipPosition="top"
        />
        <StatCard
          title="Racha Máxima"
          value={`${metrics.consistency.longestStreak} días`}
          icon={Calendar}
          variant="primary"
          tooltip="La racha más larga de días consecutivos de entrenamiento que has logrado"
          tooltipPosition="top"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Records personales */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Records Personales
              <InfoTooltip
                content="Tus mejores marcas en cada ejercicio. El volumen se calcula multiplicando peso × repeticiones para cada serie."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.personalRecords.slice(0, 5).map((record, index) => (
                <div
                  key={`${record.exerciseId}-${index}`}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-white truncate">
                      {record.exerciseName}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {record.weight}kg × {record.reps} reps
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-400">
                      {formatNumber(record.volume)} kg
                    </p>
                    <p className="text-xs text-gray-500">
                      {getDaysAgo(record.date)}
                    </p>
                  </div>
                </div>
              ))}
              {metrics.personalRecords.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  No hay records registrados aún
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Análisis de consistencia */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Análisis de Consistencia
              <InfoTooltip
                content="Análisis de tu regularidad en el entrenamiento. La consistencia es clave para el progreso a largo plazo."
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
                    {metrics.consistency.workoutsThisWeek}
                  </p>
                  <p className="text-sm text-gray-400">Esta semana</p>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-white">
                    {metrics.consistency.workoutsLastWeek}
                  </p>
                  <p className="text-sm text-gray-400">Semana pasada</p>
                </div>
              </div>

              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <p className="text-xl font-bold text-blue-400">
                  {metrics.consistency.avgWorkoutsPerWeek}
                </p>
                <p className="text-sm text-gray-400">Promedio semanal</p>
              </div>

              {/* Comparación semanal */}
              <div className="pt-2">
                {metrics.consistency.workoutsThisWeek > metrics.consistency.workoutsLastWeek ? (
                  <div className="flex items-center justify-center text-green-400">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      Mejorando vs semana pasada
                    </span>
                  </div>
                ) : metrics.consistency.workoutsThisWeek < metrics.consistency.workoutsLastWeek ? (
                  <div className="flex items-center justify-center text-red-400">
                    <TrendingUp className="w-4 h-4 mr-1 rotate-180" />
                    <span className="text-sm">
                      Menos que semana pasada
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-gray-400">
                    <span className="text-sm">
                      Igual que semana pasada
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progresión semanal */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Progresión Semanal (Últimas 8 semanas)
              <InfoTooltip
                content="Evolución de tu volumen de entrenamiento y peso máximo por semana. Te ayuda a identificar patrones y ajustar tu rutina."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.weeklyProgress.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {metrics.weeklyProgress.slice(-4).map((week, index) => (
                    <div
                      key={week.week}
                      className="p-3 bg-gray-800 rounded-lg text-center"
                    >
                      <p className="text-sm text-gray-400 mb-1">
                        Sem. {week.week}
                      </p>
                      <p className="text-lg font-bold text-white">
                        {formatNumber(week.volume)} kg
                      </p>
                      <p className="text-xs text-gray-400">
                        {week.workouts} entrenamientos
                      </p>
                      <p className="text-xs text-blue-400">
                        Máx: {week.maxWeight}kg
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">
                  No hay datos suficientes para mostrar progresión semanal
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};