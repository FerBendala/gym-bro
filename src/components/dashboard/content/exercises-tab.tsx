import { Calendar, Target, TrendingDown, TrendingUp, Trophy, Zap } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { calculateExerciseProgress, formatNumber, getCategoryColor, getCategoryIcon } from '../../../utils/functions';
import { Button } from '../../button';
import { Card, CardContent, CardHeader } from '../../card';
import { StatCard } from '../../stat-card';
import { InfoTooltip } from '../../tooltip';

/**
 * Props para el componente ExercisesTab
 */
interface ExercisesTabProps {
  records: WorkoutRecord[];
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
 * Tab del dashboard para mostrar análisis por ejercicio
 */
export const ExercisesTab: React.FC<ExercisesTabProps> = ({ records }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const exerciseAnalysis = useMemo(() => {
    if (records.length === 0) return [];

    // Agrupar por ejercicio
    const exerciseGroups = records.reduce((acc, record) => {
      const exerciseName = record.exercise?.name || 'Ejercicio desconocido';
      if (!acc[exerciseName]) {
        acc[exerciseName] = [];
      }
      acc[exerciseName].push(record);
      return acc;
    }, {} as Record<string, WorkoutRecord[]>);

    // Analizar cada ejercicio
    return Object.entries(exerciseGroups).map(([exerciseName, exerciseRecords]) => {
      const totalVolume = exerciseRecords.reduce((sum, record) =>
        sum + (record.weight * record.reps * record.sets), 0
      );

      const maxWeight = Math.max(...exerciseRecords.map(r => r.weight));
      const avgWeight = exerciseRecords.reduce((sum, r) => sum + r.weight, 0) / exerciseRecords.length;

      // **FUNCIÓN UNIFICADA**: Usar la función utilitaria para calcular progreso
      const { absoluteProgress: progress, percentProgress: progressPercent } = calculateExerciseProgress(exerciseRecords);

      const frequency = exerciseRecords.length;
      const categories = exerciseRecords[0].exercise?.categories || ['Sin categoría'];

      return {
        name: exerciseName,
        categories,
        totalVolume,
        maxWeight,
        avgWeight,
        progress,
        progressPercent,
        frequency,
        firstWeight: exerciseRecords[0].weight,
        lastWeight: exerciseRecords[exerciseRecords.length - 1].weight,
        lastDate: new Date(Math.max(...exerciseRecords.map(r => r.date.getTime())))
      };
    }).sort((a, b) => b.totalVolume - a.totalVolume);
  }, [records]);

  // Crear lista de categorías con contador
  const categoriesWithCount = useMemo(() => {
    const categories = [
      { id: 'all', name: 'Todas', count: exerciseAnalysis.length }
    ];

    // Contar ejercicios por categoría (ahora considera múltiples categorías)
    const uniqueCategories = Array.from(new Set(exerciseAnalysis.flatMap(ex => ex.categories)));
    uniqueCategories.forEach(category => {
      const count = exerciseAnalysis.filter(ex => ex.categories.includes(category)).length;
      if (count > 0) {
        categories.push({ id: category, name: category, count });
      }
    });

    return categories;
  }, [exerciseAnalysis]);

  // Filtrar ejercicios por categoría seleccionada (ahora considera múltiples categorías)
  const filteredExercises = useMemo(() => {
    if (selectedCategory === 'all') {
      return exerciseAnalysis;
    }
    return exerciseAnalysis.filter(ex => ex.categories.includes(selectedCategory));
  }, [exerciseAnalysis, selectedCategory]);

  // Mostrar TODOS los ejercicios filtrados
  const allExercises = filteredExercises;

  // Contar registros sin información de ejercicio
  const unknownRecords = records.filter(record =>
    !record.exercise || !record.exercise.name || record.exercise.name === 'Ejercicio desconocido'
  );

  // Calcular métricas globales para StatCards
  const globalMetrics = useMemo(() => {
    const totalVolume = allExercises.reduce((sum, ex) => sum + ex.totalVolume, 0);
    const avgProgress = allExercises.length > 0 ? allExercises.reduce((sum, ex) => sum + ex.progressPercent, 0) / allExercises.length : 0;
    const exercisesImproving = allExercises.filter(ex => ex.progressPercent > 0).length;
    const maxWeightExercise = allExercises.reduce((max, ex) => ex.maxWeight > max.maxWeight ? ex : max, { maxWeight: 0, name: 'N/A' });
    const totalSessions = allExercises.reduce((sum, ex) => sum + ex.frequency, 0);

    return {
      totalVolume,
      avgProgress,
      exercisesImproving,
      maxWeightExercise,
      totalSessions
    };
  }, [allExercises]);

  // Asegurar que siempre haya un filtro aplicado
  // This useEffect is no longer needed as categoriesWithCount is always populated
  // and filteredExercises will always have at least one category if 'all' is not selected.
  // Keeping it for now, but it might become redundant.
  // useEffect(() => {
  //   if (categoriesWithCount.length > 0) {
  //     // Si la categoría seleccionada no existe en las categorías disponibles, seleccionar la primera
  //     const categoryExists = categoriesWithCount.some(cat => cat.id === selectedCategory);
  //     if (!categoryExists) {
  //       setSelectedCategory(categoriesWithCount[0].id);
  //     }
  //   }
  // }, [categoriesWithCount, selectedCategory]);

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Target className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Sin datos para análisis de ejercicios
        </h3>
        <p className="text-gray-500">
          Registra entrenamientos para ver análisis detallado por ejercicio
        </p>
      </div>
    );
  }

  if (exerciseAnalysis.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Target className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          No se encontró información de ejercicios
        </h3>
        <p className="text-gray-500 mb-4">
          Los registros de entrenamientos no tienen información de ejercicios asociada
        </p>
        {unknownRecords.length > 0 && (
          <div className="p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg text-sm">
            <p className="text-yellow-300">
              Se encontraron {unknownRecords.length} registros sin información de ejercicio.
              Verifica que los ejercicios estén correctamente configurados.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Advertencia sobre registros sin información */}
      {unknownRecords.length > 0 && (
        <div className="p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <p className="text-sm text-yellow-300">
              <strong>{unknownRecords.length}</strong> registros no se incluyen en el análisis por falta de información de ejercicio.
            </p>
          </div>
        </div>
      )}

      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Volumen Total"
          value={formatNumber(globalMetrics.totalVolume)}
          icon={Zap}
          variant="success"
          tooltip="Volumen total de todos los ejercicios en la categoría seleccionada."
          tooltipPosition="top"
        />

        <StatCard
          title="Ejercicios Analizados"
          value={allExercises.length.toString()}
          icon={Target}
          variant="indigo"
          tooltip="Número total de ejercicios únicos en la categoría seleccionada."
          tooltipPosition="top"
        />

        <StatCard
          title="Mejorando"
          value={`${globalMetrics.exercisesImproving}/${allExercises.length}`}
          icon={TrendingUp}
          variant={globalMetrics.exercisesImproving > allExercises.length / 2 ? 'success' : 'warning'}
          tooltip="Número de ejercicios que muestran progreso positivo en 1RM estimado."
          tooltipPosition="top"
        />

        <StatCard
          title="Progreso Promedio"
          value={`${globalMetrics.avgProgress > 0 ? '+' : ''}${formatNumber(safeNumber(globalMetrics.avgProgress, 0), 1)}%`}
          icon={Calendar}
          variant={globalMetrics.avgProgress > 0 ? 'success' : globalMetrics.avgProgress < 0 ? 'danger' : 'warning'}
          tooltip="Progreso promedio de todos los ejercicios basado en 1RM estimado."
          tooltipPosition="top"
        />

        <StatCard
          title="Sesiones Totales"
          value={globalMetrics.totalSessions.toString()}
          icon={Trophy}
          variant="purple"
          tooltip="Número total de sesiones de entrenamiento sumando todos los ejercicios."
          tooltipPosition="top"
        />
      </div>

      {/* Filtros por categorías */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Filtrar por Categoría
            <InfoTooltip
              content="Filtra los ejercicios por categoría muscular. Los ejercicios con múltiples categorías aparecen en todos los filtros relevantes."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categoriesWithCount.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-2"
              >
                <span>{category.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedCategory === category.id
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-600/50 text-gray-300'
                  }`}>
                  {category.count}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análisis detallado de ejercicios */}
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
              ({allExercises.length} ejercicios)
            </span>
            <InfoTooltip
              content="Análisis completo de rendimiento por ejercicio incluyendo progreso, volumen, frecuencia y métricas de fuerza."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allExercises.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">
                  No hay ejercicios en la categoría "{categoriesWithCount.find(cat => cat.id === selectedCategory)?.name || selectedCategory}"
                </p>
              </div>
            ) : (
              allExercises.map((exercise, index) => {
                const primaryCategory = exercise.categories[0] || 'Sin categoría';
                const Icon = getCategoryIcon(primaryCategory);
                const colorGradient = getCategoryColor(primaryCategory);

                const getProgressBadge = () => {
                  if (exercise.progressPercent > 5) return { text: 'Excelente', color: 'bg-green-500 text-white', icon: TrendingUp };
                  if (exercise.progressPercent > 0) return { text: 'Mejorando', color: 'bg-green-500 text-white', icon: TrendingUp };
                  if (exercise.progressPercent < -5) return { text: 'Declinando', color: 'bg-red-500 text-white', icon: TrendingDown };
                  return { text: 'Estable', color: 'bg-gray-500 text-white', icon: null };
                };

                const progressBadge = getProgressBadge();

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
                          {formatNumber(exercise.totalVolume)}
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
                          {formatNumber(exercise.maxWeight)}
                        </div>
                        <div className="text-xs text-gray-500">kg</div>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-xs text-gray-400 mb-1">Peso Promedio</div>
                        <div className="text-sm sm:text-lg font-semibold text-white">
                          {formatNumber(exercise.avgWeight)}
                        </div>
                        <div className="text-xs text-gray-500">kg</div>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-xs text-gray-400 mb-1">Progreso 1RM</div>
                        <div className={`text-sm sm:text-lg font-semibold ${exercise.progress > 0 ? 'text-green-400' : exercise.progress < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                          {exercise.progress > 0 ? '+' : ''}{formatNumber(exercise.progress)}
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
                        <span>Evolución: {formatNumber(exercise.firstWeight)} kg → {formatNumber(exercise.lastWeight)} kg</span>
                        <span className={`font-medium ${exercise.progressPercent > 0 ? 'text-green-400' : exercise.progressPercent < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                          {exercise.progressPercent > 0 ? '+' : ''}{formatNumber(safeNumber(exercise.progressPercent, 0), 1)}%
                        </span>
                      </div>
                      <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`relative h-full bg-gradient-to-r ${exercise.progressPercent > 0 ? 'from-green-500/80 to-green-600/80' : exercise.progressPercent < 0 ? 'from-red-500/80 to-red-600/80' : 'from-gray-500/80 to-gray-600/80'} transition-all duration-300`}
                          style={{ width: `${Math.min(100, Math.max(5, Math.abs(safeNumber(exercise.progressPercent, 0)) * 2))}%` }}
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
    </div>
  );
}; 