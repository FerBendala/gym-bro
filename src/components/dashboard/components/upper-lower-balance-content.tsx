import { Dumbbell, Footprints, Scale } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader } from '../../card';
import { StatCard } from '../../stat-card';
import { InfoTooltip } from '../../tooltip';

interface UpperLowerBalanceContentProps {
  upperLowerBalance: any;
  categoryAnalysis: any;
  muscleBalance: any[];
  onItemClick: (itemName: string) => void;
}

// Constantes para meta-categorías
const META_CATEGORIES = {
  UPPER_BODY: {
    id: 'upper_body',
    name: 'Tren Superior',
    categories: ['Pecho', 'Espalda', 'Hombros', 'Brazos'],
    idealPercentage: 60,
    color: '#3B82F6'
  },
  LOWER_BODY: {
    id: 'lower_body',
    name: 'Tren Inferior',
    categories: ['Piernas', 'Glúteos'],
    idealPercentage: 35,
    color: '#10B981'
  },
  CORE: {
    id: 'core',
    name: 'Core',
    categories: ['Core'],
    idealPercentage: 5,
    color: '#8B5CF6'
  }
};

export const UpperLowerBalanceContent: React.FC<UpperLowerBalanceContentProps> = ({
  upperLowerBalance,
  categoryAnalysis,
  muscleBalance,
  onItemClick
}) => {
  // Preparar datos para las meta-categorías
  const metaCategoryData = [
    {
      category: 'Tren Superior',
      icon: Dumbbell,
      color: META_CATEGORIES.UPPER_BODY.color,
      gradient: 'from-blue-500 to-blue-700',
      percentage: upperLowerBalance.upperBodyPercentage || 0,
      volume: upperLowerBalance.upperBodyVolume || 0,
      idealPercentage: META_CATEGORIES.UPPER_BODY.idealPercentage,
      categories: META_CATEGORIES.UPPER_BODY.categories,
      isBalanced: Math.abs((upperLowerBalance.upperBodyPercentage || 0) - META_CATEGORIES.UPPER_BODY.idealPercentage) <= 10
    },
    {
      category: 'Tren Inferior',
      icon: Footprints,
      color: META_CATEGORIES.LOWER_BODY.color,
      gradient: 'from-green-500 to-green-700',
      percentage: upperLowerBalance.lowerBodyPercentage || 0,
      volume: upperLowerBalance.lowerBodyVolume || 0,
      idealPercentage: META_CATEGORIES.LOWER_BODY.idealPercentage,
      categories: META_CATEGORIES.LOWER_BODY.categories,
      isBalanced: Math.abs((upperLowerBalance.lowerBodyPercentage || 0) - META_CATEGORIES.LOWER_BODY.idealPercentage) <= 10
    },
    {
      category: 'Core',
      icon: Scale,
      color: META_CATEGORIES.CORE.color,
      gradient: 'from-purple-500 to-purple-700',
      percentage: upperLowerBalance.corePercentage || 0,
      volume: upperLowerBalance.coreVolume || 0,
      idealPercentage: META_CATEGORIES.CORE.idealPercentage,
      categories: META_CATEGORIES.CORE.categories,
      isBalanced: Math.abs((upperLowerBalance.corePercentage || 0) - META_CATEGORIES.CORE.idealPercentage) <= 5
    }
  ];

  return (
    <div className="space-y-6">
      {/* Balance Superior vs Inferior */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">⚖️</span>
            Balance Tren Superior vs Inferior
            <InfoTooltip
              content="Análisis del balance entre tren superior, inferior y core"
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metaCategoryData.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.category}
                  id={`upper-lower-card-${item.category.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl border p-4 hover:border-gray-500/50 transition-all duration-200 cursor-pointer ${item.isBalanced ? 'border-green-500/30' : 'border-gray-600/30'
                    }`}
                  onClick={() => onItemClick(item.category)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${item.gradient}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-semibold text-white">{item.category}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{item.volume}kg</div>
                      <div className="text-sm text-gray-400">{item.percentage}%</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Ideal:</span>
                      <span className="text-white">{item.idealPercentage}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Diferencia:</span>
                      <span className={`${item.isBalanced ? 'text-green-400' : 'text-yellow-400'}`}>
                        {Math.abs(item.percentage - item.idealPercentage).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Estado:</span>
                      <span className={`${item.isBalanced ? 'text-green-400' : 'text-yellow-400'}`}>
                        {item.isBalanced ? 'Balanceado' : 'Desbalanceado'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Balance */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">📊</span>
            Métricas de Balance
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              title="Balance Score"
              value={`${Math.round(upperLowerBalance.balanceScore || 0)}/100`}
              icon={Scale}
              variant={upperLowerBalance.balanceScore >= 80 ? 'success' : upperLowerBalance.balanceScore >= 60 ? 'warning' : 'danger'}
              tooltip="Score general del balance entre trenes"
            />
            <StatCard
              title="Ratio S/I"
              value={upperLowerBalance.upperLowerRatio ? upperLowerBalance.upperLowerRatio.toFixed(2) : '0'}
              icon={Dumbbell}
              variant="primary"
              tooltip="Ratio tren superior vs inferior"
            />
            <StatCard
              title="Volumen Total"
              value={`${Math.round(upperLowerBalance.totalVolume || 0)}kg`}
              icon={Footprints}
              variant="primary"
              tooltip="Volumen total de entrenamiento"
            />
            <StatCard
              title="Categorías"
              value={upperLowerBalance.categoryCount || 0}
              icon={Scale}
              variant="primary"
              tooltip="Número de categorías entrenadas"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 