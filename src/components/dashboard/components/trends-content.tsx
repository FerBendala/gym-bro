import { Brain, Calendar, Target, TrendingDown, TrendingUp } from 'lucide-react';
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

  // Calcular tendencias generales
  const volumeTrend = trendsData.temporalEvolution.growthRate;
  const consistency = trendsData.workoutHabits.consistencyScore;
  const progress = trendsData.temporalEvolution.predictions.confidence;

  return (
    <div className="space-y-6">
      {/* Análisis de Tendencias */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">📈</span>
            Análisis de Tendencias
            <InfoTooltip
              content="Análisis de tendencias de volumen y progreso por día de la semana"
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              title="Tendencia Volumen"
              value={`${volumeTrend > 0 ? '+' : ''}${volumeTrend.toFixed(1)}kg/sem`}
              icon={volumeTrend > 0 ? TrendingUp : TrendingDown}
              variant={volumeTrend > 0 ? 'success' : volumeTrend < 0 ? 'danger' : 'primary'}
              tooltip="Tendencia semanal del volumen de entrenamiento"
            />
            <StatCard
              title="Crecimiento"
              value={`${trendsData.temporalEvolution.growthRate > 0 ? '+' : ''}${trendsData.temporalEvolution.growthRate.toFixed(1)}%`}
              icon={trendsData.temporalEvolution.growthRate > 0 ? TrendingUp : TrendingDown}
              variant={trendsData.temporalEvolution.growthRate > 0 ? 'success' : trendsData.temporalEvolution.growthRate < 0 ? 'danger' : 'primary'}
              tooltip="Tasa de crecimiento semanal"
            />
            <StatCard
              title="Consistencia"
              value={`${Math.round(consistency)}%`}
              icon={Calendar}
              variant={consistency >= 70 ? 'success' : consistency >= 50 ? 'warning' : 'danger'}
              tooltip="Consistencia en el entrenamiento"
            />
            <StatCard
              title="Confianza"
              value={`${Math.round(progress)}%`}
              icon={Brain}
              variant={progress >= 80 ? 'success' : progress >= 60 ? 'warning' : 'danger'}
              tooltip="Confianza en las predicciones"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tendencias por Día */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">📊</span>
            Tendencias por Día de la Semana
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendsData.dayMetricsOrdered.map((dayMetric) => {
              const Icon = dayIcons[dayMetric.dayName] || Calendar;
              const isPositive = dayMetric.trend > 0;

              return (
                <div
                  key={dayMetric.dayName}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl border border-gray-600/30 p-4 hover:border-gray-500/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${isPositive ? 'from-green-500 to-green-700' : 'from-red-500 to-red-700'}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-semibold text-white">{dayMetric.dayName}</h4>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{dayMetric.trend.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-400">{dayMetric.totalVolume}kg</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Sesiones:</span>
                      <span className="text-white">{dayMetric.workouts}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Promedio:</span>
                      <span className="text-white">{Math.round(dayMetric.avgVolume)}kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Estado:</span>
                      <span className={`${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? 'Mejorando' : 'Decreciendo'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Predicciones */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">🔮</span>
            Predicciones y Recomendaciones
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trendsData.temporalEvolution.insights.map((insight, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-800/30 to-gray-700/30 rounded-lg border border-gray-600/30 p-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                    <Brain className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">Insight #{index + 1}</h4>
                    <p className="text-gray-300 text-sm">{insight}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 