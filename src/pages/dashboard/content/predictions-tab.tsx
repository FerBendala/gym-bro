import type { WorkoutRecord } from '@/interfaces';
import { Brain } from 'lucide-react';
import React from 'react';
import { TrendAnalysisSection } from '../components';
import { PredictionsHeader } from '../components/predictions-header';
import { usePredictionsData } from '../hooks/use-predictions-data';

interface PredictionsTabProps {
  records: WorkoutRecord[];
}

export const PredictionsTab: React.FC<PredictionsTabProps> = ({ records }) => {
  const { analysis, centralizedMetrics, predictionMetrics, confidenceInfo } = usePredictionsData(records);

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Brain className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Sin datos para predicciones
        </h3>
        <p className="text-gray-500">
          Registra al menos 10 entrenamientos para obtener predicciones con inteligencia artificial
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicadores predictivos principales */}
      <PredictionsHeader
        centralizedMetrics={centralizedMetrics}
        predictionMetrics={predictionMetrics}
        confidenceInfo={confidenceInfo}
      />

      {/* Análisis de Tendencia IA */}
      <TrendAnalysisSection
        centralizedMetrics={centralizedMetrics}
        predictionMetrics={predictionMetrics}
        analysis={analysis}
      />
    </div>
  );
}; 