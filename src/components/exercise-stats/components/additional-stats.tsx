import { Calendar, Target } from 'lucide-react';
import React from 'react';
import { getDaysAgo } from '../../../utils/functions';
import { StatCard } from '../../stat-card';
import type { AdditionalStatsProps } from '../types';

/**
 * Estadísticas adicionales del ExerciseStats
 * Muestra información complementaria como días entrenados, último entrenamiento y ejercicio favorito
 * Incluye tooltips explicativos para cada métrica
 */
export const AdditionalStats: React.FC<AdditionalStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <StatCard
        title="Días Entrenados"
        value={stats.workoutDays.toString()}
        icon={Calendar}
        variant="purple"
        tooltip="Número total de días únicos en los que has entrenado este ejercicio"
        tooltipPosition="top"
      />

      <StatCard
        title="Último Entrenamiento"
        value={getDaysAgo(stats.lastWorkout) || 'N/A'}
        icon={Calendar}
        variant="indigo"
        tooltip="Tiempo transcurrido desde la última vez que entrenaste este ejercicio"
        tooltipPosition="top"
      />

      <StatCard
        title="Ejercicio Favorito"
        value={stats.mostFrequentExercise || 'N/A'}
        icon={Target}
        variant="pink"
        tooltip="Ejercicio que has realizado con mayor frecuencia en tus entrenamientos"
        tooltipPosition="top"
      />
    </div>
  );
}; 