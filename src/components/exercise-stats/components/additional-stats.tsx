import { StatCard } from '@/components/stat-card';
import { getDaysAgo } from '@/utils';
import { Calendar, Target } from 'lucide-react';
import React from 'react';
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
        variant="primary"
        tooltip="Número total de días únicos en los que has entrenado este ejercicio"
        tooltipPosition="top"
      />

      <StatCard
        title="Último Entrenamiento"
        value={getDaysAgo(stats.lastWorkout) || 'N/A'}
        icon={Calendar}
        variant="secondary"
        tooltip="Tiempo transcurrido desde la última vez que entrenaste este ejercicio"
        tooltipPosition="top"
      />

      <StatCard
        title="Ejercicio Favorito"
        value={stats.mostFrequentExercise || 'N/A'}
        icon={Target}
        variant="warning"
        tooltip="Ejercicio que has realizado con mayor frecuencia en tus entrenamientos"
        tooltipPosition="top"
      />
    </div>
  );
}; 