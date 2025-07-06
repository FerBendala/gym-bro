import { Target, TrendingUp } from 'lucide-react';
import React, { useMemo } from 'react';
import { formatNumber } from '../../utils/functions';
import { Card, CardContent, CardHeader } from '../card';
import { InfoTooltip } from '../tooltip';
import type { ExerciseAnalyticsProps } from './types';

/**
 * Componente de analytics por ejercicio
 */
export const ExerciseAnalytics: React.FC<ExerciseAnalyticsProps> = ({ records }) => {
  const exerciseAnalysis = useMemo(() => {
    if (records.length === 0) return [];

    // Filtrar registros que tienen información de ejercicio válida
    const validRecords = records.filter(record =>
      record.exercise && record.exercise.name && record.exercise.name !== 'Ejercicio desconocido'
    );

    if (validRecords.length === 0) return [];

    // Agrupar por ejercicio
    const exerciseGroups = validRecords.reduce((acc, record) => {
      const exerciseName = record.exercise!.name;
      if (!acc[exerciseName]) {
        acc[exerciseName] = [];
      }
      acc[exerciseName].push(record);
      return acc;
    }, {} as Record<string, typeof validRecords>);

    // Analizar cada ejercicio
    return Object.entries(exerciseGroups).map(([exerciseName, exerciseRecords]) => {
      const sortedRecords = [...exerciseRecords].sort((a, b) => a.date.getTime() - b.date.getTime());

      const totalVolume = exerciseRecords.reduce((sum, record) =>
        sum + (record.weight * record.reps * record.sets), 0
      );

      const maxWeight = Math.max(...exerciseRecords.map(r => r.weight));
      const avgWeight = exerciseRecords.reduce((sum, r) => sum + r.weight, 0) / exerciseRecords.length;

      const firstRecord = sortedRecords[0];
      const lastRecord = sortedRecords[sortedRecords.length - 1];
      const progress = lastRecord.weight - firstRecord.weight;
      const progressPercent = firstRecord.weight > 0 ? (progress / firstRecord.weight) * 100 : 0;

      const frequency = exerciseRecords.length;
      const category = exerciseRecords[0].exercise?.categories?.[0] || 'Sin categoría';

      return {
        name: exerciseName,
        category,
        totalVolume,
        maxWeight,
        avgWeight,
        progress,
        progressPercent,
        frequency,
        firstWeight: firstRecord.weight,
        lastWeight: lastRecord.weight,
        lastDate: lastRecord.date
      };
    }).sort((a, b) => b.totalVolume - a.totalVolume);
  }, [records]);

  // Mostrar TODOS los ejercicios, no solo 8
  const allExercises = exerciseAnalysis;

  // Contar registros sin información de ejercicio
  const unknownRecords = records.filter(record =>
    !record.exercise || !record.exercise.name || record.exercise.name === 'Ejercicio desconocido'
  );

  if (records.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Análisis por Ejercicio ({allExercises.length} ejercicios)
            <InfoTooltip
              content="Rendimiento detallado de cada ejercicio incluyendo progreso, volumen y frecuencia."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allExercises.map((exercise, index) => (
              <div key={exercise.name} className="p-4 bg-gray-800/30 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-600/20 rounded-lg text-blue-400 font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{exercise.name}</h4>
                        <p className="text-sm text-gray-400">{exercise.category}</p>
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
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumen de categorías */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Resumen por Categorías
            <InfoTooltip
              content="Distribución del volumen de entrenamiento entre diferentes grupos musculares."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(
              exerciseAnalysis.reduce((acc, exercise) => {
                if (!acc[exercise.category]) {
                  acc[exercise.category] = { volume: 0, exercises: 0 };
                }
                acc[exercise.category].volume += exercise.totalVolume;
                acc[exercise.category].exercises += 1;
                return acc;
              }, {} as Record<string, { volume: number; exercises: number }>)
            )
              .sort(([, a], [, b]) => b.volume - a.volume)
              .map(([category, data]) => {
                const totalVolume = exerciseAnalysis.reduce((sum, ex) => sum + ex.totalVolume, 0);
                const percentage = totalVolume > 0 ? (data.volume / totalVolume) * 100 : 0;

                return (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{category}</h4>
                      <p className="text-sm text-gray-400">
                        {data.exercises} ejercicio{data.exercises !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-400">
                        {formatNumber(data.volume)} kg
                      </p>
                      <p className="text-xs text-gray-400">{percentage.toFixed(1)}%</p>
                    </div>
                    <div className="w-24 ml-4">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 