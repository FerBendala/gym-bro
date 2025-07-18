import { startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowDown, ArrowUp, Calendar, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useMemo } from 'react';
import { calculateTotalGrowth, formatNumber } from '../../utils/functions';
import { Card, CardContent, CardHeader } from '../card';
import { InfoTooltip } from '../tooltip';
import type { ProgressTimelineProps, TimelinePoint } from './types';

/**
 * Interfaz extendida para datos de timeline con comparativas
 */
interface ExtendedTimelinePoint extends TimelinePoint {
  weekNumber: number;
  totalWorkouts: number;
  avgWeight: number;
  maxWeight: number;
  totalSets: number;
  totalReps: number;
  uniqueExercises: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Componente de timeline de progreso
 */
export const ProgressTimeline: React.FC<ProgressTimelineProps> = ({ records }) => {
  const timelineData = useMemo((): ExtendedTimelinePoint[] => {
    if (records.length === 0) return [];

    // Agrupar por semanas usando date-fns con locale español (lunes a domingo)
    const weeklyData = new Map<string, {
      totalVolume: number;
      avgWeight: number;
      workouts: number;
      maxWeight: number;
      totalSets: number;
      totalReps: number;
      exercises: Set<string>;
      weekStart: Date;
    }>();

    records.forEach(record => {
      const date = new Date(record.date);
      // Usar startOfWeek con locale español para consistencia con el resto del código
      const weekStart = startOfWeek(date, { locale: es }); // Lunes como inicio de semana
      const weekKey = weekStart.toISOString().split('T')[0];

      const volume = record.weight * record.reps * record.sets;
      const estimated1RM = record.weight * (1 + Math.min(record.reps, 20) / 30);

      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, {
          totalVolume: 0,
          avgWeight: 0,
          workouts: 0,
          maxWeight: 0,
          totalSets: 0,
          totalReps: 0,
          exercises: new Set(),
          weekStart
        });
      }

      const week = weeklyData.get(weekKey)!;
      week.totalVolume += volume;
      // Usar 1RM estimado para el promedio de fuerza
      week.avgWeight = (week.avgWeight * week.workouts + estimated1RM) / (week.workouts + 1);
      week.maxWeight = Math.max(week.maxWeight, record.weight);
      week.totalSets += record.sets;
      week.totalReps += record.reps;
      week.workouts += 1;

      if (record.exercise?.name) {
        week.exercises.add(record.exercise.name);
      }
    });

    // Convertir a timeline points con comparativas
    const sortedData = Array.from(weeklyData.entries())
      .map(([weekKey, data]) => ({
        date: new Date(weekKey),
        value: data.totalVolume,
        label: `${formatNumber(data.totalVolume)} kg`,
        details: `${data.workouts} entrenamientos • Fuerza promedio: ${formatNumber(data.avgWeight)} kg (1RM est.)`,
        weekNumber: 0, // Se calculará después
        totalWorkouts: data.workouts,
        avgWeight: data.avgWeight,
        maxWeight: data.maxWeight,
        totalSets: data.totalSets,
        totalReps: data.totalReps,
        uniqueExercises: data.exercises.size,
        change: 0,
        changePercent: 0,
        trend: 'stable' as const
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calcular cambios y tendencias - CORREGIDO: usar volumen promedio por sesión
    return sortedData.map((point, index) => {
      const weekNumber = index + 1;
      let change = 0;
      let changePercent = 0;
      let trend: 'up' | 'down' | 'stable' = 'stable';

      if (index > 0) {
        const previousPoint = sortedData[index - 1];

        // **CORRECCIÓN CLAVE**: Usar volumen promedio por sesión para comparación justa
        const currentAvgVolume = point.totalWorkouts > 0 ? point.value / point.totalWorkouts : 0;
        const previousAvgVolume = previousPoint.totalWorkouts > 0 ? previousPoint.value / previousPoint.totalWorkouts : 0;

        // Cambio en volumen promedio por sesión
        change = Math.round(currentAvgVolume - previousAvgVolume);
        changePercent = previousAvgVolume > 0 ? ((currentAvgVolume - previousAvgVolume) / previousAvgVolume) * 100 : 0;

        // **NOTA**: En progress-timeline se mantiene solo volumen por sesión para simplicidad
        // El volumen total no se muestra aquí ya que es principalmente para gráficos

        if (Math.abs(changePercent) < 5) {
          trend = 'stable';
        } else if (changePercent > 0) {
          trend = 'up';
        } else {
          trend = 'down';
        }
      }

      return {
        ...point,
        weekNumber,
        change,
        changePercent,
        trend
      };
    });
  }, [records]);

  const maxValue = Math.max(...timelineData.map(point => point.value));

  // **FUNCIÓN UNIFICADA**: Usar la función utilitaria para calcular crecimiento
  const { percentGrowth: totalGrowthPercent } = calculateTotalGrowth(timelineData);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return ArrowUp;
      case 'down': return ArrowDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
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
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Sin datos de progreso
            </h3>
            <p className="text-gray-500">
              Registra entrenamientos durante varias semanas para ver tu evolución
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Línea de Tiempo de Progreso
          <InfoTooltip
            content="Visualización cronológica de tu progreso semanal con detalles de cada período y comparativas entre semanas."
            position="top"
            className="ml-2"
          />
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Estadísticas generales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400 mr-2" />
                  <p className="text-3xl font-bold text-blue-400">
                    {timelineData.length}
                  </p>
                </div>
                <p className="text-sm text-gray-400">Semanas registradas</p>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-400 mr-2" />
                  <p className="text-3xl font-bold text-green-400">
                    {formatNumber(maxValue)} kg
                  </p>
                </div>
                <p className="text-sm text-gray-400">Mejor semana</p>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-center">
                <div className="flex items-center justify-center">
                  {totalGrowthPercent > 0 ? (
                    <TrendingUp className="w-6 h-6 text-green-400 mr-2" />
                  ) : totalGrowthPercent < 0 ? (
                    <TrendingDown className="w-6 h-6 text-red-400 mr-2" />
                  ) : (
                    <Minus className="w-6 h-6 text-gray-400 mr-2" />
                  )}
                  <p className={`text-3xl font-bold ${totalGrowthPercent > 0 ? 'text-green-400' : totalGrowthPercent < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {totalGrowthPercent > 0 ? '+' : ''}{totalGrowthPercent.toFixed(1)}%
                  </p>
                </div>
                <p className="text-sm text-gray-400">Crecimiento total (múltiples semanas)</p>
              </div>
            </div>
          </div>

          {/* Timeline detallada */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Progreso Semanal Detallado</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {timelineData.slice().reverse().map((point, index) => {
                const TrendIcon = getTrendIcon(point.trend);
                const trendColor = getTrendColor(point.trend);

                return (
                  <div key={index} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold text-white">
                          Semana {point.weekNumber}
                        </span>
                        <span className="text-sm text-gray-400">
                          {point.date.toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-blue-400">
                          {formatNumber(point.value)} kg
                        </span>
                        {point.weekNumber > 1 && (
                          <div className={`flex items-center space-x-1 ${trendColor}`}>
                            <TrendIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {point.changePercent > 0 ? '+' : ''}{point.changePercent.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Entrenamientos:</span>
                        <span className="ml-2 font-medium text-white">{point.totalWorkouts}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Peso máximo:</span>
                        <span className="ml-2 font-medium text-white">{formatNumber(point.maxWeight)} kg</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Series totales:</span>
                        <span className="ml-2 font-medium text-white">{point.totalSets}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Ejercicios únicos:</span>
                        <span className="ml-2 font-medium text-white">{point.uniqueExercises}</span>
                      </div>
                    </div>

                    {point.weekNumber > 1 && (
                      <div className="mt-3 pt-3 border-t border-gray-700/50 text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-400">Cambio vs semana anterior (promedio/sesión):</span>
                          <span className={`font-medium ${point.change > 0 ? 'text-green-400' : point.change < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                            {point.change > 0 ? '+' : ''}{formatNumber(point.change)} kg ({point.changePercent > 0 ? '+' : ''}{point.changePercent.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 