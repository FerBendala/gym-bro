import type { WorkoutRecord } from '@/interfaces';
import { calculateAdvancedAnalysis } from '@/utils/functions';
import { useMemo } from 'react';
import { AlertTriangle, Calendar, Clock, Target, TrendingUp, Zap } from 'lucide-react';

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

  // Generar sugerencias de optimización categorizadas
  const categorizedSuggestions = useMemo(() => {
    const suggestions: Array<{
      category: 'frequency' | 'intensity' | 'recovery' | 'planning' | 'progress' | 'balance' | 'technique';
      priority: 'low' | 'medium' | 'high';
      icon: React.ComponentType<{ className?: string }>;
      title: string;
      description: string;
      action: string;
    }> = [];

    // Análisis de frecuencia
    const weeklyFrequency = records.filter(r => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return r.date >= weekAgo;
    }).length;

    if (weeklyFrequency < 3) {
      suggestions.push({
        category: 'frequency',
        priority: 'high',
        icon: Calendar,
        title: 'Aumentar Frecuencia',
        description: `Solo ${weeklyFrequency} entrenamientos esta semana`,
        action: 'Planifica 3-4 sesiones semanales para mejor progreso'
      });
    }

    // Análisis de intensidad
    if (analysis.intensityMetrics.overallIntensity === 'Baja') {
      suggestions.push({
        category: 'intensity',
        priority: 'medium',
        icon: Zap,
        title: 'Aumentar Intensidad',
        description: 'Intensidad de entrenamiento baja',
        action: 'Incrementa pesos gradualmente cuando sea posible'
      });
    } else if (analysis.intensityMetrics.overallIntensity === 'Excesiva') {
      suggestions.push({
        category: 'intensity',
        priority: 'high',
        icon: AlertTriangle,
        title: 'Reducir Intensidad',
        description: 'Intensidad excesiva - riesgo de lesión',
        action: 'Implementa semana de descarga con 70% del peso habitual'
      });
    }

    // Análisis de recuperación
    if (analysis.fatigueAnalysis.fatigueIndex > 70) {
      suggestions.push({
        category: 'recovery',
        priority: 'high',
        icon: AlertTriangle,
        title: 'Descanso Inmediato',
        description: `Fatiga crítica (${analysis.fatigueAnalysis.fatigueIndex}%)`,
        action: 'Toma 2-3 días de descanso completo antes de retomar'
      });
    }

    // Análisis de planificación
    if (analysis.progressPrediction.plateauRisk > 80) {
      suggestions.push({
        category: 'planning',
        priority: 'high',
        icon: Target,
        title: 'Cambiar Rutina',
        description: `Riesgo crítico de meseta (${analysis.progressPrediction.plateauRisk}%)`,
        action: 'Varía ejercicios, rep ranges y esquemas de entrenamiento'
      });
    }

    // Análisis de progreso
    if (analysis.progressPrediction.trendAnalysis === 'empeorando') {
      suggestions.push({
        category: 'progress',
        priority: 'medium',
        icon: TrendingUp,
        title: 'Revisar Estrategia',
        description: 'Tendencia negativa detectada',
        action: 'Evalúa rutina, nutrición y descanso'
      });
    }

    // Análisis de eficiencia
    if (analysis.trainingEfficiency.timeEfficiencyScore < 40) {
      suggestions.push({
        category: 'technique',
        priority: 'medium',
        icon: Clock,
        title: 'Optimizar Tiempo',
        description: `Baja eficiencia (${analysis.trainingEfficiency.timeEfficiencyScore}%)`,
        action: 'Reduce descansos entre series o aumenta peso'
      });
    }

    return suggestions.slice(0, 4);
  }, [records, analysis]);

  return {
    analysis,
    enhancedPerformanceIndicators,
    categorizedSuggestions
  };
}; 