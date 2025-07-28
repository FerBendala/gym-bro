import { Target } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../card';
import { InfoTooltip } from '../../tooltip';
import { STRENGTH_PROGRESS_CONSTANTS } from '../constants';
import type { StrengthProgressAnalysis } from '../types';

interface ConsistencyAnalysisProps {
  analysis: StrengthProgressAnalysis;
}

export const ConsistencyAnalysis: React.FC<ConsistencyAnalysisProps> = ({ analysis }) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Target className="w-5 h-5 mr-2" />
          {STRENGTH_PROGRESS_CONSTANTS.SECTIONS.CONSISTENCY_ANALYSIS}
          <InfoTooltip
            content="Evaluación de la regularidad y estabilidad de tu progreso de fuerza."
            position="top"
            className="ml-2"
          />
        </h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-blue-400">
              {analysis.consistencyMetrics.progressionConsistency}%
            </p>
            <p className="text-sm text-gray-400">Progresión Consistente</p>
          </div>

          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-yellow-400">
              {analysis.consistencyMetrics.plateauPeriods}
            </p>
            <p className="text-sm text-gray-400">Períodos de Meseta</p>
          </div>

          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-green-400">
              {analysis.consistencyMetrics.breakthroughCount}
            </p>
            <p className="text-sm text-gray-400">Breakthroughs</p>
          </div>

          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-purple-400">
              {analysis.consistencyMetrics.volatilityIndex}%
            </p>
            <p className="text-sm text-gray-400">Índice de Volatilidad</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 