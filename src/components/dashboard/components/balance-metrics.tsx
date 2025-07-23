import React from 'react';
import { formatNumber } from '../../../utils/functions';

interface BalanceMetricsProps {
  categoryAnalysis: Record<string, any>;
  upperLowerBalance: {
    upper: { volume: number; percentage: number };
    lower: { volume: number; percentage: number };
  };
  onUpperLowerClick?: (itemName: string) => void;
}

export const BalanceMetrics: React.FC<BalanceMetricsProps> = ({
  categoryAnalysis,
  upperLowerBalance,
  onUpperLowerClick
}) => {
  const handleUpperLowerClick = (type: 'upper' | 'lower') => {
    if (onUpperLowerClick) {
      onUpperLowerClick(type === 'upper' ? 'Tren Superior' : 'Tren Inferior');
    }
  };

  return (
    <div className="space-y-4">
      {/* Balance Superior/Inferior */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className="p-4 rounded-lg bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-500/30 cursor-pointer hover:bg-blue-900/30 transition-colors duration-200"
          onClick={() => handleUpperLowerClick('upper')}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {formatNumber(upperLowerBalance.upper.percentage, 1)}%
            </div>
            <div className="text-sm text-gray-400 mb-2">Tren Superior</div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000"
                style={{ width: `${Math.min(100, upperLowerBalance.upper.percentage)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              <span className="text-white">{formatNumber(upperLowerBalance.upper.percentage, 1)}%</span>
            </div>
          </div>
        </div>

        <div
          className="p-4 rounded-lg bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-500/30 cursor-pointer hover:bg-green-900/30 transition-colors duration-200"
          onClick={() => handleUpperLowerClick('lower')}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {formatNumber(upperLowerBalance.lower.percentage, 1)}%
            </div>
            <div className="text-sm text-gray-400 mb-2">Tren Inferior</div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-1000"
                style={{ width: `${Math.min(100, upperLowerBalance.lower.percentage)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              <span className="text-white">{formatNumber(upperLowerBalance.lower.percentage, 1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas por categoría */}
      <div className="space-y-3">
        {Object.entries(categoryAnalysis)
          .filter(([_, data]) => data.volume > 0)
          .map(([category, data]) => (
            <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
                <span className="text-sm font-medium text-gray-300">{category}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">
                  {formatNumber(data.percentage, 1)}%
                </div>
                <div className="text-xs text-gray-400">{formatNumber(data.volume, 0)} kg</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}; 