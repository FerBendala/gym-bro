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
    } else if (weeklyFrequency >= 5) {
      suggestions.push({
        category: 'frequency',
        priority: 'low',
        icon: Calendar,
        title: 'Frecuencia Excelente',
        description: `${weeklyFrequency} entrenamientos esta semana - consistencia excepcional`,
        action: 'Mantén este ritmo y considera periodización avanzada'
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
    } else if (analysis.intensityMetrics.overallIntensity === 'Óptima') {
      suggestions.push({
        category: 'intensity',
        priority: 'low',
        icon: Target,
        title: 'Intensidad Perfecta',
        description: 'Balance ideal entre peso, volumen y frecuencia',
        action: 'Mantén esta intensidad y progresa gradualmente cada 2-3 semanas'
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
    } else if (analysis.fatigueAnalysis.fatigueIndex <= 30) {
      suggestions.push({
        category: 'recovery',
        priority: 'low',
        icon: Target,
        title: 'Recuperación Óptima',
        description: `Baja fatiga (${analysis.fatigueAnalysis.fatigueIndex}%) - estado ideal`,
        action: 'Puedes aumentar volumen o intensidad gradualmente'
      });
    }

    // Análisis de planificación
    if (analysis.progressPrediction.plateauRisk > 80) {
      suggestions.push({
        category: 'planning',
        priority: 'high',
        icon: AlertTriangle,
        title: 'Cambiar Rutina',
        description: `Riesgo crítico de meseta (${analysis.progressPrediction.plateauRisk}%)`,
        action: 'Varía ejercicios, rep ranges y esquemas de entrenamiento'
      });
    } else if (analysis.progressPrediction.plateauRisk < 20) {
      suggestions.push({
        category: 'planning',
        priority: 'low',
        icon: Target,
        title: 'Progreso Sostenible',
        description: `Bajo riesgo de meseta (${analysis.progressPrediction.plateauRisk}%)`,
        action: 'Mantén rutina actual y planifica variaciones para dentro de 4-6 semanas'
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
    } else if (analysis.progressPrediction.trendAnalysis === 'mejorando') {
      suggestions.push({
        category: 'progress',
        priority: 'low',
        icon: TrendingUp,
        title: 'Progreso Excelente',
        description: 'Tendencia positiva detectada',
        action: 'Continúa con tu estrategia actual y documenta qué funciona'
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
    } else if (analysis.trainingEfficiency.timeEfficiencyScore > 90) {
      suggestions.push({
        category: 'technique',
        priority: 'low',
        icon: Target,
        title: 'Eficiencia Excelente',
        description: `Alta eficiencia (${analysis.trainingEfficiency.timeEfficiencyScore}%)`,
        action: 'Mantén este ritmo y considera si puedes añadir volumen gradualmente'
      });
    }

    // Análisis de volumen (nuevo)
    const recentVolume = records.slice(-7).reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
    const avgVolume = records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0) / records.length;
    
    if (recentVolume > avgVolume * 1.5) {
      suggestions.push({
        category: 'intensity',
        priority: 'medium',
        icon: Zap,
        title: 'Volumen Alto Reciente',
        description: 'Volumen superior al promedio en la última semana',
        action: 'Monitorea recuperación y considera descanso adicional'
      });
    } else if (recentVolume < avgVolume * 0.7) {
      suggestions.push({
        category: 'intensity',
        priority: 'medium',
        icon: Target,
        title: 'Volumen Bajo Reciente',
        description: 'Volumen inferior al promedio en la última semana',
        action: 'Considera aumentar carga o volumen gradualmente'
      });
    }

    // Si no hay suficientes sugerencias, agregar recomendaciones generales
    if (suggestions.length < 2) {
      suggestions.push({
        category: 'planning',
        priority: 'low',
        icon: Target,
        title: 'Mantener Consistencia',
        description: 'Tu entrenamiento está bien estructurado',
        action: 'Continúa con tu rutina actual y monitorea progreso'
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