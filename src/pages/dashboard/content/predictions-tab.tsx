import type { WorkoutRecord } from '@/interfaces';
import { Brain } from 'lucide-react';
import React from 'react';
import {
  ConfidenceGauge,
  DataQualityRadial,
  FactorsChart,
  PRProgressChart,
  PerformanceIndicators,
  PredictionTimeline,
  TrendAnalysisSection
} from '../components';
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

      {/* Gráficos de predicción */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progreso hacia PR */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Progreso hacia PR</h3>
          <PRProgressChart
            currentWeight={centralizedMetrics.currentWeight}
            predictedPR={centralizedMetrics.prWeight}
            baseline1RM={predictionMetrics.baseline1RM}
            confidence={centralizedMetrics.prConfidence}
            timeToNextPR={centralizedMetrics.timeToNextPR}
            improvement={centralizedMetrics.improvement}
          />
        </div>

        {/* Línea de tiempo de predicciones */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Línea de Tiempo</h3>
          <PredictionTimeline
            currentWeight={centralizedMetrics.currentWeight}
            nextWeekWeight={centralizedMetrics.nextWeekWeight}
            predictedPR={centralizedMetrics.prWeight}
            monthlyGrowthRate={centralizedMetrics.monthlyGrowth}
            strengthTrend={centralizedMetrics.strengthTrend}
          />
        </div>
      </div>

      {/* Indicadores de confianza y calidad de datos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gauge de confianza */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Confianza IA</h3>
          <ConfidenceGauge
            confidence={centralizedMetrics.confidenceLevel}
            level={confidenceInfo.level}
            color={confidenceInfo.color}
          />
        </div>

        {/* Calidad de datos */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Calidad de Datos</h3>
          <DataQualityRadial
            qualityScore={predictionMetrics.dataQuality.qualityScore}
            validationRate={predictionMetrics.dataQuality.validationRate}
            hasRecentData={predictionMetrics.dataQuality.hasRecentData}
            dataSpan={predictionMetrics.dataQuality.dataSpan}
          />
        </div>
      </div>

      {/* Factores de predicción */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Factores de Predicción</h3>
        <FactorsChart
          factors={[
            {
              name: 'Tendencia Fuerza',
              value: centralizedMetrics.strengthTrend > 0 ? centralizedMetrics.strengthTrend : 0,
              status: centralizedMetrics.strengthTrend > 0.5 ? 'good' : centralizedMetrics.strengthTrend > 0 ? 'warning' : 'bad'
            },
            {
              name: 'Tendencia Volumen',
              value: centralizedMetrics.volumeTrend > 0 ? centralizedMetrics.volumeTrend : 0,
              status: centralizedMetrics.volumeTrend > 5 ? 'good' : centralizedMetrics.volumeTrend > 0 ? 'warning' : 'bad'
            },
            {
              name: 'Riesgo Meseta',
              value: 100 - centralizedMetrics.plateauRisk,
              status: centralizedMetrics.plateauRisk < 30 ? 'good' : centralizedMetrics.plateauRisk < 60 ? 'warning' : 'bad'
            },
            {
              name: 'Confianza IA',
              value: centralizedMetrics.confidenceLevel,
              status: centralizedMetrics.confidenceLevel >= 70 ? 'good' : centralizedMetrics.confidenceLevel >= 40 ? 'warning' : 'bad'
            }
          ]}
        />
      </div>

      {/* Indicadores de rendimiento */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Indicadores de Rendimiento</h3>
        <PerformanceIndicators indicators={analysis.peakPerformanceIndicators} />
      </div>

      {/* Sugerencias de optimización */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Sugerencias de Optimización</h3>
        <div className="space-y-3">
          {analysis.optimizationSuggestions.length > 0 ? (
            analysis.optimizationSuggestions.map((suggestion, index) => (
              <div key={index} className="p-3 bg-gray-800 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm text-gray-300">{suggestion}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">
              Tu entrenamiento está bien optimizado - mantén la consistencia
            </p>
          )}
        </div>
      </div>

      {/* Análisis de Tendencia IA */}
      <TrendAnalysisSection
        centralizedMetrics={centralizedMetrics}
        predictionMetrics={predictionMetrics}
        analysis={analysis}
      />
    </div>
  );
}; 