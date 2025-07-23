import type { WorkoutRecord } from '@/interfaces';
import { calculateAdvancedAnalysis } from '@/utils/functions';
import { useMemo } from 'react';


export const useAdvancedTab = (records: WorkoutRecord[]) => {
  const analysis = useMemo(() => calculateAdvancedAnalysis(records), [records]);

  const enhancedPerformanceIndicators = useMemo(() => {
    const indicators: Array<{
      type: 'excellent' | 'good' | 'warning' | 'critical';
      icon: string;
      title: string;
      description: string;
      value?: string;
      progress?: number;
    }> = [];

    // Análisis de consistencia
    const weeklyFrequency = records.filter(r => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return r.date >= weekAgo;
    }).length;

    if (weeklyFrequency >= 5) {
      indicators.push({
        type: 'excellent',
        icon: '📅',
        title: 'Consistencia Extraordinaria',
        description: `${weeklyFrequency} entrenamientos esta semana`,
        value: `${weeklyFrequency}/7 días`,
        progress: Math.min(100, (weeklyFrequency / 5) * 100)
      });
    } else if (weeklyFrequency >= 3) {
      indicators.push({
        type: 'good',
        icon: '📅',
        title: 'Buena Consistencia',
        description: `${weeklyFrequency} entrenamientos esta semana`,
        value: `${weeklyFrequency}/7 días`,
        progress: (weeklyFrequency / 5) * 100
      });
    } else if (weeklyFrequency >= 1) {
      indicators.push({
        type: 'warning',
        icon: '📅',
        title: 'Consistencia Baja',
        description: `Solo ${weeklyFrequency} entrenamiento esta semana`,
        value: `${weeklyFrequency}/7 días`,
        progress: (weeklyFrequency / 5) * 100
      });
    }

    // Análisis de fatiga
    if (analysis.fatigueAnalysis.fatigueIndex <= 30) {
      indicators.push({
        type: 'excellent',
        icon: '🛡️',
        title: 'Recuperación Óptima',
        description: 'Bajo riesgo de sobreentrenamiento',
        value: `${100 - analysis.fatigueAnalysis.fatigueIndex}%`,
        progress: 100 - analysis.fatigueAnalysis.fatigueIndex
      });
    } else if (analysis.fatigueAnalysis.fatigueIndex > 70) {
      indicators.push({
        type: 'critical',
        icon: '⚠️',
        title: 'Riesgo de Fatiga',
        description: 'Alto riesgo de sobreentrenamiento',
        value: `${analysis.fatigueAnalysis.fatigueIndex}%`,
        progress: analysis.fatigueAnalysis.fatigueIndex
      });
    }

    return indicators.slice(0, 4);
  }, [records, analysis]);

  return {
    analysis,
    enhancedPerformanceIndicators
  };
}; 