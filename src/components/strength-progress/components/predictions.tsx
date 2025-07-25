import { formatNumberToString } from '@/utils';
import { Zap } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../card';
import { InfoTooltip } from '../../tooltip';
import { STRENGTH_PROGRESS_CONSTANTS } from '../constants';
import type { StrengthProgressAnalysis } from '../types';
import { getPlateauRiskBgColor, getPlateauRiskColor } from '../utils';

interface PredictionsProps {
  analysis: StrengthProgressAnalysis;
}

export const Predictions: React.FC<PredictionsProps> = ({ analysis }) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          {STRENGTH_PROGRESS_CONSTANTS.SECTIONS.PREDICTIONS}
          <InfoTooltip
            content="Proyecciones basadas en tu tendencia actual de progreso y análisis algorítmico."
            position="top"
            className="ml-2"
          />
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <span className="text-gray-400">PR en 4 semanas</span>
            <div className="text-right">
              <p className="text-lg font-bold text-green-400">
                {formatNumberToString(analysis.predictions.next4WeeksPR)}kg
              </p>
              <p className="text-sm text-gray-400">
                +{formatNumberToString(analysis.predictions.next4WeeksPR - analysis.currentMax1RM)}kg
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <span className="text-gray-400">PR en 12 semanas</span>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-400">
                {formatNumberToString(analysis.predictions.next12WeeksPR)}kg
              </p>
              <p className="text-sm text-gray-400">
                +{formatNumberToString(analysis.predictions.next12WeeksPR - analysis.currentMax1RM)}kg
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <span className="text-gray-400">Riesgo de Meseta</span>
            <div className="text-right">
              <p className={`text-lg font-bold ${getPlateauRiskColor(analysis.predictions.plateauRisk)}`}>
                {analysis.predictions.plateauRisk}%
              </p>
              <div className="w-20 bg-gray-700 rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full ${getPlateauRiskBgColor(analysis.predictions.plateauRisk)}`}
                  style={{ width: `${analysis.predictions.plateauRisk}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <span className="text-gray-400">Tiempo a próximo PR</span>
            <div className="text-right">
              <p className="text-lg font-bold text-purple-400">
                {analysis.predictions.timeToNextPR > 0 ? `${analysis.predictions.timeToNextPR} sesiones` : 'Ya superado'}
              </p>
              <p className="text-sm text-gray-400">Estimación</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 