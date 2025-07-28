import { StatCard } from '@/components/stat-card';
import { formatNumberToString } from '@/utils';
import { Calendar, Target, TrendingUp, Trophy, Zap } from 'lucide-react';
import React from 'react';

interface ExercisesMetricsProps {
  globalMetrics: {
    totalVolume: number;
    avgProgress: number;
    exercisesImproving: number;
    totalSessions: number;
  };
  allExercisesCount: number;
}

export const ExercisesMetrics: React.FC<ExercisesMetricsProps> = ({
  globalMetrics,
  allExercisesCount
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <StatCard
        title="Volumen Total"
        value={formatNumberToString(globalMetrics.totalVolume)}
        icon={Zap}
        variant="success"
        tooltip="Volumen total de todos los ejercicios en la categoría seleccionada."
        tooltipPosition="top"
      />

      <StatCard
        title="Ejercicios Analizados"
        value={allExercisesCount.toString()}
        icon={Target}
        variant="primary"
        tooltip="Número total de ejercicios únicos en la categoría seleccionada."
        tooltipPosition="top"
      />

      <StatCard
        title="Mejorando"
        value={`${globalMetrics.exercisesImproving}/${allExercisesCount}`}
        icon={TrendingUp}
        variant={globalMetrics.exercisesImproving > allExercisesCount / 2 ? 'success' : 'warning'}
        tooltip="Número de ejercicios que muestran progreso positivo en 1RM estimado."
        tooltipPosition="top"
      />

      <StatCard
        title="Progreso Promedio"
        value={`${globalMetrics.avgProgress > 0 ? '+' : ''}${formatNumberToString(globalMetrics.avgProgress, 1)}%`}
        icon={Calendar}
        variant={globalMetrics.avgProgress > 0 ? 'success' : globalMetrics.avgProgress < 0 ? 'danger' : 'warning'}
        tooltip="Progreso promedio de todos los ejercicios basado en 1RM estimado."
        tooltipPosition="top"
      />

      <StatCard
        title="Sesiones Totales"
        value={globalMetrics.totalSessions.toString()}
        icon={Trophy}
        variant="secondary"
        tooltip="Número total de sesiones de entrenamiento sumando todos los ejercicios."
        tooltipPosition="top"
      />
    </div>
  );
}; 