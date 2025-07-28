import { Award } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../card';
import { InfoTooltip } from '../../tooltip';
import { STRENGTH_PROGRESS_CONSTANTS } from '../constants';
import type { StrengthProgressAnalysis } from '../types';

interface QualityMetricsProps {
  analysis: StrengthProgressAnalysis;
}

export const QualityMetrics: React.FC<QualityMetricsProps> = ({ analysis }) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Award className="w-5 h-5 mr-2" />
          {STRENGTH_PROGRESS_CONSTANTS.SECTIONS.QUALITY_METRICS}
          <InfoTooltip
            content="Evaluación de la calidad y eficiencia de tu entrenamiento de fuerza."
            position="top"
            className="ml-2"
          />
        </h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-green-400">
              {analysis.qualityMetrics.formConsistency}%
            </p>
            <p className="text-sm text-gray-400">Consistencia de Forma</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${analysis.qualityMetrics.formConsistency}%` }}
              />
            </div>
          </div>

          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-blue-400">
              {analysis.qualityMetrics.loadProgression}%
            </p>
            <p className="text-sm text-gray-400">Progresión de Carga</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${analysis.qualityMetrics.loadProgression}%` }}
              />
            </div>
          </div>

          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-purple-400">
              {analysis.qualityMetrics.volumeOptimization}%
            </p>
            <p className="text-sm text-gray-400">Optimización de Volumen</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${analysis.qualityMetrics.volumeOptimization}%` }}
              />
            </div>
          </div>

          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-yellow-400">
              {analysis.qualityMetrics.recoveryIndicators}%
            </p>
            <p className="text-sm text-gray-400">Indicadores de Recuperación</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: `${analysis.qualityMetrics.recoveryIndicators}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 