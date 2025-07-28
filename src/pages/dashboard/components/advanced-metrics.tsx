import { StatCard } from '@/components/stat-card';
import { Activity, AlertTriangle, Shield, Target } from 'lucide-react';
import React from 'react';

interface AdvancedMetricsProps {
  analysis: {
    fatigueAnalysis: {
      fatigueIndex: number;
      overreachingRisk: string;
    };
    progressPrediction: {
      nextWeekWeight: number;
      trendAnalysis: string;
      plateauRisk: number;
    };
  };
}

export const AdvancedMetrics: React.FC<AdvancedMetricsProps> = ({ analysis }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <StatCard
        title="Índice de Fatiga"
        value={`${Math.round(analysis.fatigueAnalysis.fatigueIndex)}/100`}
        icon={Activity}
        variant={analysis.fatigueAnalysis.fatigueIndex < 30 ? 'success' :
          analysis.fatigueAnalysis.fatigueIndex > 70 ? 'danger' : 'warning'}
        tooltip="Evaluación de tu nivel de fatiga actual. <30 es óptimo, 30-70 moderado, >70 requiere descanso."
      />
      <StatCard
        title="Riesgo Sobreentrenamiento"
        value={analysis.fatigueAnalysis.overreachingRisk}
        icon={Shield}
        variant={analysis.fatigueAnalysis.overreachingRisk === 'Bajo' ? 'success' :
          analysis.fatigueAnalysis.overreachingRisk === 'Alto' ? 'danger' : 'warning'}
        tooltip="Evaluación del riesgo de entrenar más allá de tu capacidad de recuperación."
      />
      <StatCard
        title="Progreso Predicho"
        value={`${Math.round(analysis.progressPrediction.nextWeekWeight)}kg`}
        icon={Target}
        variant={analysis.progressPrediction.trendAnalysis === 'mejorando' ? 'success' :
          analysis.progressPrediction.trendAnalysis === 'empeorando' ? 'danger' : 'warning'}
        tooltip="Peso estimado que podrías manejar la próxima semana basado en tu progresión actual."
      />
      <StatCard
        title="Riesgo Meseta"
        value={`${Math.round(analysis.progressPrediction.plateauRisk)}%`}
        icon={AlertTriangle}
        variant={analysis.progressPrediction.plateauRisk < 30 ? 'success' :
          analysis.progressPrediction.plateauRisk <= 60 ? 'warning' : 'danger'}
        tooltip="Probabilidad de entrar en una meseta de progreso. ≤30% es bajo riesgo, 31-60% moderado, >60% alto riesgo de estancamiento."
      />
    </div>
  );
}; 