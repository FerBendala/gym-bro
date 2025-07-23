import React from 'react';

interface HorizontalBarChartProps {
  data: Array<{
    name: string;
    value: number;
    ideal: number;
    color: string;
  }>;
  onItemClick?: (itemName: string) => void;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data, onItemClick }) => {
  const handleItemClick = (itemName: string) => {
    if (onItemClick) {
      onItemClick(itemName);
    }
  };

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const isBalanced = Math.abs(item.value - item.ideal) <= 5;
        const deviation = item.value - item.ideal;

        return (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-white">{item.name}</span>
                <span className="text-xs text-gray-400">({item.ideal}% ideal)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-white">{item.value.toFixed(1)}%</span>
                <div className={`text-xs px-2 py-1 rounded-full ${isBalanced
                    ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                    : deviation > 0
                      ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30'
                      : 'bg-orange-900/30 text-orange-400 border border-orange-500/30'
                  }`}>
                  {isBalanced ? '✓' : deviation > 0 ? '+' : '-'}
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Barra de fondo */}
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                {/* Barra de valor actual */}
                <div
                  className="h-full rounded-full transition-all duration-500 relative"
                  style={{
                    width: `${Math.min(item.value, 100)}%`,
                    backgroundColor: item.color
                  }}
                  onClick={() => handleItemClick(item.name)}
                />

                {/* Línea del valor ideal */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-white/60"
                  style={{ left: `${item.ideal}%` }}
                />
              </div>

              {/* Indicador de valor ideal */}
              <div
                className="absolute -top-6 text-xs text-gray-400"
                style={{ left: `${item.ideal}%`, transform: 'translateX(-50%)' }}
              >
                {item.ideal}%
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}; 