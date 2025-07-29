import { Calendar, Clock, TrendingDown, TrendingUp, Trophy, Zap } from 'lucide-react';
import React from 'react';

import { StatCard } from '@/components/stat-card';
import { formatNumberToString } from '@/utils';

interface HistoryMetricsProps {
  historyData: {
    value: number;
    totalWorkouts: number;
  }[];
  totalGrowthPercent: number;
}

export const HistoryMetrics: React.FC<HistoryMetricsProps> = ({
  historyData,
  totalGrowthPercent,
}) => {
  const maxValue = historyData.length > 0 ? Math.max(...historyData.map(point => point.value)) : 0;
  const avgValue = historyData.length > 0 ? historyData.reduce((sum, p) => sum + p.value, 0) / historyData.length : 0;
  const avgWorkoutsPerWeek = historyData.length > 0 ? historyData.reduce((sum, p) => sum + p.totalWorkouts, 0) / historyData.length : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <StatCard
        title="Semanas Registradas"
        value={historyData.length.toString()}
        icon={Calendar}
        variant="primary"
        tooltip="Número total de semanas con entrenamientos registrados."
        tooltipPosition="top"
      />

      <StatCard
        title="Mejor Semana"
        value={`${formatNumberToString(maxValue)} kg`}
        icon={Trophy}
        variant="success"
        tooltip="Semana con mayor volumen total de entrenamiento."
        tooltipPosition="top"
      />

      <StatCard
        title="Promedio Semanal"
        value={`${formatNumberToString(avgValue)} kg`}
        icon={Zap}
        variant="warning"
        tooltip="Volumen promedio por semana durante todo el período."
        tooltipPosition="top"
      />

      <StatCard
        title="Crecimiento Total"
        value={`${totalGrowthPercent >= 0 ? '+' : ''}${formatNumberToString(totalGrowthPercent, 1)}%`}
        icon={totalGrowthPercent >= 0 ? TrendingUp : TrendingDown}
        variant={totalGrowthPercent >= 10 ? 'success' : totalGrowthPercent >= 0 ? 'warning' : 'danger'}
        tooltip="Cambio porcentual en volumen promedio por sesión comparando las primeras semanas con las últimas semanas (más estable que primera vs última)."
        tooltipPosition="top"
      />

      <StatCard
        title="Duración Promedio"
        value={`${Math.round(avgWorkoutsPerWeek)} ent/sem`}
        icon={Clock}
        variant="secondary"
        tooltip="Número promedio de entrenamientos por semana."
        tooltipPosition="top"
      />
    </div>
  );
};
