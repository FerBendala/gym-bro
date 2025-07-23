import { BarChart, PieChart } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader } from '../../card';
import { StatCard } from '../../stat-card';
import { InfoTooltip } from '../../tooltip';

interface BalanceByGroupContentProps {
  muscleBalance: any[];
  categoryAnalysis: any;
  onItemClick: (itemName: string) => void;
}

export const BalanceByGroupContent: React.FC<BalanceByGroupContentProps> = ({
  muscleBalance,
  categoryAnalysis,
  onItemClick
}) => {
  return (
    <div className="space-y-6">
      {/* Gráfico de barras horizontales para balance por categoría */}
      <Card>
        <CardHeader className="pb-4">
          <h3 className="text-base lg:text-lg font-semibold text-white flex items-center">
            <BarChart className="w-4 h-4 lg:w-5 lg:h-5 mr-2 flex-shrink-0" />
            <span className="truncate">Balance por Categoría</span>
            <InfoTooltip
              content="Comparación visual del volumen actual vs ideal para cada grupo muscular"
              position="top"
              className="ml-2 flex-shrink-0"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {muscleBalance.map((item) => (
              <div
                key={item.name}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30 hover:border-gray-500/50 transition-colors cursor-pointer"
                onClick={() => onItemClick(item.name)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <h4 className="font-semibold text-white">{item.name}</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{item.volume}kg</div>
                    <div className="text-sm text-gray-400">{item.percentage}%</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Volumen actual:</span>
                    <span className="text-white">{item.volume}kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Porcentaje:</span>
                    <span className="text-white">{item.percentage}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Ejercicios:</span>
                    <span className="text-white">{item.exercises}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Sesiones:</span>
                    <span className="text-white">{item.sessions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Promedio:</span>
                    <span className="text-white">{Math.round(item.avgWeight)}kg</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Balance */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Métricas de Balance
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(categoryAnalysis).map(([key, value]: [string, any]) => (
              <StatCard
                key={key}
                title={key}
                value={typeof value === 'number' ? Math.round(value) : value}
                icon={BarChart}
                variant="primary"
                tooltip={`Métrica de ${key.toLowerCase()}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 