import { Card, CardContent, CardHeader } from '@/components/card';
import { PROGRESS_THRESHOLDS } from '@/constants';
import type { ExerciseAnalysis } from '@/interfaces';
import { formatNumberToString, getCategoryColor, getCategoryIcon } from '@/utils';
import { Calendar, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';

interface ExercisesDetailedAnalysisProps {
  exercises: ExerciseAnalysis[];
  selectedCategory: string;
  categoriesWithCount: Array<{ id: string; name: string; count: number }>;
}

export const ExercisesDetailedAnalysis: React.FC<ExercisesDetailedAnalysisProps> = ({
  exercises,
  selectedCategory,
  categoriesWithCount
}) => {
  const getProgressBadge = (progressPercent: number) => {
    if (progressPercent > PROGRESS_THRESHOLDS.EXCELLENT) return { text: 'Excelente', color: 'bg-green-500 text-white', icon: TrendingUp };
    if (progressPercent > PROGRESS_THRESHOLDS.IMPROVING) return { text: 'Mejorando', color: 'bg-green-500 text-white', icon: TrendingUp };
    if (progressPercent < PROGRESS_THRESHOLDS.DECLINING) return { text: 'Declinando', color: 'bg-red-500 text-white', icon: TrendingDown };
    return { text: 'Estable', color: 'bg-gray-500 text-white', icon: null };
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Análisis Detallado de Ejercicios
          {selectedCategory !== 'all' && (
            <span className="ml-2 text-sm font-normal text-blue-400">
              - {categoriesWithCount.find(cat => cat.id === selectedCategory)?.name}
            </span>
          )}
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({exercises.length} ejercicios)
          </span>
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {exercises.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">
                No hay ejercicios en la categoría "{categoriesWithCount.find(cat => cat.id === selectedCategory)?.name || selectedCategory}"
              </p>
            </div>
          ) : (
            exercises.map((exercise, index) => {
              const primaryCategory = exercise.categories[0] || 'Sin categoría';
              const Icon = getCategoryIcon(primaryCategory);
              const colorGradient = getCategoryColor(primaryCategory);
              const progressBadge = getProgressBadge(exercise.progressPercent);

              return (
                <div
                  key={exercise.name}
                  className={`relative p-4 sm:p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200`}
                >
                  {/* Header con posición, ícono y estado */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-600/20 rounded-lg text-blue-400 font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-br ${colorGradient}`}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-semibold text-white truncate">
                          {exercise.name}
                        </h4>
                        <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${progressBadge.color}`}>
                            {progressBadge.text}
                          </span>
                          {progressBadge.icon && (
                            <progressBadge.icon className={`w-3 h-3 ${exercise.progressPercent < 0 ? 'text-red-400' : 'text-green-400'}`} />
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {exercise.categories.map((category) => {
                            const CategoryIcon = getCategoryIcon(category);
                            const categoryGradient = getCategoryColor(category);

                            return (
                              <span
                                key={category}
                                className={`inline-flex items-center space-x-1 text-xs text-white bg-gradient-to-r ${categoryGradient} px-2 py-1 rounded-full font-medium shadow-sm border border-white/20`}
                              >
                                <CategoryIcon className="w-3 h-3" />
                                <span>{category}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Volumen total */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg sm:text-xl font-bold text-blue-400">
                        {formatNumberToString(exercise.totalVolume)}
                      </div>
                      <div className="text-xs text-gray-400">
                        kg totales
                      </div>
                    </div>
                  </div>

                  {/* Métricas principales */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4">
                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">Peso Máximo</div>
                      <div className="text-sm sm:text-lg font-semibold text-white">
                        {formatNumberToString(exercise.maxWeight)}
                      </div>
                      <div className="text-xs text-gray-500">kg</div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">Peso Promedio</div>
                      <div className="text-sm sm:text-lg font-semibold text-white">
                        {formatNumberToString(exercise.avgWeight)}
                      </div>
                      <div className="text-xs text-gray-500">kg</div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">Progreso 1RM</div>
                      <div className={`text-sm sm:text-lg font-semibold ${exercise.progress > 0 ? 'text-green-400' : exercise.progress < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {exercise.progress > 0 ? '+' : ''}{formatNumberToString(exercise.progress)}
                      </div>
                      <div className="text-xs text-gray-500">kg</div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">Sesiones</div>
                      <div className="text-sm sm:text-lg font-semibold text-white">
                        {exercise.frequency}
                      </div>
                      <div className="text-xs text-gray-500">entrenamientos</div>
                    </div>
                  </div>

                  {/* Barra de progreso y evolución */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span>Evolución: {formatNumberToString(exercise.firstWeight)} kg → {formatNumberToString(exercise.lastWeight)} kg</span>
                      <span className={`font-medium ${exercise.progressPercent > 0 ? 'text-green-400' : exercise.progressPercent < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {exercise.progressPercent > 0 ? '+' : ''}{formatNumberToString(exercise.progressPercent, 1)}%
                      </span>
                    </div>
                    <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`relative h-full bg-gradient-to-r ${exercise.progressPercent > 0 ? 'from-green-500/80 to-green-600/80' : exercise.progressPercent < 0 ? 'from-red-500/80 to-red-600/80' : 'from-gray-500/80 to-gray-600/80'} transition-all duration-300`}
                        style={{ width: `${Math.min(100, Math.max(5, Math.abs(exercise.progressPercent) * 2))}%` }}
                      >
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Progreso basado en 1RM estimado (peso + repeticiones)
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 