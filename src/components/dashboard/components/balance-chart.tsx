import React from 'react';

interface BalanceChartProps {
  muscleBalance: Array<{
    category: string;
    percentage: number;
    totalVolume: number;
    idealPercentage: number;
  }>;
  onItemClick?: (itemName: string) => void;
}

export const BalanceChart: React.FC<BalanceChartProps> = ({
  muscleBalance,
  onItemClick
}) => {
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Pecho': return '#EF4444';
      case 'Espalda': return '#3B82F6';
      case 'Piernas': return '#10B981';
      case 'Hombros': return '#8B5CF6';
      case 'Brazos': return '#F59E0B';
      case 'Core': return '#6366F1';
      default: return '#6B7280';
    }
  };

  const handleItemClick = (itemName: string) => {
    if (onItemClick) {
      onItemClick(itemName);
    }
  };

  return (
    <div className="space-y-4">
      {muscleBalance
        .filter(balance => balance.totalVolume > 0)
        .map((balance, index) => (
          <div
            key={balance.category}
            className="space-y-2 cursor-pointer hover:bg-gray-800/50 p-2 rounded-lg transition-colors duration-200"
            onClick={() => handleItemClick(balance.category)}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">
                {balance.category}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white">
                  {balance.percentage.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-400">
                  ({balance.idealPercentage.toFixed(1)}% ideal)
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(100, balance.percentage)}%`,
                    backgroundColor: getCategoryColor(balance.category)
                  }}
                />
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}; 