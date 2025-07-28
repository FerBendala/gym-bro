import { formatNumberToString } from '@/utils';
import { Award, BarChart3, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../../card';
import { STRENGTH_PROGRESS_CONSTANTS } from '../constants';
import type { StrengthProgressAnalysis } from '../types';
import { getRateColor } from '../utils';

interface MainMetricsProps {
  analysis: StrengthProgressAnalysis;
}

export const MainMetrics: React.FC<MainMetricsProps> = ({ analysis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">
                {formatNumberToString(analysis.currentMax1RM)}kg
              </p>
              <p className="text-sm text-gray-400">
                {STRENGTH_PROGRESS_CONSTANTS.METRICS.MAX_1RM}
              </p>
            </div>
            <Award className="w-6 h-6 text-yellow-400" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-2xl font-bold ${getRateColor(analysis.overallProgress.rate)}`}>
                {analysis.overallProgress.rate}
              </p>
              <p className="text-sm text-gray-400">
                {STRENGTH_PROGRESS_CONSTANTS.METRICS.PROGRESS_RATE}
              </p>
            </div>
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">
                {analysis.consistencyMetrics.progressionConsistency}%
              </p>
              <p className="text-sm text-gray-400">
                {STRENGTH_PROGRESS_CONSTANTS.METRICS.CONSISTENCY}
              </p>
            </div>
            <Target className="w-6 h-6 text-blue-400" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">
                {analysis.predictions.confidence}%
              </p>
              <p className="text-sm text-gray-400">
                {STRENGTH_PROGRESS_CONSTANTS.METRICS.PREDICTION_CONFIDENCE}
              </p>
            </div>
            <BarChart3 className="w-6 h-6 text-purple-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 