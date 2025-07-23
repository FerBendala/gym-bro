import React from 'react';
import { Card, CardContent, CardHeader } from '../../card';
import { BalanceMetrics } from './balance-metrics';

interface UpperLowerBalanceContentProps {
  upperLowerBalance: {
    upper: { volume: number; percentage: number };
    lower: { volume: number; percentage: number };
  };
  categoryAnalysis: Record<string, any>;
  muscleBalance: Array<{
    category: string;
    percentage: number;
    totalVolume: number;
    idealPercentage: number;
  }>;
  onItemClick?: (itemName: string) => void;
}

export const UpperLowerBalanceContent: React.FC<UpperLowerBalanceContentProps> = ({
  upperLowerBalance,
  categoryAnalysis,
  muscleBalance,
  onItemClick
}) => {
  const upperCategories = ['Pecho', 'Espalda', 'Hombros', 'Brazos'];
  const lowerCategories = ['Piernas', 'Core'];

  const upperVolume = upperCategories.reduce((sum, category) => {
    const categoryData = muscleBalance.find(item => item.category === category);
    return sum + (categoryData?.totalVolume || 0);
  }, 0);

  const lowerVolume = lowerCategories.reduce((sum, category) => {
    const categoryData = muscleBalance.find(item => item.category === category);
    return sum + (categoryData?.totalVolume || 0);
  }, 0);

  const totalVolume = upperVolume + lowerVolume;
  const upperPercentage = totalVolume > 0 ? (upperVolume / totalVolume) * 100 : 0;
  const lowerPercentage = totalVolume > 0 ? (lowerVolume / totalVolume) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Balance Superior vs Inferior */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">⚖️</span>
            Balance Tren Superior vs Inferior
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Gráfico de barras */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-400">Tren Superior</span>
                <span className="text-white">{Math.round(upperPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${upperPercentage}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-400">Tren Inferior</span>
                <span className="text-white">{Math.round(lowerPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${lowerPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Métricas numéricas */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
              <h4 className="text-sm font-medium text-blue-400 mb-2">Tren Superior</h4>
              <p className="text-2xl font-bold text-white">{Math.round(upperVolume)}kg</p>
              <p className="text-sm text-gray-400">Volumen total</p>
            </div>
            <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
              <h4 className="text-sm font-medium text-green-400 mb-2">Tren Inferior</h4>
              <p className="text-2xl font-bold text-white">{Math.round(lowerVolume)}kg</p>
              <p className="text-sm text-gray-400">Volumen total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas detalladas */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">📊</span>
            Métricas Detalladas
          </h3>
        </CardHeader>
        <CardContent>
          <BalanceMetrics
            categoryAnalysis={categoryAnalysis}
            upperLowerBalance={upperLowerBalance}
            onUpperLowerClick={onItemClick}
          />
        </CardContent>
      </Card>
    </div>
  );
}; 