import React from 'react';

import { AdvancedMetricsCard, BalanceStatusCard, MetricCards, MuscleGroupsSummary, RadarChartCard } from '.';

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

  // Calcular métricas adicionales con validaciones
  const balancedGroups = muscleBalance.filter(b => b.percentage >= (b.idealPercentage || 0) * 0.9).length;
  const totalGroups = muscleBalance.length;
  const balanceRatio = totalGroups > 0 ? (balancedGroups / totalGroups) * 100 : 0;

  const avgVolume = muscleBalance.length > 0
    ? muscleBalance.reduce((sum, group) => sum + (group.totalVolume || 0), 0) / muscleBalance.length
    : 0;

  const volumeVariation = muscleBalance.length > 0
    ? Math.max(...muscleBalance.map(g => g.totalVolume || 0)) - Math.min(...muscleBalance.map(g => g.totalVolume || 0))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Principal con Score */}
      <BalanceStatusCard balanceScore={balanceScore} />

      {/* Métricas Principales */}
      <MetricCards
        finalConsistency={finalConsistency}
        avgIntensity={avgIntensity}
        avgFrequency={avgFrequency}
        balancedGroups={balancedGroups}
        totalGroups={totalGroups}
      />

      {/* Análisis Detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Radar */}
        <RadarChartCard
          balanceScore={balanceScore}
          finalConsistency={finalConsistency}
          avgIntensity={avgIntensity}
          avgFrequency={avgFrequency}
        />

        {/* Métricas Avanzadas */}
        <AdvancedMetricsCard
          balanceRatio={balanceRatio}
          avgVolume={avgVolume}
          volumeVariation={volumeVariation}
          balanceLevel={balanceLevel}
        />
      </div>

      {/* Resumen de Grupos Musculares */}
      <MuscleGroupsSummary muscleBalance={muscleBalance} />
    </div>
  );
};
