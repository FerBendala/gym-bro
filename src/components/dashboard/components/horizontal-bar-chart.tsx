import React from 'react';
import { formatNumber } from '../../../utils/functions';

interface HorizontalBarChartProps {
  data: Array<{
    name: string;
    value: number;
    ideal?: number;
    color?: string;
  }>;
  onItemClick?: (itemName: string) => void;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  onItemClick
}) => {
  const handleItemClick = (itemName: string) => {
    if (onItemClick) {
      onItemClick(itemName);
    }
  };

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div
          key={index}
          className="space-y-2 cursor-pointer hover:bg-gray-800/50 p-3 rounded-lg transition-colors duration-200"
          onClick={() => handleItemClick(item.name)}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">{item.name}</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-white">{formatNumber(item.value, 1)}%</span>
              {item.ideal && (
                <span className="text-xs text-gray-400">
                  (ideal: {formatNumber(item.ideal, 1)}%)
                </span>
              )}
            </div>
          </div>

          <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${Math.min(100, item.value)}%`,
                backgroundColor: item.color || '#3B82F6'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            {item.ideal && (
              <div
                className="absolute top-0 w-0.5 h-full bg-white/60"
                style={{ left: `${item.ideal}%` }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}; 