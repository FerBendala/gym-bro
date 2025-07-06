import { Calendar, TrendingUp } from 'lucide-react';
import React, { useMemo } from 'react';
import { formatNumber } from '../../utils/functions';
import { Card, CardContent, CardHeader } from '../card';
import { InfoTooltip } from '../tooltip';
import type { ProgressTimelineProps, TimelinePoint } from './types';

/**
 * Componente de timeline de progreso
 */
export const ProgressTimeline: React.FC<ProgressTimelineProps> = ({ records }) => {
  const timelineData = useMemo((): TimelinePoint[] => {
    if (records.length === 0) return [];

    // Agrupar por semanas
    const weeklyData = new Map<string, { totalVolume: number; avgWeight: number; workouts: number }>();

    records.forEach(record => {
      const date = new Date(record.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Inicio de semana (domingo)
      const weekKey = weekStart.toISOString().split('T')[0];

      const volume = record.weight * record.reps * record.sets;

      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, { totalVolume: 0, avgWeight: 0, workouts: 0 });
      }

      const week = weeklyData.get(weekKey)!;
      week.totalVolume += volume;
      week.avgWeight = (week.avgWeight * week.workouts + record.weight) / (week.workouts + 1);
      week.workouts += 1;
    });

    // Convertir a timeline points
    return Array.from(weeklyData.entries())
      .map(([weekKey, data]) => ({
        date: new Date(weekKey),
        value: data.totalVolume,
        label: `${formatNumber(data.totalVolume)} kg`,
        details: `${data.workouts} entrenamientos • Peso promedio: ${formatNumber(data.avgWeight)} kg`
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [records]);

  const maxValue = Math.max(...timelineData.map(point => point.value));

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
          <TrendingUp className="w-5 h-5 mr-2" />
          Timeline de Progreso
          <InfoTooltip
            content="Evolución semanal de tu volumen de entrenamiento. Cada punto representa una semana completa."
            position="top"
            className="ml-2"
          />
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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
              {timelineData.length > 1 && (
                <path
                  d={timelineData.map((point, index) => {
                    const x = (index / (timelineData.length - 1)) * 760 + 20;
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
              {timelineData.length > 1 && (
                <path
                  d={timelineData.map((point, index) => {
                    const x = (index / (timelineData.length - 1)) * 760 + 20;
                    const y = 180 - ((point.value / maxValue) * 160);
                    if (index === 0) return `M ${x} 180 L ${x} ${y}`;
                    if (index === timelineData.length - 1) return `L ${x} ${y} L ${x} 180 Z`;
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
              {timelineData.map((point, index) => {
                const x = (index / Math.max(1, timelineData.length - 1)) * 760 + 20;
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

          {/* Estadísticas del timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <p className="text-2xl font-bold text-blue-400">
                {timelineData.length}
              </p>
              <p className="text-sm text-gray-400">Semanas registradas</p>
            </div>

            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <p className="text-2xl font-bold text-green-400">
                {timelineData.length > 0 ? formatNumber(Math.max(...timelineData.map(p => p.value))) : 0} kg
              </p>
              <p className="text-sm text-gray-400">Mejor semana</p>
            </div>

            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <p className="text-2xl font-bold text-purple-400">
                {timelineData.length > 0 ? formatNumber(timelineData.reduce((sum, p) => sum + p.value, 0) / timelineData.length) : 0} kg
              </p>
              <p className="text-sm text-gray-400">Promedio semanal</p>
            </div>
          </div>

          {/* Lista de semanas recientes */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Últimas Semanas</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {timelineData.slice(-6).reverse().map((point, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Semana del {point.date.toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">{point.details}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-400">{point.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 