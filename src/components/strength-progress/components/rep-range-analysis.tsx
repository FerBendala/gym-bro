import { BarChart3 } from 'lucide-react';
import { formatNumber } from '../../../utils/functions';
import { Card, CardContent, CardHeader } from '../../card';
import { InfoTooltip } from '../../tooltip';
import { STRENGTH_PROGRESS_CONSTANTS } from '../constants';
import type { StrengthProgressAnalysis } from '../types';

interface RepRangeAnalysisProps {
  analysis: StrengthProgressAnalysis;
}

export const RepRangeAnalysis: React.FC<RepRangeAnalysisProps> = ({ analysis }) => {
  if (analysis.repRangeAnalysis.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          {STRENGTH_PROGRESS_CONSTANTS.SECTIONS.REP_RANGE_ANALYSIS}
          <InfoTooltip
            content="Efectividad de diferentes rangos de repeticiones para tu progreso de fuerza."
            position="top"
            className="ml-2"
          />
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {analysis.repRangeAnalysis.map((range, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-white">{range.range}</h4>
                <p className="text-sm text-gray-400">
                  {formatNumber(range.volume)}kg volumen • {formatNumber(range.maxWeight)}kg máximo
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${range.progressRate > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                  {range.progressRate > 0 ? '+' : ''}{range.progressRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">
                  Efectividad: {range.effectiveness.toFixed(1)}/100
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 