import { BarChart } from 'lucide-react';
import React from 'react';

import { BalanceRadarChart } from './balance-radar-chart';

import { Card, CardContent, CardHeader } from '@/components/card';
import { formatNumberToString } from '@/utils';

interface GeneralContentProps {
  balanceScore: number;
  finalConsistency: number;
  avgIntensity: number;
  avgFrequency: number;
  muscleBalance: {
    category: string;
    percentage: number;
    totalVolume: number;
    idealPercentage: number;
  }[];

}

export const GeneralContent: React.FC<GeneralContentProps> = ({
  balanceScore,
  finalConsistency,
  avgIntensity,
  avgFrequency,
  muscleBalance,
}) => {
  const balanceLevel = balanceScore >= 70 ? 'excellent' :
    balanceScore >= 50 ? 'good' :
      balanceScore >= 30 ? 'unbalanced' : 'critical';

  return (
    <div className="space-y-6">
      {/* Score de Balance General - Diseño Mejorado */}
      <Card className="p-6 lg:p-8 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50">
        <CardHeader className="pb-6">
          <h3 className="text-xl lg:text-2xl font-bold text-white flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mr-4">
              <BarChart className="w-6 h-6 lg:w-7 lg:h-7 text-blue-400" />
            </div>
            <span className="truncate">Análisis General de Balance</span>
            <div className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-300 cursor-help" title="Análisis general del balance muscular y rendimiento de entrenamiento">
              ℹ️
            </div>
          </h3>
        </CardHeader>
        <CardContent>
          {/* Score Principal con Diseño Mejorado */}
          <div className="flex flex-col lg:flex-row items-center justify-between mb-8">
            {/* Score Visual con Gradiente */}
            <div className="flex items-center space-x-6 mb-6 lg:mb-0">
              <div className="relative">
                {/* Círculo de progreso */}
                <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full border-4 border-gray-700 flex items-center justify-center relative overflow-hidden">
                  {/* Gradiente de fondo según el score */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(${balanceScore >= 70 ? '#10b981' : balanceScore >= 50 ? '#3b82f6' : balanceScore >= 30 ? '#f59e0b' : '#ef4444'} 0deg, ${balanceScore * 3.6}deg, #374151 ${balanceScore * 3.6}deg, 360deg)`,
                    }}
                  />
                  {/* Contenido del círculo */}
                  <div className="relative z-10 text-center">
                    <div className={`text-2xl lg:text-3xl font-bold ${balanceScore >= 70 ? 'text-green-400' :
                      balanceScore >= 50 ? 'text-blue-400' :
                        balanceScore >= 30 ? 'text-yellow-400' :
                          'text-red-400'}`}>
                      {formatNumberToString(balanceScore, 1)}%
                    </div>
                    <div className="text-xs text-gray-400">score</div>
                  </div>
                </div>

                {/* Icono flotante */}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <div className="text-lg">
                    {balanceScore >= 70 ? '🎯' :
                      balanceScore >= 50 ? '📈' :
                        balanceScore >= 30 ? '⚠️' :
                          '❌'}
                  </div>
                </div>
              </div>

              {/* Información del estado */}
              <div className="text-center lg:text-left">
                <div className={`text-lg lg:text-xl font-bold mb-2 ${balanceScore >= 70 ? 'text-green-400' :
                  balanceScore >= 50 ? 'text-blue-400' :
                    balanceScore >= 30 ? 'text-yellow-400' :
                      'text-red-400'}`}>
                  {balanceScore >= 70 ? 'EXCELENTE' :
                    balanceScore >= 50 ? 'BUENO' :
                      balanceScore >= 30 ? 'DESEQUILIBRADO' :
                        'CRÍTICO'}
                </div>
                <div className="text-sm text-gray-400 max-w-xs">
                  {balanceScore >= 70 ? 'Tu balance muscular es óptimo. Mantén esta consistencia.' :
                    balanceScore >= 50 ? 'Buen progreso. Enfócate en los grupos desequilibrados.' :
                      balanceScore >= 30 ? 'Necesitas reequilibrar tu entrenamiento.' :
                        'Requiere atención inmediata. Revisa tu rutina.'}
                </div>
              </div>
            </div>

            {/* Métricas Rápidas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <div className="text-lg font-bold text-blue-400">{formatNumberToString(finalConsistency, 1)}%</div>
                <div className="text-xs text-gray-400">Consistencia</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <div className="text-lg font-bold text-purple-400">{formatNumberToString(avgIntensity, 1)}%</div>
                <div className="text-xs text-gray-400">Intensidad</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <div className="text-lg font-bold text-green-400">{formatNumberToString(avgFrequency, 1)}/sem</div>
                <div className="text-xs text-gray-400">Frecuencia</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <div className="text-lg font-bold text-orange-400">{muscleBalance.filter(b => b.percentage >= b.idealPercentage * 0.9).length}/{muscleBalance.length}</div>
                <div className="text-xs text-gray-400">Equilibrados</div>
              </div>
            </div>
          </div>

          {/* Gráfico Radar Mejorado */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl" />
            <div className="relative z-10">
              <BalanceRadarChart
                balanceScore={balanceScore}
                consistency={finalConsistency}
                intensity={avgIntensity}
                frequency={avgFrequency}
                progress={balanceScore}
                balanceLevel={balanceLevel}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
