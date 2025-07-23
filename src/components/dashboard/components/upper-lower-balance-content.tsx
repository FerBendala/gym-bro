import { Dumbbell, Footprints, Scale } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader } from '../../card';
import { BalanceMetrics } from './balance-metrics';
import { HorizontalBarChart } from './horizontal-bar-chart';

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

  // Preparar datos para las meta-categorías
  const metaCategoryData = [
    {
      category: 'Tren Superior',
      icon: Dumbbell,
      color: '#3B82F6',
      gradient: 'from-blue-500 to-blue-700',
      percentage: upperPercentage,
      volume: upperVolume,
      idealPercentage: 60,
      categories: upperCategories,
      isBalanced: Math.abs(upperPercentage - 60) <= 5
    },
    {
      category: 'Tren Inferior',
      icon: Footprints,
      color: '#10B981',
      gradient: 'from-green-500 to-green-700',
      percentage: lowerPercentage,
      volume: lowerVolume,
      idealPercentage: 35,
      categories: lowerCategories,
      isBalanced: Math.abs(lowerPercentage - 35) <= 5
    }
  ];

  return (
    <div className="space-y-6">
      {/* Gráfico de barras horizontales para balance de meta-categorías */}
      <Card>
        <CardHeader className="pb-4">
          <h3 className="text-base lg:text-lg font-semibold text-white flex items-center">
            <Scale className="w-4 h-4 lg:w-5 lg:h-5 mr-2 flex-shrink-0" />
            <span className="truncate">Balance Tren Superior vs Inferior</span>
            <div className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-300 cursor-help" title="Comparación del volumen de entrenamiento entre tren superior (pecho, espalda, hombros, brazos) e inferior (piernas)">
              ℹ️
            </div>
          </h3>
        </CardHeader>
        <CardContent>
          <HorizontalBarChart
            data={metaCategoryData.map(meta => ({
              name: meta.category,
              value: meta.percentage,
              ideal: meta.idealPercentage,
              color: meta.color
            }))}
            onItemClick={onItemClick}
          />
        </CardContent>
      </Card>

      {/* Grid de métricas por meta-categoría */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {metaCategoryData.map((meta) => {
          const Icon = meta.icon;

          return (
            <Card key={meta.category} className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${meta.gradient}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{meta.category}</h4>
                    <p className="text-sm text-gray-400">
                      {meta.categories.join(', ')}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Métricas principales */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                      <div className="text-2xl font-bold text-white">{meta.percentage.toFixed(1)}%</div>
                      <div className="text-xs text-gray-400">Del total</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                      <div className="text-2xl font-bold text-white">{Math.round(meta.volume)}kg</div>
                      <div className="text-xs text-gray-400">Volumen</div>
                    </div>
                  </div>

                  {/* Estado de balance */}
                  <div className={`p-3 rounded-lg border ${meta.isBalanced
                      ? 'bg-green-900/20 border-green-500/30'
                      : 'bg-orange-900/20 border-orange-500/30'
                    }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">Estado</span>
                      <span className={`text-sm font-semibold ${meta.isBalanced ? 'text-green-400' : 'text-orange-400'
                        }`}>
                        {meta.isBalanced ? 'Equilibrado' : 'Desequilibrado'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {meta.isBalanced
                        ? `Dentro del rango ideal (${meta.idealPercentage}% ±5%)`
                        : `Fuera del rango ideal (${meta.idealPercentage}% ±5%)`
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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