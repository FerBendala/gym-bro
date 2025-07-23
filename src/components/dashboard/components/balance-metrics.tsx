import React from 'react';

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
  const handleUpperLowerClick = (itemName: string) => {
    if (onUpperLowerClick) {
      onUpperLowerClick(itemName);
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Superior vs Inferior */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Balance Superior vs Inferior</h4>

        <div className="space-y-3">
          <div
            className="space-y-2 cursor-pointer hover:bg-gray-800/50 p-2 rounded-lg transition-colors duration-200"
            onClick={() => handleUpperLowerClick('Tren Superior')}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Tren Superior</span>
              <span className="text-sm text-white">{upperLowerBalance.upper.percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, upperLowerBalance.upper.percentage)}%` }}
              />
            </div>
          </div>

          <div
            className="space-y-2 cursor-pointer hover:bg-gray-800/50 p-2 rounded-lg transition-colors duration-200"
            onClick={() => handleUpperLowerClick('Tren Inferior')}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Tren Inferior</span>
              <span className="text-sm text-white">{upperLowerBalance.lower.percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, upperLowerBalance.lower.percentage)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Métricas por categoría */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Métricas por Categoría</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(categoryAnalysis)
            .filter(([_, data]) => data.volume > 0)
            .map(([category, data]) => (
              <div key={category} className="bg-gray-800/30 rounded-lg p-3">
                <h5 className="text-sm font-medium text-white mb-2">{category}</h5>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Volumen:</span>
                    <span className="text-white">{Math.round(data.volume)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Porcentaje:</span>
                    <span className="text-white">{data.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sesiones:</span>
                    <span className="text-white">{data.workouts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Peso Promedio:</span>
                    <span className="text-white">{Math.round(data.avgWeight)} kg</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}; 