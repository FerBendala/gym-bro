import { BarChart } from 'lucide-react';
import React from 'react';

import { Card, CardContent, CardHeader } from '@/components/card';
import { BalanceRadarChart } from '.';

interface RadarChartCardProps {
  balanceScore: number;
  finalConsistency: number;
  avgIntensity: number;
  avgFrequency: number;
}

export const RadarChartCard: React.FC<RadarChartCardProps> = ({
  balanceScore,
  finalConsistency,
  avgIntensity,
  avgFrequency,
}) => {
  const balanceLevel = balanceScore >= 70 ? 'excellent' :
    balanceScore >= 50 ? 'good' :
      balanceScore >= 30 ? 'unbalanced' : 'critical';

  return (
    <Card className="p-4 sm:p-6">
      <CardHeader className="pb-4">
        <h4 className="text-lg font-semibold text-white flex items-center">
          <BarChart className="w-5 h-5 mr-2" />
          Análisis Multidimensional
        </h4>
        <p className="text-sm text-gray-400">
          Evaluación completa de tu rendimiento en 5 dimensiones clave
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl" />
          <div className="relative z-10">
            {/* Contenedor con altura responsive */}
            <div className="min-h-[280px] sm:min-h-[320px] lg:min-h-[350px] w-full">
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
        </div>
      </CardContent>
    </Card>
  );
};
