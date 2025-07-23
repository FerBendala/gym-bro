import React from 'react';
import { formatNumber } from '../../../utils/functions';
import { Card, CardContent, CardHeader } from '../../card';

interface BalanceChartProps {
  muscleBalance: Array<{
    category: string;
    percentage: number;
    totalVolume: number;
    idealPercentage: number;
  }>;
}

export const BalanceChart: React.FC<BalanceChartProps> = ({ muscleBalance }) => {
  const chartData = muscleBalance.map(balance => ({
    x: balance.category,
    y: balance.percentage,
    fill: balance.percentage > balance.idealPercentage ? '#10B981' : '#EF4444'
  }));

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white">Balance por Categoría</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {muscleBalance.map((balance, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{balance.category}</span>
                <span className="text-white font-medium">
                  {formatNumber(balance.percentage, 1)}%
                </span>
                <span className="text-gray-500 text-xs">
                  ({formatNumber(balance.idealPercentage, 1)}% ideal)
                </span>
              </div>
              <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, balance.percentage)}%`,
                    backgroundColor: balance.percentage > balance.idealPercentage ? '#10B981' : '#EF4444'
                  }}
                />
                <div
                  className="absolute top-0 w-0.5 h-full bg-white/60"
                  style={{ left: `${balance.idealPercentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 