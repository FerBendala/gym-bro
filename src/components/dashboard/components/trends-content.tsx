import { Calendar, Target } from 'lucide-react';
import React from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { calculateTrendsAnalysis } from '../../../utils/functions/trends-analysis';
import { Card, CardContent, CardHeader } from '../../card';
import { StatCard } from '../../stat-card';
import { InfoTooltip } from '../../tooltip';

interface TrendsContentProps {
  records: WorkoutRecord[];
}

// Íconos para días de la semana
const dayIcons: Record<string, React.FC<any>> = {
  'Lunes': Target,
  'Martes': Calendar,
  'Miércoles': Target,
  'Jueves': Calendar,
  'Viernes': Target,
  'Sábado': Calendar,
  'Domingo': Calendar
};

export const TrendsContent: React.FC<TrendsContentProps> = ({ records }) => {
  const trendsData = calculateTrendsAnalysis(records);

  return (
    <div className="space-y-6">
      {/* Balance por Día de la Semana */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">📅</span>
            Balance por Día de la Semana
            <InfoTooltip
              content="Análisis del balance de entrenamiento por cada día de la semana"
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendsData.dayMetricsOrdered.map((dayMetric) => {
              const Icon = dayIcons[dayMetric.dayName] || Calendar;
              const isActive = dayMetric.workouts > 0;

              return (
                <div
                  key={dayMetric.dayName}
                  className={`bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl border p-4 hover:border-gray-500/50 transition-all duration-200 ${isActive ? 'border-green-500/30' : 'border-gray-600/30'
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${isActive ? 'from-green-500 to-green-700' : 'from-gray-500 to-gray-700'}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-semibold text-white">{dayMetric.dayName}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{dayMetric.totalVolume}kg</div>
                      <div className="text-sm text-gray-400">{dayMetric.workouts} sesiones</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Volumen:</span>
                      <span className="text-white">{dayMetric.totalVolume}kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Promedio:</span>
                      <span className="text-white">{Math.round(dayMetric.avgVolume)}kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Ejercicios:</span>
                      <span className="text-white">{dayMetric.uniqueExercises}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Consistencia:</span>
                      <span className={`${dayMetric.consistency >= 70 ? 'text-green-400' : dayMetric.consistency >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {Math.round(dayMetric.consistency)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Estado:</span>
                      <span className={`${isActive ? 'text-green-400' : 'text-gray-400'}`}>
                        {isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resumen Semanal */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">📊</span>
            Resumen Semanal
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              title="Días Activos"
              value={trendsData.dayMetricsOrdered.filter(d => d.workouts > 0).length.toString()}
              icon={Calendar}
              variant="primary"
              tooltip="Número de días con entrenamiento"
            />
            <StatCard
              title="Volumen Total"
              value={`${Math.round(trendsData.dayMetricsOrdered.reduce((sum, d) => sum + d.totalVolume, 0))}kg`}
              icon={Target}
              variant="primary"
              tooltip="Volumen total de la semana"
            />
            <StatCard
              title="Consistencia"
              value={`${Math.round(trendsData.workoutHabits.consistencyScore)}%`}
              icon={Calendar}
              variant={trendsData.workoutHabits.consistencyScore >= 70 ? 'success' : trendsData.workoutHabits.consistencyScore >= 50 ? 'warning' : 'danger'}
              tooltip="Consistencia semanal"
            />
            <StatCard
              title="Mejor Día"
              value={trendsData.workoutHabits.preferredDay}
              icon={Target}
              variant="primary"
              tooltip="Día con más entrenamientos"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 