import { Target } from 'lucide-react';
import React from 'react';

import { Card, CardContent, CardHeader } from '@/components/card';
import { cn, formatNumberToString } from '@/utils';

interface MuscleGroupsSummaryProps {
  muscleBalance: {
    category: string;
    percentage: number;
    totalVolume: number;
    idealPercentage: number;
  }[];
}

export const MuscleGroupsSummary: React.FC<MuscleGroupsSummaryProps> = ({ muscleBalance }) => {
  if (muscleBalance.length === 0) return null;

  const getGroupStatus = (actual: number, ideal: number) => {
    const ratio = actual / ideal;

    // Lógica mejorada para evaluar el estado
    if (ratio >= 0.9 && ratio <= 1.2) {
      return {
        status: 'Óptimo',
        color: 'bg-green-500/20 text-green-400',
        description: 'Desarrollo equilibrado',
      };
    } else if (ratio >= 0.7 && ratio <= 1.5) {
      return {
        status: 'Bueno',
        color: 'bg-blue-500/20 text-blue-400',
        description: 'Progreso adecuado',
      };
    } else if (ratio < 0.7) {
      return {
        status: 'Mejorar',
        color: 'bg-red-500/20 text-red-400',
        description: 'Necesita más trabajo',
      };
    } else {
      return {
        status: 'Sobredesarrollado',
        color: 'bg-yellow-500/20 text-yellow-400',
        description: 'Considera reducir volumen',
      };
    }
  };

  return (
    <Card className="p-6">
      <CardHeader className="pb-4">
        <h4 className="text-lg font-semibold text-white flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Resumen por Grupos Musculares
        </h4>
        <p className="text-sm text-gray-400">
          Estado actual de cada grupo muscular vs desarrollo ideal
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {muscleBalance.map((group) => {
            const status = getGroupStatus(group.percentage, group.idealPercentage);

            return (
              <div
                key={group.category}
                className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{group.category}</span>
                  <span className={cn('text-xs px-2 py-1 rounded-full', status.color)}>
                    {status.status}
                  </span>
                </div>

                {/* Información adicional */}
                <div className="mb-2">
                  <div className="text-xs text-gray-400 mb-1">{status.description}</div>
                  <div className="text-xs text-gray-500">
                    {formatNumberToString(group.percentage / group.idealPercentage * 100, 0)}% del ideal
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Actual</span>
                    <span className="text-white">{formatNumberToString(group.percentage, 1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(Math.max(group.percentage || 0, 0), 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Ideal</span>
                    <span className="text-gray-400">{formatNumberToString(group.idealPercentage, 1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
