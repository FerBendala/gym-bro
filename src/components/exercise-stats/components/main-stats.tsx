import { Target, TrendingUp, Zap } from 'lucide-react';
import React from 'react';
import { formatNumber } from '../../../utils/functions';
import { StatCard } from '../../stat-card';
import type { MainStatsProps, StatConfig } from '../types';

/**
 * Estadísticas principales del ExerciseStats
 * Muestra las 4 métricas más importantes usando StatCard genérico
 */
export const MainStats: React.FC<MainStatsProps> = ({ stats }) => {
  const statConfigs: StatConfig[] = [
    {
      id: 'totalWorkouts',
      title: 'Total Entrenamientos',
      value: stats.totalWorkouts.toString(),
      icon: Target,
      variant: 'primary'
    },
    {
      id: 'totalVolume',
      title: 'Volumen Total',
      value: `${formatNumber(stats.totalVolume)} kg`,
      icon: TrendingUp,
      variant: 'success'
    },
    {
      id: 'averageWeight',
      title: 'Peso Promedio',
      value: `${formatNumber(stats.averageWeight)} kg`,
      icon: Zap,
      variant: 'warning'
    },
    {
      id: 'maxWeight',
      title: 'Peso Máximo',
      value: `${formatNumber(stats.maxWeight)} kg`,
      icon: TrendingUp,
      variant: 'danger'
    }
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
        />
      ))}
    </div>
  );
}; 