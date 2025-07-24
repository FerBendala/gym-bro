import { TrendingUp } from 'lucide-react';
import { formatNumber } from '../../../utils/functions';
import { Card, CardContent, CardHeader } from '../../card';
import { InfoTooltip } from '../../tooltip';
import { STRENGTH_PROGRESS_CONSTANTS } from '../constants';
import type { StrengthProgressAnalysis } from '../types';
import { getPhaseColor } from '../utils';

interface GeneralProgressProps {
  analysis: StrengthProgressAnalysis;
}

export const GeneralProgress: React.FC<GeneralProgressProps> = ({ analysis }) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          {STRENGTH_PROGRESS_CONSTANTS.SECTIONS.GENERAL_PROGRESS}
          <InfoTooltip
            content="Análisis del progreso de fuerza considerando toda tu historia de entrenamiento."
            position="top"
            className="ml-2"
          />
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <span className="text-gray-400">Progreso Total</span>
            <div className="text-right">
              <p className="text-lg font-bold text-green-400">
                +{formatNumber(analysis.overallProgress.absolute)}kg
              </p>
              <p className="text-sm text-gray-400">
                ({analysis.overallProgress.percentage > 0 ? '+' : ''}{analysis.overallProgress.percentage.toFixed(1)}%)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <span className="text-gray-400">Ganancia Mensual</span>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-400">
                {formatNumber(analysis.strengthCurve.gainRate)}kg/mes
              </p>
              <p className="text-sm text-gray-400">Promedio actual</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <span className="text-gray-400">Fase de Entrenamiento</span>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getPhaseColor(analysis.strengthCurve.phase)}`}>
                {analysis.strengthCurve.phase}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <span className="text-gray-400">Potencial Alcanzado</span>
            <div className="text-right">
              <p className="text-lg font-bold text-purple-400">
                {analysis.strengthCurve.potential}%
              </p>
              <div className="w-20 bg-gray-700 rounded-full h-2 mt-1">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${analysis.strengthCurve.potential}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 