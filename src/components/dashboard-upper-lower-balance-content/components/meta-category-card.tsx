import { formatNumberToString } from '@/utils';
import React from 'react';
import { Card } from '../../card';
import type { MetaCategoryCardProps } from '../types';
import { CategoryDashboardChart } from './category-dashboard-chart';

export const MetaCategoryCard: React.FC<MetaCategoryCardProps> = ({
  meta,
  categoryAnalysis,
  muscleBalance
}) => {
  const Icon = meta.icon;

  // Calcular métricas agregadas para esta meta-categoría
  const categoryMetrics = meta.categories
    .map((cat: string) => categoryAnalysis.categoryMetrics.find((m) => m.category === cat))
    .filter((m): m is NonNullable<typeof m> => m !== undefined);

  // Obtener datos de muscleBalance para tendencias reales
  const muscleBalanceData = meta.categories
    .map((cat: string) => muscleBalance.find((b) => b.category === cat))
    .filter((b): b is NonNullable<typeof b> => b !== undefined);

  const totalFrequency = categoryMetrics.reduce((sum: number, m) => sum + (m.avgWorkoutsPerWeek || 0), 0) / Math.max(1, categoryMetrics.length);
  const avgIntensity = categoryMetrics.reduce((sum: number, m) => sum + (m.intensityScore || 0), 0) / Math.max(1, categoryMetrics.length);
  const totalRecords = categoryMetrics.reduce((sum: number, m) => sum + (m.personalRecords || 0), 0);
  const avgStrength = categoryMetrics.reduce((sum: number, m) => sum + (m.progressTrend?.strength || 0), 0) / Math.max(1, categoryMetrics.length);

  // Determinar tendencia general basada en muscleBalance (más confiable)
  const improvingCount = muscleBalanceData.filter((b) => b.balanceHistory?.trend === 'improving').length;
  const stableCount = muscleBalanceData.filter((b) => b.balanceHistory?.trend === 'stable').length;
  const decliningCount = muscleBalanceData.filter((b) => b.balanceHistory?.trend === 'declining').length;

  // Lógica mejorada: si la mayoría está mejorando, es improving
  let trend = 'stable';
  if (improvingCount > decliningCount && improvingCount > stableCount) {
    trend = 'improving';
  } else if (decliningCount > improvingCount && decliningCount > stableCount) {
    trend = 'declining';
  } else if (stableCount > improvingCount && stableCount > decliningCount) {
    trend = 'stable';
  } else if (improvingCount === decliningCount && improvingCount > 0) {
    trend = 'stable'; // Empate entre improving y declining
  } else if (improvingCount > 0) {
    trend = 'improving'; // Si hay al menos uno mejorando y no hay declining mayoritario
  }

  const chartData = {
    volume: meta.percentage,
    idealVolume: meta.idealPercentage,
    intensity: avgIntensity,
    frequency: totalFrequency,
    strength: avgStrength,
    records: totalRecords,
    trend: trend === 'improving' ? '+' : trend === 'declining' ? '-' : '='
  };

  return (
    <Card className="p-4 lg:p-5">
      <div id={`upper-lower-card-${meta.category.toLowerCase().replace(/\s+/g, '-')}`}>
        {/* Header con icono y estado */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 lg:p-2.5 rounded-lg bg-gradient-to-br ${meta.gradient} flex-shrink-0`}>
              <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-base lg:text-lg font-semibold text-white truncate">
                {meta.category}
              </h4>
              <p className="text-xs lg:text-sm text-gray-400">
                {formatNumberToString(meta.volume, 0)} kg total • {formatNumberToString(meta.percentage, 1)}% del volumen
              </p>
            </div>
          </div>

          {/* Estado balanceado/desequilibrado */}
          <div className="flex flex-col items-end space-y-1 flex-shrink-0">
            <span className={`text-xs px-2 py-1 rounded-full ${meta.isBalanced
              ? 'bg-green-500/20 text-green-400'
              : 'bg-yellow-500/20 text-yellow-400'
              }`}>
              {meta.isBalanced ? 'Equilibrado' : 'Desequilibrado'}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${trend === 'improving' ? 'bg-blue-500/20 text-blue-400' :
              trend === 'declining' ? 'bg-red-500/20 text-red-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
              {trend === 'improving' ? 'Mejorando' :
                trend === 'declining' ? 'Declinando' :
                  'Estable'}
            </span>
          </div>
        </div>

        {/* Dashboard universal */}
        <CategoryDashboardChart
          data={chartData}
          color={meta.color}
        />

        {/* Categorías incluidas */}
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <h5 className="text-xs lg:text-sm font-medium text-gray-400 mb-2">Incluye:</h5>
          <div className="space-y-1">
            {meta.categories.map((category: string) => {
              const catData = categoryAnalysis.categoryMetrics.find((m) => m.category === category);
              return (
                <div key={category} className="flex justify-between text-xs">
                  <span className="text-gray-500">{category}</span>
                  <span className="text-gray-400">
                    {catData ? formatNumberToString(catData.percentage, 1) + '%' : '0%'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}; 