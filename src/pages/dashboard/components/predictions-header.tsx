import { StatCard } from '@/components/stat-card';
import { AlertTriangle, BarChart, TrendingUp, Trophy } from 'lucide-react';
import React from 'react';

export interface PredictionsHeaderProps {
  centralizedMetrics: {
    nextWeekWeight: number;
    prWeight: number;
    monthlyGrowth: number;
    plateauRisk: number;
    trendAnalysis: string;
    strengthTrend: number;
    volumeTrend: number;
    prConfidence: number;
    confidenceLevel: number;
  };
  predictionMetrics: {
    dataQuality: {
      qualityScore: number;
      validRecords: number;
      dataSpan: number;
      hasRecentData: boolean;
    };
    formattedImprovement: string;
    formattedBaseline: string;
  };
  confidenceInfo: {
    level: string;
    color: string;
  };
}

export const PredictionsHeader: React.FC<PredictionsHeaderProps> = ({
  centralizedMetrics,
  predictionMetrics,
  confidenceInfo
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <StatCard
        title="Próxima Semana"
        value={`${centralizedMetrics.nextWeekWeight}kg`}
        icon={TrendingUp}
        variant={centralizedMetrics.trendAnalysis === 'mejorando' ? 'success' :
          centralizedMetrics.trendAnalysis === 'empeorando' ? 'danger' : 'warning'}
        tooltip={`Peso estimado basado en tendencia de ${centralizedMetrics.strengthTrend > 0 ? '+' : ''}${centralizedMetrics.strengthTrend}kg/semana. Confianza: ${confidenceInfo.level}. Calidad datos: ${predictionMetrics.dataQuality.qualityScore}/100.`}
        tooltipPosition="top"
      />
      <StatCard
        title="Próximo PR"
        value={`${centralizedMetrics.prWeight}kg`}
        icon={Trophy}
        variant={centralizedMetrics.prConfidence >= 70 ? 'success' :
          centralizedMetrics.prConfidence >= 50 ? 'warning' : 'danger'}
        tooltip={`Récord personal estimado con ${centralizedMetrics.prConfidence}% de confianza. Mejora de ${predictionMetrics.formattedImprovement} vs baseline ${predictionMetrics.formattedBaseline}kg. Algoritmo considera ${predictionMetrics.dataQuality.validRecords} entrenamientos válidos.`}
        tooltipPosition="top"
      />
      <StatCard
        title="Crecimiento Mensual"
        value={`+${centralizedMetrics.monthlyGrowth}kg`}
        icon={BarChart}
        variant={centralizedMetrics.monthlyGrowth > 5 ? 'success' :
          centralizedMetrics.monthlyGrowth > 2 ? 'warning' : 'danger'}
        tooltip={`Crecimiento proyectado basado en tendencia semanal de ${centralizedMetrics.strengthTrend > 0 ? '+' : ''}${centralizedMetrics.strengthTrend}kg. Span de datos: ${predictionMetrics.dataQuality.dataSpan} días. ${predictionMetrics.dataQuality.hasRecentData ? 'Incluye datos recientes.' : 'Sin datos recientes - precisión reducida.'}`}
        tooltipPosition="top"
      />
      <StatCard
        title="Riesgo Meseta"
        value={`${centralizedMetrics.plateauRisk}%`}
        icon={AlertTriangle}
        variant={centralizedMetrics.plateauRisk < 30 ? 'success' :
          centralizedMetrics.plateauRisk <= 60 ? 'warning' : 'danger'}
        tooltip={`Probabilidad de estancamiento calculada con ${predictionMetrics.dataQuality.validRecords} registros. Factores: variabilidad de progreso, consistencia temporal, tendencias recientes. ≤30% = bajo riesgo, 31-60% = moderado, >60% = alto riesgo.`}
        tooltipPosition="top"
      />
    </div>
  );
}; 