import { Activity, BarChart3, Calendar, Target, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import React, { useMemo } from 'react';
import { formatNumber } from '../../utils/functions';
import { Card, CardContent, CardHeader } from '../card';
import { InfoTooltip } from '../tooltip';
import type { AnalyticsMetric, AnalyticsOverviewProps } from './types';

/**
 * Componente de overview principal de analytics
 */
export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ records }) => {
  const metrics = useMemo((): AnalyticsMetric[] => {
    if (records.length === 0) return [];

    // Filtrar registros válidos con información de ejercicio
    const validRecords = records.filter(record =>
      record.exercise && record.exercise.name && record.exercise.name !== 'Ejercicio desconocido'
    );

    // Calcular métricas principales
    const totalVolume = validRecords.reduce((sum, record) =>
      sum + (record.weight * record.reps * record.sets), 0
    );

    const totalWorkouts = validRecords.length;

    // Calcular ejercicios únicos usando el nombre del ejercicio
    const uniqueExercises = new Set(
      validRecords
        .filter(r => r.exercise?.name)
        .map(r => r.exercise!.name)
    ).size;

    // Calcular promedio de peso
    const averageWeight = validRecords.length > 0
      ? validRecords.reduce((sum, record) => sum + record.weight, 0) / validRecords.length
      : 0;

    // Calcular días únicos de entrenamiento
    const uniqueDays = new Set(validRecords.map(r => r.date.toDateString())).size;

    // Calcular frecuencia semanal CORRECTA
    const sortedDates = validRecords.map(r => r.date).sort((a, b) => a.getTime() - b.getTime());
    const firstDate = sortedDates[0];
    const lastDate = sortedDates[sortedDates.length - 1];

    // Calcular el número de semanas completas en el período
    const daysDiff = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
    const weeks = Math.max(1, daysDiff / 7);
    const weeklyFrequency = uniqueDays / weeks;

    // Calcular progreso (comparar primera y última semana)
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const firstWeekRecords = validRecords.filter(r =>
      r.date.getTime() <= firstDate.getTime() + oneWeekMs
    );
    const lastWeekRecords = validRecords.filter(r =>
      r.date.getTime() >= lastDate.getTime() - oneWeekMs
    );

    // Calcular progreso usando 1RM estimado para mayor precisión
    const firstWeekAvg1RM = firstWeekRecords.length > 0
      ? firstWeekRecords.reduce((sum, r) => {
        const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
        return sum + oneRM;
      }, 0) / firstWeekRecords.length
      : 0;
    const lastWeekAvg1RM = lastWeekRecords.length > 0
      ? lastWeekRecords.reduce((sum, r) => {
        const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
        return sum + oneRM;
      }, 0) / lastWeekRecords.length
      : 0;

    const weightProgress = lastWeekAvg1RM - firstWeekAvg1RM;
    const weightProgressPercent = firstWeekAvg1RM > 0
      ? (weightProgress / firstWeekAvg1RM) * 100
      : 0;

    return [
      {
        id: 'total-volume',
        name: 'Volumen Total',
        value: totalVolume,
        unit: 'kg',
        trend: 'up',
        trendValue: 0,
        description: 'Suma total de peso levantado en todos los entrenamientos',
        color: 'blue'
      },
      {
        id: 'total-workouts',
        name: 'Total Entrenamientos',
        value: totalWorkouts,
        unit: '',
        trend: 'up',
        trendValue: 0,
        description: 'Número total de entrenamientos registrados',
        color: 'green'
      },
      {
        id: 'unique-exercises',
        name: 'Ejercicios Únicos',
        value: uniqueExercises,
        unit: '',
        trend: 'stable',
        trendValue: 0,
        description: 'Variedad de ejercicios diferentes realizados',
        color: 'purple'
      },
      {
        id: 'average-weight',
        name: 'Fuerza Promedio',
        value: averageWeight,
        unit: 'kg',
        trend: weightProgress > 0 ? 'up' : weightProgress < 0 ? 'down' : 'stable',
        trendValue: weightProgressPercent,
        description: 'Progreso de fuerza considerando peso y repeticiones',
        color: 'yellow'
      },
      {
        id: 'training-days',
        name: 'Días Entrenados',
        value: uniqueDays,
        unit: '',
        trend: 'up',
        trendValue: 0,
        description: 'Número de días únicos con entrenamientos',
        color: 'indigo'
      },
      {
        id: 'weekly-frequency',
        name: 'Frecuencia Semanal',
        value: weeklyFrequency,
        unit: 'días/sem',
        trend: weeklyFrequency >= 3 ? 'up' : weeklyFrequency >= 2 ? 'stable' : 'down',
        trendValue: 0,
        description: 'Promedio de días de entrenamiento por semana',
        color: 'teal'
      }
    ];
  }, [records]);

  const getMetricIcon = (metricId: string) => {
    switch (metricId) {
      case 'total-volume': return BarChart3;
      case 'total-workouts': return Calendar;
      case 'unique-exercises': return Target;
      case 'average-weight': return TrendingUp;
      case 'training-days': return Activity;
      case 'weekly-frequency': return Zap;
      default: return BarChart3;
    }
  };

  const getMetricColor = (color: string) => {
    const colors = {
      blue: 'text-blue-400 bg-blue-600/20',
      green: 'text-green-400 bg-green-600/20',
      purple: 'text-purple-400 bg-purple-600/20',
      yellow: 'text-yellow-400 bg-yellow-600/20',
      indigo: 'text-indigo-400 bg-indigo-600/20',
      teal: 'text-teal-400 bg-teal-600/20'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (records.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Sin datos para analizar
            </h3>
            <p className="text-gray-500">
              Registra algunos entrenamientos para ver métricas detalladas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-600/20 rounded-lg">
          <BarChart3 className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Resumen de Métricas</h2>
          <p className="text-gray-400">Análisis general de tu progreso de entrenamiento</p>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const Icon = getMetricIcon(metric.id);
          const TrendIcon = getTrendIcon(metric.trend);
          const colorClasses = getMetricColor(metric.color);
          const trendColorClass = getTrendColor(metric.trend);

          return (
            <Card key={metric.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${colorClasses}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-400">
                          {metric.name}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-white">
                        {formatNumber(metric.value)}{metric.unit && ` ${metric.unit}`}
                      </p>

                      {metric.trendValue !== 0 && (
                        <div className={`flex items-center space-x-1 ${trendColorClass}`}>
                          <TrendIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {metric.trendValue > 0 ? '+' : ''}{metric.trendValue.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <InfoTooltip
                    content={metric.description}
                    position="left"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumen textual */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Resumen del Período
            <InfoTooltip
              content="Análisis automático de tus datos de entrenamiento con insights clave."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-blue-400">Logros Destacados</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Has levantado un total de <strong>{formatNumber(metrics[0]?.value || 0)} kg</strong></span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Completaste <strong>{metrics[1]?.value || 0} entrenamientos</strong></span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Trabajaste <strong>{metrics[2]?.value || 0} ejercicios diferentes</strong></span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-yellow-400">Patrones de Entrenamiento</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Peso promedio: <strong>{formatNumber(metrics[3]?.value || 0)} kg</strong></span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Entrenaste <strong>{metrics[4]?.value || 0} días únicos</strong></span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Frecuencia: <strong>{formatNumber(metrics[5]?.value || 0)} días/semana</strong></span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 