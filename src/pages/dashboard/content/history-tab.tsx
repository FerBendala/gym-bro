import type { WorkoutRecord } from '@/interfaces';
import React from 'react';
import {
  HistoryEmptyState,
  HistoryEvolutionChart,
  HistoryMetrics,
  HistoryWeeklyDetails
} from '../components';
import { useHistoryData } from '../hooks/use-history-data';

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
    return <HistoryEmptyState />;
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

      {/* Datos semanales detallados */}
      <HistoryWeeklyDetails historyData={historyData} />
    </div>
  );
}; 