import {
  Activity, AlertTriangle, Award,
  Brain, Calendar, CheckCircle,
  Clock, Shield, Target, TrendingUp, Zap
} from 'lucide-react';
import React, { useMemo } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { calculateAdvancedAnalysis, getLastWeekRecords, getThisWeekRecords } from '../../../utils/functions/advanced-analysis';
import { formatNumber } from '../../../utils/functions/stats-utils';
import { Card, CardContent, CardHeader } from '../../card';
import { StatCard } from '../../stat-card';
import { InfoTooltip } from '../../tooltip';

interface AdvancedTabProps {
  records: WorkoutRecord[];
}

export const AdvancedTab: React.FC<AdvancedTabProps> = ({ records }) => {
  const analysis = useMemo(() => calculateAdvancedAnalysis(records), [records]);

  // Generar indicadores de rendimiento mejorados
  const enhancedPerformanceIndicators = useMemo(() => {
    const indicators: Array<{
      type: 'excellent' | 'good' | 'warning' | 'critical';
      icon: React.ComponentType<{ className?: string }>;
      title: string;
      description: string;
      value?: string;
      progress?: number;
    }> = [];

    // 1. ANÁLISIS DE CONSISTENCIA (siempre mostrar)
    const thisWeekRecords = getThisWeekRecords(records);
    const lastWeekRecords = getLastWeekRecords(records);
    const weeklyFrequency = thisWeekRecords.length;
    const lastWeekFrequency = lastWeekRecords.length;

    if (weeklyFrequency >= 5) {
      indicators.push({
        type: 'excellent',
        icon: Calendar,
        title: 'Consistencia Extraordinaria',
        description: `${weeklyFrequency} entrenamientos esta semana - disciplina excepcional`,
        value: `${weeklyFrequency}/7 días`,
        progress: Math.min(100, (weeklyFrequency / 5) * 100)
      });
    } else if (weeklyFrequency >= 4) {
      indicators.push({
        type: 'excellent',
        icon: Calendar,
        title: 'Consistencia Excelente',
        description: `${weeklyFrequency} entrenamientos esta semana - rutina muy sólida`,
        value: `${weeklyFrequency}/7 días`,
        progress: (weeklyFrequency / 5) * 100
      });
    } else if (weeklyFrequency >= 3) {
      indicators.push({
        type: 'good',
        icon: Calendar,
        title: 'Buena Consistencia',
        description: `${weeklyFrequency} entrenamientos esta semana - mantén el ritmo`,
        value: `${weeklyFrequency}/7 días`,
        progress: (weeklyFrequency / 5) * 100
      });
    } else if (weeklyFrequency >= 2) {
      indicators.push({
        type: 'warning',
        icon: Calendar,
        title: 'Consistencia Moderada',
        description: `${weeklyFrequency} entrenamientos esta semana - puedes mejorar`,
        value: `${weeklyFrequency}/7 días`,
        progress: (weeklyFrequency / 5) * 100
      });
    } else if (weeklyFrequency >= 1) {
      indicators.push({
        type: 'critical',
        icon: Calendar,
        title: 'Consistencia Baja',
        description: `Solo ${weeklyFrequency} entrenamiento esta semana - necesitas más frecuencia`,
        value: `${weeklyFrequency}/7 días`,
        progress: (weeklyFrequency / 5) * 100
      });
    } else {
      indicators.push({
        type: 'critical',
        icon: Calendar,
        title: 'Sin Entrenamientos',
        description: 'No has entrenado esta semana - ¡es hora de retomar!',
        value: '0/7 días',
        progress: 0
      });
    }

    // 2. ANÁLISIS DE TENDENCIA DE FRECUENCIA
    if (weeklyFrequency > lastWeekFrequency && lastWeekFrequency > 0) {
      const improvement = weeklyFrequency - lastWeekFrequency;
      indicators.push({
        type: 'excellent',
        icon: TrendingUp,
        title: 'Frecuencia en Ascenso',
        description: `+${improvement} entrenamientos vs semana pasada - ¡excelente progresión!`,
        value: `+${improvement}`,
        progress: Math.min(100, (improvement / 3) * 100)
      });
    } else if (weeklyFrequency < lastWeekFrequency && lastWeekFrequency > 0) {
      const decline = lastWeekFrequency - weeklyFrequency;
      indicators.push({
        type: 'warning',
        icon: TrendingUp,
        title: 'Frecuencia en Descenso',
        description: `-${decline} entrenamientos vs semana pasada - mantén la motivación`,
        value: `-${decline}`,
        progress: Math.max(0, 100 - (decline / 3) * 100)
      });
    }

    // 3. ANÁLISIS DE PROGRESO (mejorado)
    const recentComparison = analysis.periodComparisons.find(p => p.periodName === 'Último mes');
    if (recentComparison) {
      if (recentComparison.improvement > 15) {
        indicators.push({
          type: 'excellent',
          icon: Award,
          title: 'Progreso Sobresaliente',
          description: `${recentComparison.improvement}% mejora - ¡rendimiento excepcional!`,
          value: `+${recentComparison.improvement}%`,
          progress: Math.min(100, recentComparison.improvement * 2)
        });
      } else if (recentComparison.improvement > 10) {
        indicators.push({
          type: 'excellent',
          icon: TrendingUp,
          title: 'Progreso Destacado',
          description: `${recentComparison.improvement}% mejora en rendimiento general`,
          value: `+${recentComparison.improvement}%`,
          progress: Math.min(100, recentComparison.improvement * 3)
        });
      } else if (recentComparison.improvement > 5) {
        indicators.push({
          type: 'good',
          icon: TrendingUp,
          title: 'Progreso Constante',
          description: `${recentComparison.improvement}% mejora mantenida`,
          value: `+${recentComparison.improvement}%`,
          progress: Math.min(100, recentComparison.improvement * 5)
        });
      } else if (recentComparison.improvement > 0) {
        indicators.push({
          type: 'good',
          icon: TrendingUp,
          title: 'Progreso Leve',
          description: `${recentComparison.improvement}% mejora - sigue así`,
          value: `+${recentComparison.improvement}%`,
          progress: Math.min(100, recentComparison.improvement * 10)
        });
      } else if (recentComparison.improvement > -5) {
        indicators.push({
          type: 'warning',
          icon: TrendingUp,
          title: 'Progreso Estancado',
          description: `${Math.abs(recentComparison.improvement)}% cambio - considera variar rutina`,
          value: `${recentComparison.improvement}%`,
          progress: 50
        });
      } else {
        indicators.push({
          type: 'critical',
          icon: TrendingUp,
          title: 'Declive en Progreso',
          description: `${recentComparison.improvement}% decline - revisa estrategia`,
          value: `${recentComparison.improvement}%`,
          progress: Math.max(0, 50 + recentComparison.improvement * 2)
        });
      }
    }

    // 4. ANÁLISIS DE INTENSIDAD (expandido)
    const intensityScore = (analysis.intensityMetrics.averageIntensity + analysis.intensityMetrics.volumeIntensity + analysis.intensityMetrics.frequencyIntensity) / 3;

    if (analysis.intensityMetrics.overallIntensity === 'Óptima') {
      indicators.push({
        type: 'excellent',
        icon: Zap,
        title: 'Intensidad Perfecta',
        description: 'Balance ideal entre volumen, peso y frecuencia',
        value: `${Math.round(intensityScore)}%`,
        progress: intensityScore
      });
    } else if (analysis.intensityMetrics.overallIntensity === 'Alta') {
      indicators.push({
        type: 'good',
        icon: Zap,
        title: 'Alta Intensidad',
        description: 'Entrenamiento intenso, monitorea la recuperación',
        value: `${Math.round(intensityScore)}%`,
        progress: intensityScore
      });
    } else if (analysis.intensityMetrics.overallIntensity === 'Baja') {
      indicators.push({
        type: 'warning',
        icon: Zap,
        title: 'Intensidad Baja',
        description: 'Considera aumentar peso, volumen o frecuencia',
        value: `${Math.round(intensityScore)}%`,
        progress: intensityScore
      });
    } else if (analysis.intensityMetrics.overallIntensity === 'Excesiva') {
      indicators.push({
        type: 'critical',
        icon: AlertTriangle,
        title: 'Intensidad Excesiva',
        description: 'Riesgo alto - considera semana de descarga',
        value: `${Math.round(intensityScore)}%`,
        progress: intensityScore
      });
    }

    // 5. ANÁLISIS DE RECUPERACIÓN (mejorado)
    if (analysis.fatigueAnalysis.overreachingRisk === 'Bajo' && analysis.fatigueAnalysis.fatigueIndex <= 30) {
      indicators.push({
        type: 'excellent',
        icon: Shield,
        title: 'Recuperación Óptima',
        description: 'Estado ideal - bajo riesgo de sobreentrenamiento',
        value: `${100 - analysis.fatigueAnalysis.fatigueIndex}%`,
        progress: 100 - analysis.fatigueAnalysis.fatigueIndex
      });
    } else if (analysis.fatigueAnalysis.overreachingRisk === 'Bajo') {
      indicators.push({
        type: 'good',
        icon: Shield,
        title: 'Recuperación Adecuada',
        description: 'Bajo riesgo de sobreentrenamiento',
        value: `${100 - analysis.fatigueAnalysis.fatigueIndex}%`,
        progress: 100 - analysis.fatigueAnalysis.fatigueIndex
      });
    } else if (analysis.fatigueAnalysis.overreachingRisk === 'Medio') {
      indicators.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Fatiga Moderada',
        description: 'Monitorea síntomas y considera más descanso',
        value: `${analysis.fatigueAnalysis.fatigueIndex}%`,
        progress: analysis.fatigueAnalysis.fatigueIndex
      });
    } else {
      indicators.push({
        type: 'critical',
        icon: AlertTriangle,
        title: 'Riesgo de Fatiga',
        description: 'Alto riesgo de sobreentrenamiento - descanso necesario',
        value: `${analysis.fatigueAnalysis.fatigueIndex}%`,
        progress: analysis.fatigueAnalysis.fatigueIndex
      });
    }

    // 6. ANÁLISIS DE VOLUMEN PERSONAL
    const recentVolume = thisWeekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
    const lastWeekVolume = lastWeekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

    if (recentVolume > 0 && lastWeekVolume > 0) {
      const volumeChange = ((recentVolume - lastWeekVolume) / lastWeekVolume) * 100;
      if (volumeChange > 20) {
        indicators.push({
          type: 'excellent',
          icon: Activity,
          title: 'Volumen en Alza',
          description: `+${Math.round(volumeChange)}% volumen vs semana pasada`,
          value: `+${Math.round(volumeChange)}%`,
          progress: Math.min(100, volumeChange * 2)
        });
      } else if (volumeChange < -20) {
        indicators.push({
          type: 'warning',
          icon: Activity,
          title: 'Volumen Reducido',
          description: `${Math.round(volumeChange)}% volumen vs semana pasada`,
          value: `${Math.round(volumeChange)}%`,
          progress: Math.max(0, 100 + volumeChange)
        });
      }
    } else if (recentVolume > 0 && lastWeekVolume === 0) {
      indicators.push({
        type: 'excellent',
        icon: Activity,
        title: 'Retorno al Entrenamiento',
        description: 'Excelente trabajo retomando los entrenamientos',
        value: `${Math.round(recentVolume / 1000)}k kg`,
        progress: 100
      });
    }

    // 7. ANÁLISIS DE PREDICCIÓN
    if (analysis.progressPrediction.monthlyGrowthRate > 8) {
      indicators.push({
        type: 'excellent',
        icon: Target,
        title: 'Proyección Excepcional',
        description: `Crecimiento proyectado: ${analysis.progressPrediction.monthlyGrowthRate}kg/mes`,
        value: `+${analysis.progressPrediction.monthlyGrowthRate}kg`,
        progress: Math.min(100, analysis.progressPrediction.monthlyGrowthRate * 8)
      });
    } else if (analysis.progressPrediction.monthlyGrowthRate > 5) {
      indicators.push({
        type: 'excellent',
        icon: Target,
        title: 'Proyección Positiva',
        description: `Crecimiento esperado: ${analysis.progressPrediction.monthlyGrowthRate}kg/mes`,
        value: `+${analysis.progressPrediction.monthlyGrowthRate}kg`,
        progress: Math.min(100, analysis.progressPrediction.monthlyGrowthRate * 12)
      });
    } else if (analysis.progressPrediction.monthlyGrowthRate > 2) {
      indicators.push({
        type: 'good',
        icon: Target,
        title: 'Proyección Moderada',
        description: `Crecimiento esperado: ${analysis.progressPrediction.monthlyGrowthRate}kg/mes`,
        value: `+${analysis.progressPrediction.monthlyGrowthRate}kg`,
        progress: Math.min(100, analysis.progressPrediction.monthlyGrowthRate * 20)
      });
    } else if (analysis.progressPrediction.monthlyGrowthRate <= 0) {
      indicators.push({
        type: 'warning',
        icon: Target,
        title: 'Proyección Estancada',
        description: 'Proyección de crecimiento limitada - considera cambios',
        value: `${analysis.progressPrediction.monthlyGrowthRate}kg`,
        progress: 30
      });
    }

    // 8. ANÁLISIS DE MESETA
    if (analysis.progressPrediction.plateauRisk <= 20) {
      indicators.push({
        type: 'excellent',
        icon: TrendingUp,
        title: 'Sin Riesgo de Meseta',
        description: 'Progreso sostenible - baja probabilidad de estancamiento',
        value: `${analysis.progressPrediction.plateauRisk}%`,
        progress: 100 - analysis.progressPrediction.plateauRisk
      });
    } else if (analysis.progressPrediction.plateauRisk > 70) {
      indicators.push({
        type: 'critical',
        icon: AlertTriangle,
        title: 'Alto Riesgo Meseta',
        description: 'Probabilidad alta de estancamiento - varía tu rutina',
        value: `${analysis.progressPrediction.plateauRisk}%`,
        progress: analysis.progressPrediction.plateauRisk
      });
    } else if (analysis.progressPrediction.plateauRisk > 50) {
      indicators.push({
        type: 'warning',
        icon: Target,
        title: 'Riesgo Moderado Meseta',
        description: 'Considera variaciones en ejercicios y rangos',
        value: `${analysis.progressPrediction.plateauRisk}%`,
        progress: analysis.progressPrediction.plateauRisk
      });
    }

    // Limitar a máximo 6 indicadores para no saturar la UI
    // Ordenar por tipo: excellent/good (verde) > warning (amarillo) > critical (rojo)
    const sortedIndicators = indicators.sort((a, b) => {
      const priorityOrder = {
        'excellent': 1,
        'good': 2,
        'warning': 3,
        'critical': 4
      };
      return priorityOrder[a.type] - priorityOrder[b.type];
    });

    return sortedIndicators.slice(0, 6);
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

    // 1. ANÁLISIS DE FRECUENCIA (mejorado)
    const thisWeekRecords = getThisWeekRecords(records);
    const lastWeekRecords = getLastWeekRecords(records);
    const weeklyFrequency = thisWeekRecords.length;
    const lastWeekFrequency = lastWeekRecords.length;

    if (weeklyFrequency === 0) {
      suggestions.push({
        category: 'frequency',
        priority: 'high',
        icon: AlertTriangle,
        title: 'Retomar Entrenamientos',
        description: 'No has entrenado esta semana - la consistencia es clave',
        action: 'Programa al menos 2 sesiones esta semana para retomar el hábito'
      });
    } else if (weeklyFrequency === 1) {
      suggestions.push({
        category: 'frequency',
        priority: 'high',
        icon: Calendar,
        title: 'Aumentar Frecuencia Mínima',
        description: 'Solo 1 entrenamiento esta semana - insuficiente para progreso',
        action: 'Añade al menos 1-2 sesiones más para alcanzar el mínimo efectivo'
      });
    } else if (weeklyFrequency === 2) {
      suggestions.push({
        category: 'frequency',
        priority: 'medium',
        icon: Calendar,
        title: 'Incrementar a Frecuencia Óptima',
        description: '2 entrenamientos semanales - puedes mejorar significativamente',
        action: 'Planifica 3-4 sesiones semanales para maximizar resultados'
      });
    } else if (weeklyFrequency > 6) {
      suggestions.push({
        category: 'frequency',
        priority: 'medium',
        icon: Shield,
        title: 'Moderar Frecuencia Excesiva',
        description: `${weeklyFrequency} entrenamientos pueden ser contraproducentes`,
        action: 'Incluye 1-2 días de descanso completo para optimizar recuperación'
      });
    } else if (weeklyFrequency >= 5) {
      suggestions.push({
        category: 'frequency',
        priority: 'low',
        icon: Award,
        title: 'Excelente Frecuencia',
        description: `${weeklyFrequency} entrenamientos semanales - frecuencia ideal`,
        action: 'Mantén esta consistencia y monitorea señales de fatiga'
      });
    }

    // Análisis de tendencia de frecuencia
    if (weeklyFrequency < lastWeekFrequency && lastWeekFrequency >= 3) {
      const decline = lastWeekFrequency - weeklyFrequency;
      suggestions.push({
        category: 'frequency',
        priority: 'medium',
        icon: TrendingUp,
        title: 'Mantener Consistencia',
        description: `Bajaste ${decline} entrenamientos vs semana pasada`,
        action: 'Identifica obstáculos y planifica sesiones fijas en tu calendario'
      });
    }

    // 2. ANÁLISIS DE INTENSIDAD (expandido)
    const intensityScore = (analysis.intensityMetrics.averageIntensity + analysis.intensityMetrics.volumeIntensity + analysis.intensityMetrics.frequencyIntensity) / 3;

    if (analysis.intensityMetrics.overallIntensity === 'Baja') {
      if (analysis.intensityMetrics.averageIntensity < 40) {
        suggestions.push({
          category: 'intensity',
          priority: 'high',
          icon: Zap,
          title: 'Aumentar Cargas de Trabajo',
          description: `Intensidad de peso muy baja (${analysis.intensityMetrics.averageIntensity}%)`,
          action: 'Incrementa pesos 5-10% cuando puedas completar todas las series sin dificultad'
        });
      }
      if (analysis.intensityMetrics.volumeIntensity < 30) {
        suggestions.push({
          category: 'intensity',
          priority: 'medium',
          icon: Activity,
          title: 'Incrementar Volumen de Entrenamiento',
          description: `Volumen por sesión bajo (${analysis.intensityMetrics.volumeIntensity}%)`,
          action: 'Añade 1-2 series por ejercicio o incluye ejercicios accesorios'
        });
      }
    } else if (analysis.intensityMetrics.overallIntensity === 'Excesiva') {
      suggestions.push({
        category: 'intensity',
        priority: 'high',
        icon: AlertTriangle,
        title: 'Reducir Intensidad Inmediatamente',
        description: `Intensidad excesiva (${Math.round(intensityScore)}%) - riesgo de lesión`,
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

    // 3. ANÁLISIS DE RECUPERACIÓN (expandido)
    if (analysis.fatigueAnalysis.fatigueIndex > 70) {
      suggestions.push({
        category: 'recovery',
        priority: 'high',
        icon: AlertTriangle,
        title: 'Descanso Inmediato Necesario',
        description: `Fatiga crítica (${analysis.fatigueAnalysis.fatigueIndex}%) - riesgo de lesión`,
        action: 'Toma 2-3 días de descanso completo antes de retomar'
      });
    } else if (analysis.fatigueAnalysis.fatigueIndex > 50) {
      suggestions.push({
        category: 'recovery',
        priority: 'medium',
        icon: Shield,
        title: 'Priorizar Recuperación',
        description: `Índice de fatiga elevado (${analysis.fatigueAnalysis.fatigueIndex}%)`,
        action: 'Reduce intensidad 20% y enfócate en sueño y nutrición'
      });
    } else if (analysis.fatigueAnalysis.recoveryDays > 4) {
      suggestions.push({
        category: 'recovery',
        priority: 'low',
        icon: Activity,
        title: 'Retomar Gradualmente',
        description: `${analysis.fatigueAnalysis.recoveryDays} días sin entrenar - retorno progresivo`,
        action: 'Comienza con 70% de tu peso habitual para reacostumbrar al cuerpo'
      });
    } else if (analysis.fatigueAnalysis.fatigueIndex <= 30 && analysis.fatigueAnalysis.overreachingRisk === 'Bajo') {
      suggestions.push({
        category: 'recovery',
        priority: 'low',
        icon: CheckCircle,
        title: 'Recuperación Óptima',
        description: 'Estado ideal de recuperación - bajo riesgo de fatiga',
        action: 'Mantén rutina de sueño y nutrición para sostener este estado'
      });
    }

    // 4. ANÁLISIS DE PROGRESO (nuevo)
    const recentComparison = analysis.periodComparisons.find(p => p.periodName === 'Último mes');
    if (recentComparison) {
      if (recentComparison.improvement < -10) {
        suggestions.push({
          category: 'progress',
          priority: 'high',
          icon: TrendingUp,
          title: 'Revertir Declive en Rendimiento',
          description: `${Math.abs(recentComparison.improvement)}% decline en el último mes`,
          action: 'Revisa rutina, nutrición y descanso - considera asesoría profesional'
        });
      } else if (recentComparison.improvement < 0) {
        suggestions.push({
          category: 'progress',
          priority: 'medium',
          icon: Target,
          title: 'Estimular Nuevo Progreso',
          description: `Leve decline (${Math.abs(recentComparison.improvement)}%) en rendimiento`,
          action: 'Varía ejercicios, rangos de repeticiones o rutina de entrenamiento'
        });
      } else if (recentComparison.improvement > 15) {
        suggestions.push({
          category: 'progress',
          priority: 'low',
          icon: Award,
          title: 'Progreso Excepcional',
          description: `${recentComparison.improvement}% mejora en el último mes - ¡excelente!`,
          action: 'Continúa con tu estrategia actual y documenta qué funciona'
        });
      }
    }

    // 5. ANÁLISIS DE PLANIFICACIÓN (expandido)
    if (analysis.progressPrediction.plateauRisk > 80) {
      suggestions.push({
        category: 'planning',
        priority: 'high',
        icon: AlertTriangle,
        title: 'Meseta Inminente',
        description: `Riesgo crítico de estancamiento (${analysis.progressPrediction.plateauRisk}%)`,
        action: 'Cambia rutina inmediatamente - nuevos ejercicios, rep ranges y esquemas'
      });
    } else if (analysis.progressPrediction.plateauRisk > 60) {
      suggestions.push({
        category: 'planning',
        priority: 'medium',
        icon: Target,
        title: 'Prevenir Meseta Próxima',
        description: `Alto riesgo de estancamiento (${analysis.progressPrediction.plateauRisk}%)`,
        action: 'Planifica variaciones: periodización, nuevos ejercicios o técnicas avanzadas'
      });
    } else if (analysis.progressPrediction.plateauRisk < 20) {
      suggestions.push({
        category: 'planning',
        priority: 'low',
        icon: CheckCircle,
        title: 'Progreso Sostenible',
        description: `Bajo riesgo de meseta (${analysis.progressPrediction.plateauRisk}%) - rutina efectiva`,
        action: 'Mantén rutina actual y planifica variaciones para dentro de 4-6 semanas'
      });
    }

    // Análisis de predicciones
    if (analysis.progressPrediction.monthlyGrowthRate <= 0) {
      suggestions.push({
        category: 'planning',
        priority: 'high',
        icon: Brain,
        title: 'Replantear Estrategia',
        description: 'Proyección de crecimiento estancada - cambios necesarios',
        action: 'Evalúa rutina, nutrición y recuperación - considera nueva programación'
      });
    }

    // 6. ANÁLISIS DE VOLUMEN (nuevo)
    const recentVolume = thisWeekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
    const lastWeekVolume = lastWeekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

    if (recentVolume > 0 && lastWeekVolume > 0) {
      const volumeChange = ((recentVolume - lastWeekVolume) / lastWeekVolume) * 100;
      if (volumeChange < -30) {
        suggestions.push({
          category: 'intensity',
          priority: 'medium',
          icon: Activity,
          title: 'Volumen Significativamente Reducido',
          description: `${Math.abs(Math.round(volumeChange))}% menos volumen que la semana pasada`,
          action: 'Evalúa si es estratégico o necesitas retomar intensidad gradualmente'
        });
      } else if (volumeChange > 50) {
        suggestions.push({
          category: 'recovery',
          priority: 'medium',
          icon: Shield,
          title: 'Aumento Brusco de Volumen',
          description: `+${Math.round(volumeChange)}% más volumen - monitora recuperación`,
          action: 'Asegúrate de descansar adecuadamente y ajusta si aparece fatiga'
        });
      }
    }

    // 7. ANÁLISIS DE EFICIENCIA (nuevo)
    if (analysis.trainingEfficiency.timeEfficiencyScore < 40) {
      suggestions.push({
        category: 'technique',
        priority: 'medium',
        icon: Clock,
        title: 'Optimizar Eficiencia Temporal',
        description: `Baja eficiencia (${analysis.trainingEfficiency.timeEfficiencyScore}%) por sesión`,
        action: 'Reduce descansos entre series o aumenta peso para mayor estímulo'
      });
    } else if (analysis.trainingEfficiency.timeEfficiencyScore > 90) {
      suggestions.push({
        category: 'technique',
        priority: 'low',
        icon: Award,
        title: 'Eficiencia Temporal Excelente',
        description: `Alta eficiencia (${analysis.trainingEfficiency.timeEfficiencyScore}%) - uso óptimo del tiempo`,
        action: 'Mantén este ritmo y considera si puedes añadir volumen gradualmente'
      });
    }

    // 8. ANÁLISIS DE BALANCE (nuevo)
    const densityTrend = analysis.trainingDensity;
    if (densityTrend.length >= 2) {
      const currentDensity = densityTrend[0];
      const prevDensity = densityTrend[1];

      if (currentDensity.workoutsPerWeek < prevDensity.workoutsPerWeek * 0.7) {
        suggestions.push({
          category: 'balance',
          priority: 'medium',
          icon: TrendingUp,
          title: 'Decline en Densidad de Entrenamiento',
          description: `Reducción significativa en sesiones por semana`,
          action: 'Revisa agenda y elimina obstáculos para mantener consistencia'
        });
      }
    }

    // Ordenar por prioridad: high > medium > low
    const sortedSuggestions = suggestions.sort((a, b) => {
      const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Limitar a máximo 8 sugerencias para no saturar
    return sortedSuggestions.slice(0, 8);
  }, [records, analysis]);

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Brain className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Sin datos para análisis avanzado
        </h3>
        <p className="text-gray-500">
          Registra al menos 10 entrenamientos para obtener métricas avanzadas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicadores principales - Lo más importante primero */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Índice de Fatiga"
          value={`${analysis.fatigueAnalysis.fatigueIndex}/100`}
          icon={Activity}
          variant={analysis.fatigueAnalysis.fatigueIndex < 30 ? 'success' :
            analysis.fatigueAnalysis.fatigueIndex > 70 ? 'danger' : 'warning'}
          tooltip="Evaluación de tu nivel de fatiga actual. <30 es óptimo, 30-70 moderado, >70 requiere descanso."
          tooltipPosition="top"
        />
        <StatCard
          title="Riesgo Sobreentrenamiento"
          value={analysis.fatigueAnalysis.overreachingRisk}
          icon={Shield}
          variant={analysis.fatigueAnalysis.overreachingRisk === 'Bajo' ? 'success' :
            analysis.fatigueAnalysis.overreachingRisk === 'Alto' ? 'danger' : 'warning'}
          tooltip="Evaluación del riesgo de entrenar más allá de tu capacidad de recuperación."
          tooltipPosition="top"
        />
        <StatCard
          title="Progreso Predicho"
          value={`${analysis.progressPrediction.nextWeekWeight}kg`}
          icon={TrendingUp}
          variant={analysis.progressPrediction.trendAnalysis === 'mejorando' ? 'success' :
            analysis.progressPrediction.trendAnalysis === 'empeorando' ? 'danger' : 'warning'}
          tooltip="Peso estimado que podrías manejar la próxima semana basado en tu progresión actual."
          tooltipPosition="top"
        />
        <StatCard
          title="Riesgo Meseta"
          value={`${analysis.progressPrediction.plateauRisk}%`}
          icon={AlertTriangle}
          variant={analysis.progressPrediction.plateauRisk < 30 ? 'success' :
            analysis.progressPrediction.plateauRisk <= 60 ? 'warning' : 'danger'}
          tooltip="Probabilidad de entrar en una meseta de progreso. ≤30% es bajo riesgo, 31-60% moderado, >60% alto riesgo de estancamiento."
          tooltipPosition="top"
        />
      </div>

      {/* Layout principal - Mobile first: 1 columna, Tablet: 1 columna, Desktop: 2 columnas */}
      <div className="space-y-6">

        {/* Análisis de Fatiga - Primera prioridad */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Análisis de Fatiga
              <InfoTooltip
                content="Evaluación completa de tu estado de fatiga, recuperación y riesgo de sobreentrenamiento. Incluye análisis de tendencias y recomendaciones personalizadas."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Métricas principales - Mobile: 1 columna, SM+: 3 columnas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <p className={`text-xl sm:text-2xl font-bold ${analysis.fatigueAnalysis.fatigueLevel === 'Muy Baja' ? 'text-green-400' :
                    analysis.fatigueAnalysis.fatigueLevel === 'Baja' ? 'text-blue-400' :
                      analysis.fatigueAnalysis.fatigueLevel === 'Moderada' ? 'text-yellow-400' :
                        analysis.fatigueAnalysis.fatigueLevel === 'Alta' ? 'text-orange-400' :
                          'text-red-400'
                    }`}>
                    {analysis.fatigueAnalysis.fatigueLevel}
                  </p>
                  <div className="text-sm text-gray-400 flex items-center justify-center">
                    <span>Nivel de fatiga</span>
                    <InfoTooltip
                      content="Evaluación general de tu nivel de fatiga actual basado en múltiples factores de entrenamiento."
                      position="top"
                      className="ml-1"
                    />
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {analysis.fatigueAnalysis.recoveryDays}
                  </p>
                  <div className="text-sm text-gray-400 flex items-center justify-center">
                    <span>Días descanso</span>
                    <InfoTooltip
                      content="Días transcurridos desde tu último entrenamiento. Importante para evaluar el patrón de recuperación."
                      position="top"
                      className="ml-1"
                    />
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <p className={`text-xl sm:text-2xl font-bold ${analysis.fatigueAnalysis.overreachingRisk === 'Bajo' ? 'text-green-400' :
                    analysis.fatigueAnalysis.overreachingRisk === 'Medio' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                    {analysis.fatigueAnalysis.overreachingRisk}
                  </p>
                  <div className="text-sm text-gray-400 flex items-center justify-center">
                    <span>Riesgo sobreentrenamiento</span>
                    <InfoTooltip
                      content="Probabilidad de estar entrenando más allá de tu capacidad de recuperación. Alto riesgo requiere descanso inmediato."
                      position="top"
                      className="ml-1"
                    />
                  </div>
                </div>
              </div>

              {/* Scores de recuperación - Mobile: 1 columna, SM+: 2 columnas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-300">Tasa de Recuperación</h4>
                    <span className="text-lg font-bold text-blue-400">{analysis.fatigueAnalysis.recoveryRate}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, analysis.fatigueAnalysis.recoveryRate)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Qué tan bien te estás recuperando</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-300">Score de Recuperación</h4>
                    <span className="text-lg font-bold text-green-400">{analysis.fatigueAnalysis.recoveryScore}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, analysis.fatigueAnalysis.recoveryScore)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Evaluación general de recuperación</p>
                </div>
              </div>

              {/* Factores de estrés - Mobile: 1 columna por factor, SM+: 2 columnas */}
              <div className="p-3 bg-gray-800 rounded-lg">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Factores de Estrés</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Estrés por Volumen</span>
                      <span className="text-xs font-medium text-white">{analysis.fatigueAnalysis.stressFactors.volumeStress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-red-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, analysis.fatigueAnalysis.stressFactors.volumeStress)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Estrés por Frecuencia</span>
                      <span className="text-xs font-medium text-white">{analysis.fatigueAnalysis.stressFactors.frequencyStress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-yellow-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, analysis.fatigueAnalysis.stressFactors.frequencyStress)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Estrés por Intensidad</span>
                      <span className="text-xs font-medium text-white">{analysis.fatigueAnalysis.stressFactors.intensityStress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-orange-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, analysis.fatigueAnalysis.stressFactors.intensityStress)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Estrés por Recuperación</span>
                      <span className="text-xs font-medium text-white">{analysis.fatigueAnalysis.stressFactors.recoveryStress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, analysis.fatigueAnalysis.stressFactors.recoveryStress)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Alertas importantes */}
              {analysis.fatigueAnalysis.volumeDropIndicators && (
                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400 font-medium">
                    ⚠️ Caída significativa en volumen detectada
                  </p>
                  <p className="text-xs text-red-300 mt-1">
                    Revisa factores como nutrición, descanso o estrés externo
                  </p>
                </div>
              )}

              {/* Recomendaciones de recuperación */}
              {analysis.fatigueAnalysis.recoveryRecommendations.length > 0 && (
                <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <h4 className="text-sm text-green-400 font-medium mb-2">
                    Recomendaciones de Recuperación:
                  </h4>
                  <ul className="space-y-1">
                    {analysis.fatigueAnalysis.recoveryRecommendations.slice(0, 3).map((rec, index) => (
                      <li key={index} className="text-xs text-gray-300 flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Grid para desktop - Las siguientes dos secciones lado a lado en pantallas grandes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Indicadores de Rendimiento */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Indicadores de Rendimiento
                <InfoTooltip
                  content="Análisis detallado de tu rendimiento actual con métricas específicas y progreso medible."
                  position="top"
                  className="ml-2"
                />
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {enhancedPerformanceIndicators.length > 0 ? (
                  enhancedPerformanceIndicators.slice(0, 4).map((indicator, index) => {
                    const getIndicatorStyles = (type: string) => {
                      switch (type) {
                        case 'excellent':
                          return 'bg-green-900/20 border-green-500/30 text-green-400';
                        case 'good':
                          return 'bg-blue-900/20 border-blue-500/30 text-blue-400';
                        case 'warning':
                          return 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400';
                        case 'critical':
                          return 'bg-red-900/20 border-red-500/30 text-red-400';
                        default:
                          return 'bg-gray-900/20 border-gray-500/30 text-gray-400';
                      }
                    };

                    return (
                      <div
                        key={index}
                        className={`p-3 sm:p-4 border rounded-lg ${getIndicatorStyles(indicator.type)}`}
                      >
                        <div className="flex items-start space-x-3">
                          <indicator.icon className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-sm">{indicator.title}</h4>
                              {indicator.value && (
                                <span className="text-sm font-bold">{indicator.value}</span>
                              )}
                            </div>
                            <p className="text-xs opacity-90 mb-2">{indicator.description}</p>
                            {indicator.progress !== undefined && (
                              <div className="w-full bg-gray-700 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full transition-all duration-500 ${indicator.type === 'excellent' ? 'bg-green-500' :
                                    indicator.type === 'good' ? 'bg-blue-500' :
                                      indicator.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                  style={{ width: `${Math.min(100, indicator.progress)}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    Continúa entrenando para desarrollar indicadores de rendimiento
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Predicciones */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Predicciones
                <InfoTooltip
                  content="Proyecciones basadas en análisis estadístico de tus patrones de entrenamiento. Incluye tendencias, confianza y recomendaciones personalizadas."
                  position="top"
                  className="ml-2"
                />
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Análisis de tendencia */}
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-300">Análisis de Tendencia</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${analysis.progressPrediction.trendAnalysis === 'mejorando' ? 'bg-green-600 text-white' :
                      analysis.progressPrediction.trendAnalysis === 'estable' ? 'bg-blue-600 text-white' :
                        analysis.progressPrediction.trendAnalysis === 'empeorando' ? 'bg-red-600 text-white' :
                          'bg-gray-600 text-white'
                      }`}>
                      {analysis.progressPrediction.trendAnalysis === 'mejorando' ? '📈 MEJORANDO' :
                        analysis.progressPrediction.trendAnalysis === 'estable' ? '➡️ ESTABLE' :
                          analysis.progressPrediction.trendAnalysis === 'empeorando' ? '📉 EMPEORANDO' :
                            '❓ INSUFICIENTE'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-400">Tendencia volumen:</p>
                      <p className={`font-medium ${analysis.progressPrediction.volumeTrend > 0 ? 'text-green-400' :
                        analysis.progressPrediction.volumeTrend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {analysis.progressPrediction.volumeTrend > 0 ? '+' : ''}{analysis.progressPrediction.volumeTrend} kg/semana
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Tendencia fuerza:</p>
                      <p className={`font-medium ${analysis.progressPrediction.strengthTrend > 0 ? 'text-green-400' :
                        analysis.progressPrediction.strengthTrend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {analysis.progressPrediction.strengthTrend > 0 ? '+' : ''}{analysis.progressPrediction.strengthTrend} kg/semana
                      </p>
                    </div>
                  </div>
                </div>

                {/* Predicciones numéricas - Mobile: 1 columna, SM+: 2 columnas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <p className="text-lg font-bold text-blue-400">
                      {analysis.progressPrediction.nextWeekWeight}kg
                    </p>
                    <div className="text-xs text-gray-400 flex items-center justify-center">
                      <span>Peso próxima semana</span>
                      <InfoTooltip
                        content="Peso estimado que podrías manejar la próxima semana basado en tu progresión actual y análisis de tendencias."
                        position="top"
                        className="ml-1"
                      />
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <p className="text-lg font-bold text-green-400">
                      {formatNumber(analysis.progressPrediction.nextWeekVolume)}
                    </p>
                    <div className="text-xs text-gray-400 flex items-center justify-center">
                      <span>Volumen próxima semana</span>
                      <InfoTooltip
                        content="Volumen total estimado para la próxima semana basado en tu tendencia actual de carga de trabajo."
                        position="top"
                        className="ml-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Predicción de PR */}
                <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                      <p className="text-sm text-purple-400 font-medium">Próximo PR predicho:</p>
                      <InfoTooltip
                        content="Predicción de tu próximo récord personal basado en análisis de progresión, tendencias y patrones históricos."
                        position="top"
                      />
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-lg font-bold text-white">
                        {analysis.progressPrediction.predictedPR.weight}kg
                      </p>
                      <p className="text-xs text-gray-400">
                        Confianza: {analysis.progressPrediction.predictedPR.confidence}%
                      </p>
                    </div>
                  </div>
                  {analysis.progressPrediction.timeToNextPR > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-300">Tiempo estimado:</span>
                      <span className="text-white font-medium">
                        {analysis.progressPrediction.timeToNextPR} semana{analysis.progressPrediction.timeToNextPR !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Recomendaciones de predicción - Solo mostrar 2 en mobile */}
                {analysis.progressPrediction.recommendations.length > 0 && (
                  <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <h4 className="text-sm text-blue-400 font-medium mb-2">
                      Recomendaciones:
                    </h4>
                    <ul className="space-y-1">
                      {analysis.progressPrediction.recommendations.slice(0, 2).map((rec, index) => (
                        <li key={index} className="text-xs text-gray-300 flex items-start">
                          <span className="text-blue-400 mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Análisis de Intensidad - Ancho completo */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Análisis de Intensidad
              <InfoTooltip
                content="Evaluación detallada de la intensidad en diferentes aspectos de tu entrenamiento. Clave para optimizar el estímulo de crecimiento."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Gráfico de barras de intensidad - Mobile: 1 columna, SM+: 3 columnas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <p className="text-sm text-gray-400">Intensidad Peso</p>
                    <InfoTooltip
                      content="Porcentaje de tu peso máximo que utilizas en promedio. Mayor intensidad = mayor estímulo de fuerza."
                      position="top"
                    />
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, analysis.intensityMetrics.averageIntensity)}%` }}
                    />
                  </div>
                  <p className="text-lg font-bold text-white">
                    {analysis.intensityMetrics.averageIntensity}%
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <p className="text-sm text-gray-400">Intensidad Volumen</p>
                    <InfoTooltip
                      content="Intensidad basada en el volumen total de trabajo. Mayor volumen = mayor estímulo de hipertrofia."
                      position="top"
                    />
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, analysis.intensityMetrics.volumeIntensity)}%` }}
                    />
                  </div>
                  <p className="text-lg font-bold text-white">
                    {analysis.intensityMetrics.volumeIntensity}%
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <p className="text-sm text-gray-400">Intensidad Frecuencia</p>
                    <InfoTooltip
                      content="Intensidad basada en la frecuencia de entrenamientos. Mayor frecuencia = mayor estímulo de adaptación."
                      position="top"
                    />
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, analysis.intensityMetrics.frequencyIntensity)}%` }}
                    />
                  </div>
                  <p className="text-lg font-bold text-white">
                    {analysis.intensityMetrics.frequencyIntensity}%
                  </p>
                </div>
              </div>

              {/* Rango óptimo de carga */}
              <div className="pt-4 border-t border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-2 sm:mb-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-300">
                        Rango Óptimo de Carga
                      </h4>
                      <InfoTooltip
                        content="Rango de peso recomendado para maximizar el progreso basado en tu historial y capacidades actuales."
                        position="top"
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      Basado en historial de entrenamientos
                    </p>
                  </div>
                  <p className="text-lg font-bold text-blue-400">
                    {analysis.trainingEfficiency.optimalLoadRange.min}-{analysis.trainingEfficiency.optimalLoadRange.max}kg
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sugerencias de Optimización - Mobile: lista simple, Desktop: grid */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Sugerencias de Optimización
              <InfoTooltip
                content="Recomendaciones personalizadas y priorizadas basadas en análisis detallado de tus datos de entrenamiento."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categorizedSuggestions.length > 0 ? (
                categorizedSuggestions.slice(0, 4).map((suggestion, index) => {
                  const getCategoryStyles = (category: string) => {
                    switch (category) {
                      case 'intensity':
                        return 'bg-red-900/20 border-red-500/30 text-red-400';
                      case 'recovery':
                        return 'bg-green-900/20 border-green-500/30 text-green-400';
                      case 'frequency':
                        return 'bg-purple-900/20 border-purple-500/30 text-purple-400';
                      case 'planning':
                        return 'bg-indigo-900/20 border-indigo-500/30 text-indigo-400';
                      case 'progress':
                        return 'bg-blue-900/20 border-blue-500/30 text-blue-400';
                      case 'technique':
                        return 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400';
                      case 'balance':
                        return 'bg-cyan-900/20 border-cyan-500/30 text-cyan-400';
                      default:
                        return 'bg-gray-900/20 border-gray-500/30 text-gray-400';
                    }
                  };

                  const getPriorityBadge = (priority: string) => {
                    switch (priority) {
                      case 'high':
                        return 'bg-red-600 text-white';
                      case 'medium':
                        return 'bg-yellow-600 text-white';
                      case 'low':
                        return 'bg-gray-600 text-white';
                      default:
                        return 'bg-gray-600 text-white';
                    }
                  };

                  return (
                    <div
                      key={index}
                      className={`p-3 sm:p-4 border rounded-lg ${getCategoryStyles(suggestion.category)}`}
                    >
                      <div className="flex items-start space-x-3">
                        <suggestion.icon className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                            <h4 className="font-medium text-sm mb-1 sm:mb-0">{suggestion.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityBadge(suggestion.priority)} w-fit`}>
                              {suggestion.priority === 'high' ? 'ALTA' :
                                suggestion.priority === 'medium' ? 'MEDIA' : 'BAJA'}
                            </span>
                          </div>
                          <p className="text-xs opacity-90 mb-2">{suggestion.description}</p>
                          <div className="flex items-start space-x-2">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 opacity-70" />
                            <p className="text-xs font-medium">{suggestion.action}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 font-medium">¡Excelente trabajo!</p>
                  <p className="text-gray-400 text-sm">Tu entrenamiento está bien optimizado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};