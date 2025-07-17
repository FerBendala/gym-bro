import { TrendingUp, Zap } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import type { WorkoutRecord } from '../../interfaces';
import { calculateExerciseProgress, formatNumber } from '../../utils/functions';
import { Button } from '../button';
import { Card, CardContent, CardHeader } from '../card';
import { InfoTooltip } from '../tooltip';

export interface ExerciseAnalyticsProps {
  records: WorkoutRecord[];
}

/**
 * Componente de analytics por ejercicio
 */
export const ExerciseAnalytics: React.FC<ExerciseAnalyticsProps> = ({ records }) => {
  // Estado para manejar la categoría seleccionada
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
      const { absoluteProgress: progress, percentProgress: progressPercent, first1RM, last1RM } = calculateExerciseProgress(exerciseRecords);

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
        firstWeight: first1RM,
        lastWeight: last1RM,
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
    // Assuming EXERCISE_CATEGORIES is defined elsewhere or removed if not needed
    // For now, we'll just count based on the exerciseAnalysis categories
    const uniqueCategories = Array.from(new Set(exerciseAnalysis.flatMap(ex => ex.categories)));
    uniqueCategories.forEach(category => {
      const count = exerciseAnalysis.filter(ex => ex.categories.includes(category)).length;
      if (count > 0) {
        categories.push({ id: category, name: category, count });
      }
    });

    // Añadir categoría "Sin categoría" si existen ejercicios sin categoría
    const uncategorizedCount = exerciseAnalysis.filter(ex => ex.categories.includes('Sin categoría')).length;
    if (uncategorizedCount > 0) {
      categories.push({ id: 'Sin categoría', name: 'Sin categoría', count: uncategorizedCount });
    }

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

  // Asegurar que siempre haya un filtro aplicado
  // This effect is no longer needed as selectedCategory is not a state variable
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
      <Card>
        <CardContent>
          <div className="text-center py-12">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Sin datos de ejercicios
            </h3>
            <p className="text-gray-500">
              Registra entrenamientos para ver análisis por ejercicio
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (exerciseAnalysis.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-12">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
        </CardContent>
      </Card>
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

      {/* Filtros por categorías */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Zap className="w-5 h-5 mr-2" />
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

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Análisis por Ejercicio
            {selectedCategory !== 'all' && (
              <span className="ml-2 text-sm font-normal text-blue-400">
                - {categoriesWithCount.find(cat => cat.id === selectedCategory)?.name}
              </span>
            )}
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({allExercises.length} ejercicios)
            </span>
            <InfoTooltip
              content="Rendimiento detallado de cada ejercicio incluyendo progreso, volumen y frecuencia."
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
              allExercises.map((exercise, index) => (
                <div key={exercise.name} className="p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-600/20 rounded-lg text-blue-400 font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{exercise.name}</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {exercise.categories.map((category) => (
                              <span
                                key={category}
                                className={`text-xs px-2 py-1 rounded-full font-medium border ${selectedCategory === category
                                  ? 'text-blue-200 bg-blue-500/25 border-blue-400/50'
                                  : 'text-gray-300 bg-gray-600/30 border-gray-500/30'
                                  }`}
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-400">
                        {formatNumber(exercise.totalVolume)} kg
                      </p>
                      <p className="text-xs text-gray-400">Volumen total</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">
                        {formatNumber(exercise.maxWeight)} kg
                      </p>
                      <p className="text-xs text-gray-400">Peso máximo</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-bold text-white">
                        {formatNumber(exercise.avgWeight)} kg
                      </p>
                      <p className="text-xs text-gray-400">Peso promedio</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <p className={`text-sm font-bold ${exercise.progress > 0 ? 'text-green-400' :
                          exercise.progress < 0 ? 'text-red-400' : 'text-gray-400'
                          }`}>
                          {exercise.progress > 0 ? '+' : ''}{formatNumber(exercise.progress)} kg
                        </p>
                        {exercise.progress !== 0 && (
                          <TrendingUp className={`w-3 h-3 ${exercise.progress > 0 ? 'text-green-400' : 'text-red-400 rotate-180'
                            }`} />
                        )}
                      </div>
                      <p className="text-xs text-gray-400">Progreso</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-bold text-white">
                        {exercise.frequency}
                      </p>
                      <p className="text-xs text-gray-400">Sesiones</p>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Evolución: {formatNumber(exercise.firstWeight)} kg → {formatNumber(exercise.lastWeight)} kg</span>
                      <span className={exercise.progressPercent > 0 ? 'text-green-400' : exercise.progressPercent < 0 ? 'text-red-400' : 'text-gray-400'}>
                        {exercise.progressPercent > 0 ? '+' : ''}{exercise.progressPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      Progreso considera peso y repeticiones
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${exercise.progressPercent > 0 ? 'bg-green-600' :
                          exercise.progressPercent < 0 ? 'bg-red-600' : 'bg-gray-600'
                          }`}
                        style={{
                          width: `${Math.min(100, Math.abs(exercise.progressPercent) * 2)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 