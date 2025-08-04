import { TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';
import Chart from 'react-apexcharts';

import { PROGRESS_THRESHOLDS } from '@/constants';
import { KNOWN_EXERCISE_DISTRIBUTIONS } from '@/constants/exercise.constants';
import type { ExerciseAnalysis, WorkoutRecord } from '@/interfaces';
import { formatNumberToString, getCategoryColor, getCategoryIcon } from '@/utils';

interface ExercisesDetailedAnalysisProps {
  exercises: ExerciseAnalysis[];
  selectedCategory: string;
  categoriesWithCount: { id: string; name: string; count: number }[];
  records: WorkoutRecord[]; // Añadir acceso a los registros originales
}

export const ExercisesDetailedAnalysis: React.FC<ExercisesDetailedAnalysisProps> = ({
  exercises,
  selectedCategory,
  categoriesWithCount,
  records,
}) => {
  const getProgressBadge = (progressPercent: number) => {
    if (progressPercent > PROGRESS_THRESHOLDS.EXCELLENT) return { text: 'Excelente', color: 'bg-green-500 text-white', icon: TrendingUp };
    if (progressPercent > PROGRESS_THRESHOLDS.IMPROVING) return { text: 'Mejorando', color: 'bg-green-500 text-white', icon: TrendingUp };
    if (progressPercent < PROGRESS_THRESHOLDS.DECLINING) return { text: 'Declinando', color: 'bg-red-500 text-white', icon: TrendingDown };
    return { text: 'Estable', color: 'bg-gray-500 text-white', icon: null };
  };

  // Función para obtener la categoría dominante de un ejercicio
  const getDominantCategory = (exerciseName: string): string => {
    const distribution = KNOWN_EXERCISE_DISTRIBUTIONS[exerciseName];
    if (distribution) {
      // Encontrar la categoría con mayor porcentaje
      const dominantCategory = Object.entries(distribution).reduce((max, [category, percentage]) =>
        percentage > max.percentage ? { category, percentage } : max,
        { category: 'Sin categoría', percentage: 0 }
      );
      return dominantCategory.category;
    }
    // Si no hay distribución conocida, usar la primera categoría
    return 'Sin categoría';
  };

  // Ordenar ejercicios por progreso (descendente)
  const sortedExercises = [...exercises].sort((a, b) => b.progressPercent - a.progressPercent);

  if (exercises.length === 0) {
    return (<div className="text-center py-8">
      <p className="text-gray-400 text-sm">
        No hay ejercicios en la categoría "{categoriesWithCount.find(cat => cat.id === selectedCategory)?.name || selectedCategory}"
      </p>
    </div>);
  }

  return (
    <div className="space-y-6">
      {/* Cards de ejercicios con gráficos individuales */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {sortedExercises.map((exercise) => {
          const dominantCategory = getDominantCategory(exercise.name);
          const Icon = getCategoryIcon(dominantCategory);
          const colorGradient = getCategoryColor(dominantCategory);
          const progressBadge = getProgressBadge(exercise.progressPercent);

          // Obtener los registros reales de este ejercicio
          const exerciseRecords = records.filter(record =>
            record.exercise?.name === exercise.name
          ).sort((a, b) => a.date.getTime() - b.date.getTime());

          // Eliminar duplicados por fecha y usar solo el peso más alto de cada día
          const uniqueRecords = exerciseRecords.reduce((acc, record) => {
            const dateKey = record.date.toDateString();
            if (!acc[dateKey] || record.weight > acc[dateKey].weight) {
              acc[dateKey] = record;
            }
            return acc;
          }, {} as Record<string, WorkoutRecord>);

          // Usar los pesos reales de cada entrenamiento
          const progressData = Object.values(uniqueRecords)
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((record, index) => ({
              weight: record.weight,
              session: index + 1,
              date: record.date,
            }));

          const minWeight = Math.min(...progressData.map(d => d.weight));
          const maxWeightInData = Math.max(...progressData.map(d => d.weight));
          const weightRange = maxWeightInData - minWeight;

          // Expandir el rango para usar toda la altura disponible
          const expandedMinWeight = minWeight - (weightRange * 0.2);
          const expandedMaxWeight = maxWeightInData + (weightRange * 0.2);

          return (
            <div key={exercise.name} className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">

              {/* Header con información principal */}
              <div className="mb-6">
                {/* Información secundaria */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-br ${colorGradient}`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${progressBadge.color}`}>
                        {progressBadge.text}
                      </span>
                      {progressBadge.icon && (
                        <progressBadge.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${exercise.progressPercent < 0 ? 'text-red-400' : 'text-green-400'}`} />
                      )}
                    </div>
                  </div>

                  {/* Progreso principal */}
                  <div className="text-right">
                    <div className={`text-2xl sm:text-3xl font-bold ${exercise.progressPercent > 0 ? 'text-green-400' : exercise.progressPercent < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {exercise.progressPercent > 0 ? '+' : ''}{formatNumberToString(exercise.progressPercent, 1)}%
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Progreso</div>
                  </div>
                </div>

                {/* Título arriba de todo */}
                <h5 className="text-base sm:text-lg font-semibold text-white break-words mb-3 mt-4">
                  {exercise.name}
                </h5>
              </div>

              {/* Gráfico de líneas individual */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-300">Evolución Temporal</span>
                  <span className="text-sm text-gray-400">
                    {exercise.progress > 0 ? '+' : ''}{formatNumberToString(exercise.progress)} kg
                  </span>
                </div>

                {/* Gráfico ApexCharts */}
                <div className="relative h-24 sm:h-32 bg-gray-800/50 rounded-lg p-2">
                  <Chart
                    options={{
                      chart: {
                        type: 'area',
                        height: 80,
                        background: 'transparent',
                        toolbar: { show: false },
                        animations: { enabled: false },
                      },
                      theme: { mode: 'dark' },
                      colors: [exercise.progressPercent > 0 ? '#10b981' : exercise.progressPercent < 0 ? '#ef4444' : '#6b7280'],
                      stroke: {
                        curve: 'smooth',
                        width: 2,
                        dashArray: 5,
                      },
                      fill: {
                        type: 'gradient',
                        gradient: {
                          shade: 'dark',
                          gradientToColors: [exercise.progressPercent > 0 ? '#059669' : exercise.progressPercent < 0 ? '#dc2626' : '#4b5563'],
                          shadeIntensity: 1,
                          type: 'vertical',
                          opacityFrom: 0.4,
                          opacityTo: 0.1,
                          stops: [0, 100],
                        },
                      },
                      grid: {
                        show: true,
                        borderColor: '#374151',
                        strokeDashArray: 2,
                        xaxis: {
                          lines: { show: true },
                        },
                        yaxis: {
                          lines: { show: true },
                        },
                      },
                      xaxis: {
                        categories: progressData.map((_, i) => `${i + 1}`),
                        labels: {
                          show: true,
                          style: {
                            colors: '#9ca3af',
                            fontSize: '8px',
                          },
                        },
                        axisBorder: { show: false },
                        axisTicks: { show: false },
                      },
                      yaxis: {
                        labels: {
                          show: true,
                          style: {
                            colors: '#9ca3af',
                            fontSize: '8px',
                          },
                          formatter: (value: number) => `${formatNumberToString(value)} kg`,
                        },
                        axisBorder: { show: false },
                        axisTicks: { show: false },
                        min: expandedMinWeight,
                        max: expandedMaxWeight,
                      },
                      tooltip: {
                        enabled: true,
                        theme: 'dark',
                        style: {
                          fontSize: '10px',
                        },
                        y: {
                          formatter: (value: number) => `${formatNumberToString(value)} kg`,
                        },
                      },
                      markers: {
                        size: 3,
                        colors: ['#ffffff'],
                        strokeColors: exercise.progressPercent > 0 ? '#10b981' : exercise.progressPercent < 0 ? '#ef4444' : '#6b7280',
                        strokeWidth: 2,
                        hover: {
                          size: 5,
                        },
                      },
                      dataLabels: {
                        enabled: false,
                      },
                    }}
                    series={[{
                      name: 'Peso',
                      data: progressData.map(point => point.weight),
                    }]}
                    type="area"
                    height="100%"
                  />
                </div>
              </div>

              {/* Métricas principales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium text-gray-300">Volumen Total</span>
                    <span className="text-xs sm:text-sm text-blue-400">
                      {formatNumberToString(exercise.totalVolume)} kg
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Promedio: {formatNumberToString(exercise.totalVolume / exercise.frequency)} kg/sesión
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium text-gray-300">Peso Máximo</span>
                    <span className="text-xs sm:text-sm text-purple-400">
                      {formatNumberToString(exercise.maxWeight)} kg
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Evolución: {formatNumberToString(exercise.firstWeight)} → {formatNumberToString(exercise.lastWeight)} kg
                  </div>
                </div>
              </div>

              {/* Métricas detalladas */}
              <div className="space-y-3">
                <h6 className="text-xs sm:text-sm font-medium text-gray-300">Métricas Detalladas:</h6>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Frecuencia:</span>
                    <span className="text-white">{exercise.frequency}/sem</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Intensidad:</span>
                    <span className="text-white">{formatNumberToString(exercise.intensity, 1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">PRs:</span>
                    <span className="text-white">{Math.floor(exercise.progressPercent / 20)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Prioridad:</span>
                    <span className="text-white">{exercise.progressPercent > 20 ? 'high' : exercise.progressPercent > 0 ? 'medium' : 'low'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
