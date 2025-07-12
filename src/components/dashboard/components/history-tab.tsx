import { startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowDown, ArrowUp, History, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useMemo } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { formatNumber } from '../../../utils/functions';
import { Card, CardContent, CardHeader } from '../../card';
import { InfoTooltip } from '../../tooltip';

/**
 * Props para el componente HistoryTab
 */
interface HistoryTabProps {
  records: WorkoutRecord[];
}

/**
 * Interfaz para puntos del historial
 */
interface HistoryPoint {
  date: Date;
  value: number;
  label: string;
  details: string;
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
 * Tab del dashboard para mostrar el historial de entrenamientos con evolución temporal
 */
export const HistoryTab: React.FC<HistoryTabProps> = ({ records }) => {
  const historyData = useMemo((): HistoryPoint[] => {
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

    // Convertir a historial points con comparativas
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

    // Calcular cambios y tendencias
    return sortedData.map((point, index) => {
      const weekNumber = index + 1;
      let change = 0;
      let changePercent = 0;
      let trend: 'up' | 'down' | 'stable' = 'stable';

      if (index > 0) {
        const previousPoint = sortedData[index - 1];
        change = point.value - previousPoint.value;
        changePercent = previousPoint.value > 0 ? (change / previousPoint.value) * 100 : 0;

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

  const maxValue = Math.max(...historyData.map(point => point.value));

  // Calcular estadísticas de comparativa
  const totalGrowth = historyData.length > 1 ?
    historyData[historyData.length - 1].value - historyData[0].value : 0;
  const totalGrowthPercent = historyData.length > 1 && historyData[0].value > 0 ?
    (totalGrowth / historyData[0].value) * 100 : 0;

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
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Sin historial de entrenamientos
            </h3>
            <p className="text-gray-500">
              Registra entrenamientos durante varias semanas para ver tu historial
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
          <History className="w-5 h-5 mr-2" />
          Historial de Entrenamientos
          <InfoTooltip
            content="Evolución semanal detallada de tu progreso con métricas completas y comparativas entre períodos."
            position="top"
            className="ml-2"
          />
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Estadísticas generales con comparativas */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <p className="text-2xl font-bold text-blue-400">
                {historyData.length}
              </p>
              <p className="text-sm text-gray-400">Semanas registradas</p>
            </div>

            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <p className="text-2xl font-bold text-green-400">
                {historyData.length > 0 ? formatNumber(Math.max(...historyData.map(p => p.value))) : 0} kg
              </p>
              <p className="text-sm text-gray-400">Mejor semana</p>
            </div>

            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <p className="text-2xl font-bold text-purple-400">
                {historyData.length > 0 ? formatNumber(historyData.reduce((sum, p) => sum + p.value, 0) / historyData.length) : 0} kg
              </p>
              <p className="text-sm text-gray-400">Promedio semanal</p>
            </div>

            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-center space-x-2">
                <p className={`text-2xl font-bold ${totalGrowthPercent > 0 ? 'text-green-400' : totalGrowthPercent < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {totalGrowthPercent > 0 ? '+' : ''}{totalGrowthPercent.toFixed(1)}%
                </p>
                {totalGrowthPercent > 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : totalGrowthPercent < 0 ? (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                ) : (
                  <Minus className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <p className="text-sm text-gray-400">Crecimiento total</p>
            </div>
          </div>

          {/* Gráfico de línea simple */}
          <div className="relative h-64 bg-gray-900/50 rounded-lg p-4">
            <svg className="w-full h-full" viewBox="0 0 800 200">
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 20" fill="none" stroke="rgb(55, 65, 81)" strokeWidth="0.5" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Línea de progreso */}
              {historyData.length > 1 && (
                <path
                  d={historyData.map((point, index) => {
                    const x = (index / (historyData.length - 1)) * 760 + 20;
                    const y = 180 - ((point.value / maxValue) * 160);
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="rgb(59, 130, 246)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Área bajo la línea */}
              {historyData.length > 1 && (
                <path
                  d={historyData.map((point, index) => {
                    const x = (index / (historyData.length - 1)) * 760 + 20;
                    const y = 180 - ((point.value / maxValue) * 160);
                    if (index === 0) return `M ${x} 180 L ${x} ${y}`;
                    if (index === historyData.length - 1) return `L ${x} ${y} L ${x} 180 Z`;
                    return `L ${x} ${y}`;
                  }).join(' ')}
                  fill="url(#gradient)"
                  opacity="0.2"
                />
              )}

              {/* Gradiente para el área */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              {/* Puntos */}
              {historyData.map((point, index) => {
                const x = (index / Math.max(1, historyData.length - 1)) * 760 + 20;
                const y = 180 - ((point.value / maxValue) * 160);

                return (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={y}
                      r="6"
                      fill="rgb(59, 130, 246)"
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer hover:r-8 transition-all"
                    />
                    <title>{point.details}</title>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Datos semanales detallados con comparativas */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Historial Semanal Detallado</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {historyData.slice().reverse().map((point, index) => {
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
                          <span className="text-gray-400">Cambio vs semana anterior:</span>
                          <span className={`font-medium ${point.change > 0 ? 'text-green-400' : point.change < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                            {point.change > 0 ? '+' : ''}{formatNumber(point.change)} kg
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