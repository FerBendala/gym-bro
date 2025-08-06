import { Target, TrendingUp, Zap } from 'lucide-react';
import React from 'react';

import type { MainStatsProps, StatConfig } from '../types';

import { StatCard } from '@/components/stat-card';
import { formatNumberToString } from '@/utils';

/**
 * Estadísticas principales del ExerciseStats
 * Muestra las 4 métricas más importantes usando StatCard genérico
 * Incluye tooltips explicativos para cada métrica
 */
export const MainStats: React.FC<MainStatsProps> = ({ stats }) => {
  const statConfigs: StatConfig[] = [
    {
      id: 'totalWorkouts',
      title: 'Total Entrenamientos',
      value: stats.totalWorkouts.toString(),
      icon: Target,
      variant: 'primary',
      tooltip: 'Número total de sesiones de entrenamiento registradas para este ejercicio',
    },
    {
      id: 'totalVolume',
      title: 'Volumen Total',
      value: `${formatNumberToString(stats.totalVolume)} kg`,
      icon: TrendingUp,
      variant: 'success',
      tooltip: 'Suma total de peso levantado (peso × repeticiones × series) a lo largo de todos los entrenamientos',
    },
    {
      id: 'averageWeight',
      title: 'Peso Promedio',
      value: `${formatNumberToString(stats.averageWeight)} kg`,
      icon: Zap,
      variant: 'warning',
      tooltip: 'Peso promedio utilizado en todas las series de este ejercicio',
    },
    {
      id: 'maxWeight',
      title: 'Peso Máximo',
      value: `${formatNumberToString(stats.maxWeight)} kg`,
      icon: TrendingUp,
      variant: 'danger',
      tooltip: 'Peso máximo levantado en una sola serie para este ejercicio',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfigs.map((config) => (
        <StatCard
          key={config.id}
          title={config.title}
          value={config.value}
          icon={config.icon}
          variant={config.variant}
          tooltip={config.tooltip}
          tooltipPosition="top"
        />
      ))}
    </div>
  );
};
