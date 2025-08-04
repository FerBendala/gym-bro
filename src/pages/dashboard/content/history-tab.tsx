import { Activity } from 'lucide-react';
import React from 'react';

import {
  HistoryEvolutionChart,
  HistoryMetrics,
} from '../components';
import { useHistoryData } from '../hooks/use-history-data';
import { EmptyState } from '../shared/empty-state';

import type { WorkoutRecord } from '@/interfaces';

/**
 * Props para el componente HistoryTab
 */
interface HistoryTabProps {
  records: WorkoutRecord[];
}

/**
 * Tab del dashboard para mostrar el historial de entrenamientos con evolución temporal
 */
export const HistoryTab: React.FC<HistoryTabProps> = ({ records }) => {
  const { historyData, totalGrowthPercent } = useHistoryData(records);

  if (records.length === 0) {
    return <EmptyState icon={Activity} title="No hay datos" description="No hay datos para mostrar" />;
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales del historial */}
      <HistoryMetrics
        historyData={historyData}
        totalGrowthPercent={totalGrowthPercent}
      />

      {/* Gráfico de evolución temporal */}
      <HistoryEvolutionChart historyData={historyData} />

    </div>
  );
};
