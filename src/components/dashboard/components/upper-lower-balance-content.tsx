import { Timer, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';
import { formatNumber } from '../../../utils/functions';
import { Card, CardContent } from '../../card';

interface UpperLowerBalanceContentProps {
  upperLowerBalance: {
    upper: {
      volume: number;
      percentage: number;
    };
    lower: {
      volume: number;
      percentage: number;
    };
  };
}

export const UpperLowerBalanceContent: React.FC<UpperLowerBalanceContentProps> = ({
  upperLowerBalance
}) => {
  const metaCategories = [
    {
      name: 'Tren Superior',
      data: upperLowerBalance.upper,
      color: 'from-blue-500 to-purple-600',
      icon: '💪',
      description: 'Pecho, Espalda, Hombros, Brazos'
    },
    {
      name: 'Tren Inferior',
      data: upperLowerBalance.lower,
      color: 'from-green-500 to-emerald-600',
      icon: '🦵',
      description: 'Piernas, Core'
    }
  ];

  const getBalanceStatus = (percentage: number) => {
    if (percentage >= 45 && percentage <= 55) return { status: 'Equilibrado', color: 'text-green-400', icon: TrendingUp };
    if (percentage >= 40 && percentage <= 60) return { status: 'Aceptable', color: 'text-yellow-400', icon: Timer };
    return { status: 'Desequilibrado', color: 'text-red-400', icon: TrendingDown };
  };

  return (
    <div className="space-y-6">
      {/* Header informativo */}
      <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-indigo-300 mb-2">
          Balance Tren Superior vs Inferior
        </h3>
        <p className="text-sm text-gray-400">
          Análisis de la distribución de volumen entre grupos musculares superiores e inferiores.
          Un balance equilibrado es clave para el desarrollo muscular completo.
        </p>
      </div>

      {/* Gráficos de barras horizontales */}
      <div className="grid gap-6">
        {metaCategories.map((meta, index) => {
          const balanceStatus = getBalanceStatus(meta.data.percentage);
          const StatusIcon = balanceStatus.icon;

          return (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${meta.color}`}>
                      <span className="text-2xl">{meta.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{meta.name}</h4>
                      <p className="text-sm text-gray-400">{meta.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{formatNumber(meta.data.percentage, 1)}%</div>
                    <div className="text-sm text-gray-400">{formatNumber(meta.data.volume, 0)} kg</div>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full bg-gradient-to-r ${meta.color} transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(100, meta.data.percentage)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>

                  {/* Indicadores de zona ideal */}
                  <div className="absolute top-0 w-0.5 h-full bg-white/60" style={{ left: '45%' }} />
                  <div className="absolute top-0 w-0.5 h-full bg-white/60" style={{ left: '55%' }} />
                </div>

                {/* Estado del balance */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <StatusIcon className={`w-4 h-4 ${balanceStatus.color}`} />
                    <span className={`text-sm font-medium ${balanceStatus.color}`}>
                      {balanceStatus.status}
                    </span>
                  </div>

                  <div className="text-xs text-gray-400">
                    Zona ideal: 45-55%
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumen del balance */}
      <Card className="bg-gradient-to-r from-gray-800/50 to-gray-700/50">
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Resumen del Balance</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tren Superior:</span>
                <span className="text-white font-semibold">{formatNumber(upperLowerBalance.upper.percentage, 1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tren Inferior:</span>
                <span className="text-white font-semibold">{formatNumber(upperLowerBalance.lower.percentage, 1)}%</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Diferencia:</span>
                <span className="text-white font-semibold">
                  {formatNumber(Math.abs(upperLowerBalance.upper.percentage - upperLowerBalance.lower.percentage), 1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Volumen Total:</span>
                <span className="text-white font-semibold">
                  {formatNumber(upperLowerBalance.upper.volume + upperLowerBalance.lower.volume, 0)} kg
                </span>
              </div>
            </div>
          </div>

          {/* Recomendación */}
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300">
              {Math.abs(upperLowerBalance.upper.percentage - upperLowerBalance.lower.percentage) > 15
                ? 'Considera ajustar tu rutina para equilibrar mejor el desarrollo entre tren superior e inferior.'
                : 'Excelente balance entre tren superior e inferior. Mantén esta distribución.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 