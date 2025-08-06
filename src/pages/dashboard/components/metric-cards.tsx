import { Activity, Brain, Target, Zap } from 'lucide-react';
import React from 'react';

import { Card } from '@/components/card';
import { formatNumberToString } from '@/utils';

interface MetricCardsProps {
  finalConsistency: number;
  avgIntensity: number;
  avgFrequency: number;
  balancedGroups: number;
  totalGroups: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  finalConsistency,
  avgIntensity,
  avgFrequency,
  balancedGroups,
  totalGroups,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-400">
              {formatNumberToString(finalConsistency, 1)}%
            </div>
            <div className="text-xs text-gray-400">Consistencia</div>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-purple-400">
              {formatNumberToString(avgIntensity, 1)}%
            </div>
            <div className="text-xs text-gray-400">Intensidad</div>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-green-500/20">
            <Target className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">
              {formatNumberToString(avgFrequency, 1)}/sem
            </div>
            <div className="text-xs text-gray-400">Frecuencia</div>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-orange-500/20">
            <Brain className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-orange-400">
              {balancedGroups}/{totalGroups}
            </div>
            <div className="text-xs text-gray-400">Equilibrados</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
