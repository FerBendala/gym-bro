import type { WorkoutRecord } from '@/interfaces';
import { calculateTotalGrowth, formatNumber } from '@/utils/functions';
import { startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowDown, ArrowUp, Calendar, Clock, History, Minus, TrendingDown, TrendingUp, Trophy, Zap } from 'lucide-react';
import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Card, CardContent, CardHeader } from '../../../components/card';
import { StatCard } from '../../../components/stat-card';
import { InfoTooltip } from '../../../components/tooltip';

/**
 * Props para el componente HistoryTab
 */
interface HistoryTabProps {
  records: WorkoutRecord[];
}

/**
 * Interfaz para los datos de timeline del historial
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
  totalVolumeChangePercent: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Función helper para manejar valores numéricos seguros
 */
const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined || isNaN(value)) {
    return defaultValue;
  }
  return Number(value);
};

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

    // **CORRECCIÓN CLAVE**: Calcular cambios usando volumen promedio por sesión
    return sortedData.map((point, index) => {
      const weekNumber = index + 1;
      let change = 0;
      let changePercent = 0;
      let totalVolumeChangePercent = 0;
      let trend: 'up' | 'down' | 'stable' = 'stable';

      if (index > 0) {
        const previousPoint = sortedData[index - 1];

        // CORRECCIÓN: Comparación justa temporal - mismo punto en ambas semanas
        const now = new Date();
        const currentWeekStart = startOfWeek(point.date, { locale: es });
        const isCurrentWeekIncomplete = point.date.getTime() >= startOfWeek(now, { locale: es }).getTime();

        let currentAvgVolume: number;
        let previousAvgVolume: number;

        if (isCurrentWeekIncomplete) {
          // SEMANA ACTUAL INCOMPLETA: Comparar solo hasta el mismo día de la semana
          const dayOfWeekToCompare = now.getDay(); // 0=domingo, 1=lunes, etc.

          // Obtener registros de semana actual hasta el día actual
          const currentWeekRecords = records.filter(r => {
            const rDate = new Date(r.date);
            const rWeekStart = startOfWeek(rDate, { locale: es });
            const dayOfRecord = rDate.getDay();
            return rWeekStart.getTime() === currentWeekStart.getTime() &&
              dayOfRecord <= dayOfWeekToCompare;
          });

          // Obtener registros de semana anterior hasta el mismo día de la semana
          const previousWeekStart = startOfWeek(previousPoint.date, { locale: es });
          const previousWeekRecords = records.filter(r => {
            const rDate = new Date(r.date);
            const rWeekStart = startOfWeek(rDate, { locale: es });
            const dayOfRecord = rDate.getDay();
            return rWeekStart.getTime() === previousWeekStart.getTime() &&
              dayOfRecord <= dayOfWeekToCompare;
          });

          const currentPartialVolume = currentWeekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
          const previousPartialVolume = previousWeekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

          currentAvgVolume = currentWeekRecords.length > 0 ? currentPartialVolume / currentWeekRecords.length : 0;
          previousAvgVolume = previousWeekRecords.length > 0 ? previousPartialVolume / previousWeekRecords.length : 0;
        } else {
          // SEMANA COMPLETA: Comparación normal
          currentAvgVolume = point.totalWorkouts > 0 ? point.value / point.totalWorkouts : 0;
          previousAvgVolume = previousPoint.totalWorkouts > 0 ? previousPoint.value / previousPoint.totalWorkouts : 0;
        }

        // **CORRECCIÓN**: Calcular tanto cambio por sesión como volumen total
        const currentTotalVolume = point.value;
        const previousTotalVolume = previousPoint.value;

        // Cambio en volumen promedio por sesión
        change = Math.round(currentAvgVolume - previousAvgVolume);
        changePercent = previousAvgVolume > 0 ? ((currentAvgVolume - previousAvgVolume) / previousAvgVolume) * 100 : 0;

        // Cambio en volumen total para referencia
        totalVolumeChangePercent = previousTotalVolume > 0 ? ((currentTotalVolume - previousTotalVolume) / previousTotalVolume) * 100 : 0;

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
        totalVolumeChangePercent: index > 0 ? totalVolumeChangePercent : 0,
        trend
      };
    });
  }, [records]);

  // Preparar datos para ApexCharts
  const chartData = useMemo(() => {
    const series = [{
      name: 'Volumen Semanal',
      data: historyData.map(point => ({
        x: `Semana ${point.weekNumber}`,
        y: point.value,
        details: point.details,
        date: point.date.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      }))
    }];

    const options = {
      chart: {
        type: 'area' as const,
        height: 300,
        background: 'transparent',
        toolbar: {
          show: false
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      theme: {
        mode: 'dark' as const
      },
      colors: ['#3b82f6'],
      stroke: {
        curve: 'smooth' as const,
        width: 3
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          gradientToColors: ['#1d4ed8'],
          shadeIntensity: 1,
          type: 'vertical',
          opacityFrom: 0.7,
          opacityTo: 0.1,
          stops: [0, 100]
        }
      },
      grid: {
        borderColor: '#374151',
        strokeDashArray: 4,
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        }
      },
      xaxis: {
        categories: historyData.map(point => `Semana ${point.weekNumber}`),
        labels: {
          style: {
            colors: '#9ca3af',
            fontSize: '12px'
          }
        },
        axisBorder: {
          color: '#374151'
        },
        axisTicks: {
          color: '#374151'
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#9ca3af',
            fontSize: '12px'
          },
          formatter: (value: number) => `${formatNumber(value)} kg`
        }
      },
      tooltip: {
        theme: 'dark',
        style: {
          fontSize: '12px'
        },
        custom: ({ series, seriesIndex, dataPointIndex }: any) => {
          const point = historyData[dataPointIndex];
          if (!point) return '';

          return `
            <div class="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
              <div class="font-semibold text-white mb-1">Semana ${point.weekNumber}</div>
              <div class="text-gray-300 text-sm mb-2">${point.date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}</div>
              <div class="space-y-1">
                <div class="text-blue-400 font-medium">${formatNumber(point.value)} kg</div>
                <div class="text-gray-400 text-xs">${point.totalWorkouts} entrenamientos</div>
                <div class="text-gray-400 text-xs">Peso máximo: ${formatNumber(point.maxWeight)} kg</div>
                <div class="text-gray-400 text-xs">${point.uniqueExercises} ejercicios únicos</div>
              </div>
            </div>
          `;
        }
      },
      markers: {
        size: 6,
        colors: ['#3b82f6'],
        strokeColors: '#ffffff',
        strokeWidth: 2,
        hover: {
          size: 8
        }
      },
      dataLabels: {
        enabled: false
      }
    };

    return { series, options };
  }, [historyData]);

  // Calcular estadísticas de comparativa
  const maxValue = historyData.length > 0 ? Math.max(...historyData.map(point => point.value)) : 0;
  const avgValue = historyData.length > 0 ? historyData.reduce((sum, p) => sum + p.value, 0) / historyData.length : 0;

  // **FUNCIÓN UNIFICADA**: Usar la función utilitaria para calcular crecimiento
  const { percentGrowth: totalGrowthPercent } = calculateTotalGrowth(historyData);

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
      <div className="text-center py-12">
        <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <History className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Sin historial de entrenamientos
        </h3>
        <p className="text-gray-500">
          Registra entrenamientos durante varias semanas para ver tu historial
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales del historial */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Semanas Registradas"
          value={historyData.length.toString()}
          icon={Calendar}
          variant="primary"
          tooltip="Número total de semanas con entrenamientos registrados."
          tooltipPosition="top"
        />

        <StatCard
          title="Mejor Semana"
          value={`${formatNumber(maxValue)} kg`}
          icon={Trophy}
          variant="success"
          tooltip="Semana con mayor volumen total de entrenamiento."
          tooltipPosition="top"
        />

        <StatCard
          title="Promedio Semanal"
          value={`${formatNumber(avgValue)} kg`}
          icon={Zap}
          variant="warning"
          tooltip="Volumen promedio por semana durante todo el período."
          tooltipPosition="top"
        />

        <StatCard
          title="Crecimiento Total"
          value={`${totalGrowthPercent >= 0 ? '+' : ''}${formatNumber(safeNumber(totalGrowthPercent, 0), 1)}%`}
          icon={totalGrowthPercent >= 0 ? TrendingUp : TrendingDown}
          variant={totalGrowthPercent >= 10 ? 'success' : totalGrowthPercent >= 0 ? 'warning' : 'danger'}
          tooltip="Cambio porcentual en volumen promedio por sesión comparando las primeras semanas con las últimas semanas (más estable que primera vs última)."
          tooltipPosition="top"
        />

        <StatCard
          title="Duración Promedio"
          value={`${Math.round(historyData.reduce((sum, p) => sum + p.totalWorkouts, 0) / Math.max(historyData.length, 1))} ent/sem`}
          icon={Clock}
          variant="secondary"
          tooltip="Número promedio de entrenamientos por semana."
          tooltipPosition="top"
        />
      </div>

      {/* Gráfico de evolución temporal con ApexCharts */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <History className="w-5 h-5 mr-2" />
            Evolución Temporal del Volumen
            <InfoTooltip
              content="Gráfico interactivo que muestra la evolución semanal del volumen de entrenamiento con tooltips detallados."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Chart
              options={chartData.options}
              series={chartData.series}
              type="area"
              height="100%"
            />
          </div>
        </CardContent>
      </Card>

      {/* Datos semanales detallados */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Historial Semanal Detallado
            <InfoTooltip
              content="Desglose detallado de cada semana con métricas completas y comparativas."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {historyData.slice().reverse().map((point, index) => {
              const TrendIcon = getTrendIcon(point.trend);
              const trendColor = getTrendColor(point.trend);

              const getTrendBadge = () => {
                switch (point.trend) {
                  case 'up': return { text: 'Mejorando', color: 'bg-green-500 text-white', icon: TrendingUp };
                  case 'down': return { text: 'Declinando', color: 'bg-red-500 text-white', icon: TrendingDown };
                  default: return { text: 'Estable', color: 'bg-gray-500 text-white', icon: null };
                }
              };

              const trendBadge = getTrendBadge();

              return (
                <div
                  key={index}
                  className="relative p-4 sm:p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-200"
                >
                  {/* Header con semana, fecha y estado */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-br from-blue-500/80 to-blue-600/80">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base md:text-lg font-semibold text-white">
                          Semana {point.weekNumber}
                        </h4>
                        <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                          <span className="text-xs sm:text-sm text-gray-400">
                            {point.date.toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          {point.weekNumber > 1 && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${trendBadge.color}`}>
                              {trendBadge.text}
                            </span>
                          )}
                          {point.weekNumber > 1 && trendBadge.icon && (
                            <trendBadge.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${point.trend === 'down' ? 'text-red-400' : 'text-green-400'}`} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Volumen principal y cambio */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-gray-400">
                        volumen total
                      </div>
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400">
                        {formatNumber(point.value)} kg
                      </div>
                    </div>
                  </div>

                  {/* Métricas principales en grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4">
                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">Entrenamientos</div>
                      <div className="text-sm sm:text-lg font-semibold text-white">
                        {point.totalWorkouts}
                      </div>
                      <div className="text-xs text-gray-500">sesiones</div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">Peso Máximo</div>
                      <div className="text-sm sm:text-lg font-semibold text-white">
                        {formatNumber(point.maxWeight)}
                      </div>
                      <div className="text-xs text-gray-500">kg</div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">Series</div>
                      <div className="text-sm sm:text-lg font-semibold text-white">
                        {point.totalSets}
                      </div>
                      <div className="text-xs text-gray-500">totales</div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">Ejercicios</div>
                      <div className="text-sm sm:text-lg font-semibold text-white">
                        {point.uniqueExercises}
                      </div>
                      <div className="text-xs text-gray-500">únicos</div>
                    </div>
                  </div>

                  {/* Información de cambio vs semana anterior */}
                  {point.weekNumber > 1 && (
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <h5 className="text-xs font-medium text-gray-300 mb-2 flex items-center gap-1">
                        <TrendIcon className={`w-3 h-3 ${trendColor}`} />
                        Cambio vs Semana Anterior
                      </h5>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Volumen/sesión:</span>
                          <span className={`text-xs font-medium ${point.change > 0 ? 'text-green-400' : point.change < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                            {point.change > 0 ? '+' : ''}{formatNumber(point.change)} kg ({point.changePercent > 0 ? '+' : ''}{formatNumber(point.changePercent, 1)}%)
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Volumen total:</span>
                          <span className={`text-xs font-medium ${point.totalVolumeChangePercent > 0 ? 'text-green-400' : point.totalVolumeChangePercent < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                            {point.totalVolumeChangePercent > 0 ? '+' : ''}{formatNumber(point.totalVolumeChangePercent, 1)}%
                          </span>
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
    </div>
  );
}; 