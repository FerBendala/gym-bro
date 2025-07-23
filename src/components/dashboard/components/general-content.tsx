import { BarChart } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader } from '../../card';
import { InfoTooltip } from '../../tooltip';

interface GeneralContentProps {
  balanceScore: number;
  finalConsistency: number;
  avgIntensity: number;
  avgFrequency: number;
  muscleBalance: any[];
  onItemClick: (itemName: string) => void;
}

export const GeneralContent: React.FC<GeneralContentProps> = ({
  balanceScore,
  finalConsistency,
  avgIntensity,
  avgFrequency,
  muscleBalance,
  onItemClick
}) => (
  <div className="space-y-6">
    {/* Chart/Radar de Balance General */}
    <Card className="p-6 lg:p-8 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50">
      <CardHeader className="pb-6">
        <h3 className="text-xl lg:text-2xl font-bold text-white flex items-center">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mr-4">
            <BarChart className="w-6 h-6 lg:w-7 lg:h-7 text-blue-400" />
          </div>
          <span className="truncate">Radar de Balance General</span>
          <InfoTooltip
            content="Visualización radar del balance muscular general"
            position="top"
            className="ml-3 flex-shrink-0"
          />
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
                    background: `conic-gradient(${balanceScore >= 70 ? '#10b981' : balanceScore >= 50 ? '#3b82f6' : balanceScore >= 30 ? '#f59e0b' : '#ef4444'} 0deg, ${balanceScore * 3.6}deg, #374151 ${balanceScore * 3.6}deg, 360deg)`
                  }}
                />
                {/* Contenido del círculo */}
                <div className="relative z-10 text-center">
                  <div className={`text-2xl lg:text-3xl font-bold ${balanceScore >= 70 ? 'text-green-400' :
                    balanceScore >= 50 ? 'text-blue-400' :
                      balanceScore >= 30 ? 'text-yellow-400' :
                        'text-red-400'}`}>
                    {Math.round(balanceScore)}%
                  </div>
                  <div className="text-xs text-gray-400">score</div>
                </div>
              </div>
            </div>

            {/* Información del score */}
            <div className="text-left">
              <h4 className="text-lg font-semibold text-white mb-2">Score de Balance</h4>
              <p className="text-gray-300 text-sm mb-3">
                {balanceScore >= 80 ? 'Excelente balance muscular' :
                  balanceScore >= 60 ? 'Buen balance muscular' :
                    balanceScore >= 40 ? 'Balance muscular regular' :
                      'Necesita mejorar el balance muscular'}
              </p>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${balanceScore >= 70 ? 'bg-green-500' : balanceScore >= 50 ? 'bg-blue-500' : balanceScore >= 30 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-400">
                  {balanceScore >= 70 ? 'Óptimo' : balanceScore >= 50 ? 'Bueno' : balanceScore >= 30 ? 'Regular' : 'Necesita mejora'}
                </span>
              </div>
            </div>
          </div>

          {/* Métricas rápidas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{Math.round(finalConsistency)}%</div>
              <div className="text-sm text-gray-400">Consistencia</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{Math.round(avgIntensity)}kg</div>
              <div className="text-sm text-gray-400">Intensidad</div>
            </div>
          </div>
        </div>

        {/* Gráfico de distribución simplificado */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Distribución por Categorías</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {muscleBalance.slice(0, 6).map((item) => (
              <div
                key={item.name}
                className="bg-gray-800/50 rounded-lg p-3 border border-gray-600/30 hover:border-gray-500/50 transition-colors cursor-pointer"
                onClick={() => onItemClick(item.name)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{item.name}</span>
                  <span className="text-sm text-gray-400">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
); 