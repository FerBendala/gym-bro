import React from 'react';

import {
  ConsistencyAnalysis,
  EmptyState,
  GeneralProgress,
  Header,
  MainMetrics,
  QualityMetrics,
  RepRangeAnalysis,
  TrainingRecommendations,
} from './components';
import { useStrengthProgress } from './hooks';
import type { StrengthProgressProps } from './types';

/**
 * Componente especializado para análisis avanzado de progreso de fuerza
 */
export const StrengthProgress: React.FC<StrengthProgressProps> = ({ records }) => {
  const analysis = useStrengthProgress(records);

  if (!analysis) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <Header />
      <MainMetrics analysis={analysis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GeneralProgress analysis={analysis} />
      </div>

      <ConsistencyAnalysis analysis={analysis} />
      <TrainingRecommendations analysis={analysis} />
      <RepRangeAnalysis analysis={analysis} />
      <QualityMetrics analysis={analysis} />
    </div>
  );
};
