import React from 'react';
import { Card, CardContent, CardHeader } from '../../card';
import { BalanceChart } from './balance-chart';

interface BalanceByGroupContentProps {
  muscleBalance: Array<{
    category: string;
    percentage: number;
    totalVolume: number;
    idealPercentage: number;
  }>;
  categoryAnalysis: Record<string, any>;
  onItemClick?: (itemName: string) => void;
}

export const BalanceByGroupContent: React.FC<BalanceByGroupContentProps> = ({
  muscleBalance,
  categoryAnalysis,
  onItemClick
}) => {
  return (
    <div className="space-y-6">
      {/* Gráfico de balance por grupo */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">📊</span>
            Análisis Detallado por Categorías
          </h3>
        </CardHeader>
        <CardContent>
          <BalanceChart
            muscleBalance={muscleBalance}
            onItemClick={onItemClick}
          />
        </CardContent>
      </Card>

      {/* Métricas detalladas por categoría */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">📈</span>
            Métricas por Grupo Muscular
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(categoryAnalysis).map(([category, data]) => (
              <div key={category} className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-md font-semibold text-white mb-2">{category}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-sm text-gray-400">Volumen Total</p>
                    <p className="text-lg font-semibold text-white">
                      {Math.round(data.totalVolume || 0)}kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Peso Máximo</p>
                    <p className="text-lg font-semibold text-white">
                      {Math.round(data.maxWeight || 0)}kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Frecuencia</p>
                    <p className="text-lg font-semibold text-white">
                      {data.frequency || 0} sesiones
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Progreso</p>
                    <p className="text-lg font-semibold text-white">
                      {Math.round(data.progress || 0)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 