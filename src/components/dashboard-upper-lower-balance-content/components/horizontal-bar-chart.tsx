import React from 'react';

import type { HorizontalBarChartProps } from '../types';

import { formatNumberToString } from '@/utils';

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data, onItemClick }) => {
  const maxValue = Math.max(...data.map(item => Math.max(item.value, item.ideal))) * 1.1;

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
          className="space-y-2 cursor-pointer hover:bg-gray-800/50 p-2 rounded-lg transition-colors duration-200"
          onClick={() => handleItemClick(item.name)}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">{item.name}</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white">{formatNumberToString(item.value, 1)}%</span>
              <span className="text-xs text-gray-400">({formatNumberToString(item.ideal, 0)}% ideal)</span>
            </div>
          </div>

          <div className="relative">
            {/* Barra de fondo */}
            <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
              {/* Zona ideal */}
              <div
                className="absolute h-full bg-white/10 border-x border-white/20"
                style={{
                  left: `${Math.max(0, (item.ideal - 2) / maxValue * 100)}%`,
                  width: `${4 / maxValue * 100}%`,
                }}
              />

              {/* Barra actual */}
              <div
                className="h-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min(100, (item.value / maxValue) * 100)}%`,
                  backgroundColor: item.color,
                }}
              />

              {/* Indicador ideal */}
              <div
                className="absolute top-0 w-0.5 h-full bg-white"
                style={{ left: `${(item.ideal / maxValue) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
