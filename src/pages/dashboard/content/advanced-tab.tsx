import { Activity } from 'lucide-react';
import React from 'react';

import { calculateTrainingConsistency, calculateTrainingFrequency } from '@/utils/functions/analysis-helpers.utils';
import { roundToDecimals } from '@/utils/functions/math-utils';
import {
  FatigueVisualChart,
  OptimizationSuggestions,
  PerformanceIndicators,
} from '../components';
import { useAdvancedTab } from '../hooks/use-advanced-tab';
import { EmptyState } from '../shared/empty-state';

import type { WorkoutRecord } from '@/interfaces';

interface AdvancedTabProps {
  records: WorkoutRecord[];
}

export const AdvancedTab: React.FC<AdvancedTabProps> = ({ records }) => {
  const { analysis, enhancedPerformanceIndicators, categorizedSuggestions } = useAdvancedTab(records);

  if (records.length === 0) {
    return <EmptyState icon={Activity} title="No hay datos" description="No hay datos para mostrar" />;
  }

  // Verificar que analysis existe
  if (!analysis) {
    return <EmptyState icon={Activity} title="Error de datos" description="No se pudieron cargar los datos de análisis" />;
  }

  // ✅ UNIFICACIÓN: Usar funciones de cálculo reales en lugar de valores hardcodeados
  const actualFrequency = roundToDecimals(calculateTrainingFrequency(records, 30), 1);
  const consistency = roundToDecimals(calculateTrainingConsistency(records, 30), 1);

  const fatigueMetrics = {
    fatigueIndex: roundToDecimals(analysis.fatigueAnalysis.fatigueIndex, 1),
    recoveryRate: roundToDecimals(analysis.fatigueAnalysis.recoveryRate, 1),
    recoveryScore: roundToDecimals(analysis.fatigueAnalysis.recoveryScore, 1),
    consistency, // ✅ Ahora usa cálculo real
    frequency: actualFrequency, // ✅ Ahora usa cálculo real
    volumeScore: roundToDecimals(enhancedPerformanceIndicators.find(i => i.category === 'volume')?.progress || 0, 1),
    intensityScore: roundToDecimals(enhancedPerformanceIndicators.find(i => i.category === 'intensity')?.progress || 0, 1),
    plateauRisk: roundToDecimals(analysis.progressPrediction.plateauRisk, 1),
    overreachingRisk: analysis.fatigueAnalysis.overreachingRisk, // Mantener como string
  };

  return (
    <div className="space-y-6">
      {/* Gráfico Visual de Análisis de Fatiga */}
      <FatigueVisualChart {...fatigueMetrics} />

      {/* Indicadores de Rendimiento */}
      <PerformanceIndicators indicators={enhancedPerformanceIndicators} />

      {/* Sugerencias de Optimización */}
      <OptimizationSuggestions suggestions={categorizedSuggestions} />
    </div>
  );
};
