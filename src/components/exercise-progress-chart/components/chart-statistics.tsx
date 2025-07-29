import { TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';

import type { ChartStatisticsProps } from '../types';

import { InfoTooltip } from '@/components/tooltip';

/**
 * Componente que muestra estadísticas adicionales del gráfico de progreso
 */
export const ChartStatistics: React.FC<ChartStatisticsProps> = ({
  statistics,
}) => {
  const {
    totalExercises,
    totalSessions,
    averageWeightIncrease,
    bestProgress,
    consistencyScore,
    timeRange,
  } = statistics;

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Ejercicios Únicos */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-blue-400">{totalExercises}</p>
            <p className="text-sm text-gray-400">Ejercicios únicos</p>
          </div>
          <InfoTooltip
            content="Número total de ejercicios diferentes que has registrado en el período mostrado."
            position="left"
          />
        </div>
      </div>

      {/* Sesiones Totales */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-green-400">{totalSessions}</p>
            <p className="text-sm text-gray-400">Sesiones totales</p>
          </div>
          <InfoTooltip
            content="Número total de entrenamientos registrados en el período mostrado."
            position="left"
          />
        </div>
      </div>

      {/* Progreso Promedio */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-purple-400">
                {averageWeightIncrease > 0 ? '+' : ''}{averageWeightIncrease.toFixed(1)}kg
              </p>
              {averageWeightIncrease > 0 ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <p className="text-sm text-gray-400">Progreso promedio</p>
          </div>
          <InfoTooltip
            content="Incremento promedio de fuerza estimada (1RM) por ejercicio, considerando peso y repeticiones."
            position="left"
          />
        </div>
      </div>

      {/* Mejor Progreso */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-yellow-400">
              +{bestProgress.improvement.toFixed(1)}kg
            </p>
            <p className="text-sm text-gray-400 truncate">
              {bestProgress.exercise}
            </p>
          </div>
          <InfoTooltip
            content={`Tu mejor progreso es en ${bestProgress.exercise} con un incremento de ${bestProgress.improvement.toFixed(1)}kg de fuerza estimada (1RM).`}
            position="left"
          />
        </div>
      </div>

      {/* Consistencia */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-teal-400">{consistencyScore}%</p>
            <p className="text-sm text-gray-400">Consistencia</p>
          </div>
          <InfoTooltip
            content="Porcentaje de ejercicios que muestran progreso positivo en el período analizado."
            position="left"
          />
        </div>
      </div>

      {/* Período de Tiempo */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-indigo-400">{timeRange}</p>
            <p className="text-sm text-gray-400">Período analizado</p>
          </div>
          <InfoTooltip
            content="Rango de tiempo cubierto por los datos mostrados en el gráfico."
            position="left"
          />
        </div>
      </div>
    </div>
  );
};
