import type { WorkoutRecord } from '@/interfaces';
import React from 'react';
import {
  AdvancedEmptyState,
  AdvancedMetrics,
  FatigueAnalysis,
  OptimizationSuggestions,
  PerformanceIndicators
} from '../components';
import { useAdvancedTab } from '../hooks/use-advanced-tab';

interface AdvancedTabProps {
  records: WorkoutRecord[];
}

export const AdvancedTab: React.FC<AdvancedTabProps> = ({ records }) => {
  const { analysis, enhancedPerformanceIndicators, categorizedSuggestions } = useAdvancedTab(records);

  if (records.length === 0) {
    return <AdvancedEmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <AdvancedMetrics analysis={analysis} />

      {/* Análisis de Fatiga */}
      <FatigueAnalysis analysis={analysis} />

      {/* Indicadores de Rendimiento */}
      <PerformanceIndicators indicators={enhancedPerformanceIndicators} />

      {/* Sugerencias de Optimización */}
      <OptimizationSuggestions suggestions={categorizedSuggestions} />
    </div>
  );
};