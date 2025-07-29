import { Card, CardContent, CardHeader } from '@/components/card';
import { InfoTooltip } from '@/components/tooltip';
import { getVolumeAdjustmentColor } from '@/utils';
import { Zap } from 'lucide-react';
import { STRENGTH_PROGRESS_CONSTANTS } from '../constants';
import type { StrengthProgressAnalysis } from '../types';
import { getZoneColor } from '../utils';

interface TrainingRecommendationsProps {
  analysis: StrengthProgressAnalysis;
}

export const TrainingRecommendations: React.FC<TrainingRecommendationsProps> = ({ analysis }) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          {STRENGTH_PROGRESS_CONSTANTS.SECTIONS.TRAINING_RECOMMENDATIONS}
          <InfoTooltip
            content="Sugerencias personalizadas basadas en tu fase actual y análisis de progreso."
            position="top"
            className="ml-2"
          />
        </h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <span className="text-gray-400">Zona de Intensidad</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getZoneColor(analysis.trainingRecommendations.intensityZone)}`}>
                {analysis.trainingRecommendations.intensityZone}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <span className="text-gray-400">RPE Sugerido</span>
              <span className="text-lg font-bold text-white">
                {analysis.trainingRecommendations.suggestedRPE}/10
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <span className="text-gray-400">Ajuste de Volumen</span>
              <span className={`text-lg font-bold ${getVolumeAdjustmentColor(analysis.trainingRecommendations.volumeAdjustment)}`}>
                {analysis.trainingRecommendations.volumeAdjustment > 0 ? '+' : ''}{analysis.trainingRecommendations.volumeAdjustment}%
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <span className="text-gray-400">Frecuencia Semanal</span>
              <span className="text-lg font-bold text-blue-400">
                {analysis.trainingRecommendations.frequencyAdjustment} sesiones
              </span>
            </div>
          </div>

          <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
            <h4 className="text-sm font-medium text-blue-400 mb-2">Consejo de Periodización</h4>
            <p className="text-sm text-gray-300">
              {analysis.trainingRecommendations.periodizationTip}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 