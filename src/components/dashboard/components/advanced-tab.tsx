import { startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Activity, AlertTriangle, Award,
  Brain, Calendar, CheckCircle,
  Clock, Shield, Target,
  Timer,
  TrendingUp,
  Zap
} from 'lucide-react';
import React, { useMemo } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { formatNumber } from '../../../utils/functions';
import { calculateAdvancedAnalysis, getLastWeekRecords, getThisWeekRecords } from '../../../utils/functions/advanced-analysis';
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

    // 6. ANÁLISIS DE VOLUMEN PERSONAL (corregido - usar promedio por sesión)
    const recentVolume = thisWeekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
    const lastWeekVolume = lastWeekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

    // Solo mostrar indicadores si hay datos suficientes y no es una semana muy incompleta
    if (recentVolume > 0 && lastWeekVolume > 0 && weeklyFrequency >= 2 && lastWeekFrequency >= 2) {
      const recentAvgVolume = recentVolume / weeklyFrequency;
      const lastWeekAvgVolume = lastWeekVolume / lastWeekFrequency;
      const volumeChange = ((recentAvgVolume - lastWeekAvgVolume) / lastWeekAvgVolume) * 100;

      if (volumeChange > 20) {
        indicators.push({
          type: 'excellent',
          icon: Activity,
          title: 'Volumen en Alza',
          description: `+${Math.round(volumeChange)}% volumen/sesión vs semana pasada`,
          value: `+${Math.round(volumeChange)}%`,
          progress: Math.min(100, volumeChange * 2)
        });
      } else if (volumeChange < -20) {
        indicators.push({
          type: 'warning',
          icon: Activity,
          title: 'Volumen Reducido',
          description: `${Math.round(volumeChange)}% volumen/sesión vs semana pasada`,
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

    // **DETECCIÓN DE SEMANA INCOMPLETA**
    const now = new Date();
    const weekStart = startOfWeek(now, { locale: es });
    const daysSinceWeekStart = Math.floor((now.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    const isWeekIncomplete = daysSinceWeekStart < 3; // Si han pasado menos de 3 días desde el lunes

    // 1. ANÁLISIS DE FRECUENCIA (corregido - contar días únicos)
    const thisWeekRecords = getThisWeekRecords(records);
    const lastWeekRecords = getLastWeekRecords(records);
    // Contar días únicos en lugar de registros individuales
    const weeklyFrequency = new Set(thisWeekRecords.map(r => r.date.toDateString())).size;
    const lastWeekFrequency = new Set(lastWeekRecords.map(r => r.date.toDateString())).size;

    // **ANÁLISIS DE FRECUENCIA INTELIGENTE** - Evitar comparaciones injustas en semanas incompletas
    if (isWeekIncomplete) {
      // Para semanas incompletas (lunes-miércoles), dar sugerencias de planificación
      if (weeklyFrequency === 0) {
        suggestions.push({
          category: 'frequency',
          priority: 'high',
          icon: Calendar,
          title: 'Planificar Entrenamientos',
          description: `Día ${daysSinceWeekStart + 1} de la semana - aún no has entrenado`,
          action: 'Programa al menos 2-3 sesiones para esta semana'
        });
      } else if (weeklyFrequency === 1 && daysSinceWeekStart >= 2) {
        suggestions.push({
          category: 'frequency',
          priority: 'medium',
          icon: Calendar,
          title: 'Continuar Rutina Semanal',
          description: '1 entrenamiento realizado - buen inicio de semana',
          action: 'Programa 1-2 sesiones más para completar la semana'
        });
      } else if (weeklyFrequency >= 2 && daysSinceWeekStart <= 2) {
        suggestions.push({
          category: 'frequency',
          priority: 'low',
          icon: Award,
          title: 'Excelente Inicio de Semana',
          description: `${weeklyFrequency} entrenamientos en ${daysSinceWeekStart + 1} días - muy buen ritmo`,
          action: 'Mantén este ritmo y distribuye el resto de sesiones'
        });
      }
    } else {
      // Para semanas completas o casi completas, usar análisis normal
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

      // Análisis de tendencia de frecuencia - SOLO para semanas completas
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

    // 6. ANÁLISIS DE VOLUMEN (corregido - usar volumen promedio por sesión)
    const recentVolume = thisWeekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
    const lastWeekVolume = lastWeekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

    // Calcular volumen promedio por sesión para comparaciones justas
    const recentAvgVolume = weeklyFrequency > 0 ? recentVolume / weeklyFrequency : 0;
    const lastWeekAvgVolume = lastWeekFrequency > 0 ? lastWeekVolume / lastWeekFrequency : 0;

    // **ANÁLISIS DE VOLUMEN INTELIGENTE** - Evitar comparaciones injustas en semanas incompletas
    if (!isWeekIncomplete) {
      // Solo hacer comparaciones si hay datos suficientes y la semana está completa
      if (recentAvgVolume > 0 && lastWeekAvgVolume > 0 && weeklyFrequency >= 1 && lastWeekFrequency >= 1) {
        const volumeChange = ((recentAvgVolume - lastWeekAvgVolume) / lastWeekAvgVolume) * 100;
        if (volumeChange < -25) {
          suggestions.push({
            category: 'intensity',
            priority: 'medium',
            icon: Activity,
            title: 'Volumen Reducido Significativamente',
            description: `${Math.abs(Math.round(volumeChange))}% menos volumen/sesión que la semana pasada`,
            action: 'Evalúa si es planificado o necesitas retomar intensidad gradualmente'
          });
        } else if (volumeChange > 40) {
          suggestions.push({
            category: 'recovery',
            priority: 'medium',
            icon: Shield,
            title: 'Aumento Súbito de Volumen',
            description: `+${Math.round(volumeChange)}% más volumen/sesión - monitorea recuperación`,
            action: 'Asegúrate de descansar adecuadamente y observa señales de fatiga'
          });
        }
      } else if (recentVolume > 0 && lastWeekVolume === 0) {
        suggestions.push({
          category: 'frequency',
          priority: 'low',
          icon: TrendingUp,
          title: 'Retorno al Entrenamiento',
          description: 'Has retomado los entrenamientos después de descanso',
          action: 'Comienza gradualmente y aumenta intensidad progresivamente'
        });
      } else if (recentVolume === 0 && lastWeekVolume > 0) {
        suggestions.push({
          category: 'frequency',
          priority: 'high',
          icon: AlertTriangle,
          title: 'Pausa en Entrenamiento',
          description: 'Has dejado de entrenar esta semana',
          action: 'Retoma los entrenamientos lo antes posible para mantener progreso'
        });
      }
    } else {
      // Para semanas incompletas, dar sugerencias de planificación de volumen
      if (recentAvgVolume > 0 && lastWeekAvgVolume > 0) {
        const currentPace = recentAvgVolume;
        const expectedWeeklyVolume = currentPace * 7 / (daysSinceWeekStart + 1);
        const lastWeekTotalVolume = lastWeekAvgVolume * lastWeekFrequency;

        if (expectedWeeklyVolume > lastWeekTotalVolume * 1.2) {
          suggestions.push({
            category: 'recovery',
            priority: 'low',
            icon: Shield,
            title: 'Ritmo Intenso Detectado',
            description: 'Tu ritmo actual sugiere una semana de alto volumen',
            action: 'Monitorea fatiga y considera días de descanso estratégicos'
          });
        } else if (expectedWeeklyVolume < lastWeekTotalVolume * 0.8) {
          suggestions.push({
            category: 'intensity',
            priority: 'low',
            icon: Activity,
            title: 'Oportunidad de Aumentar Volumen',
            description: 'Tu ritmo actual sugiere una semana de menor volumen',
            action: 'Considera añadir más series o ejercicios en próximas sesiones'
          });
        }
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

    // 8. ANÁLISIS DE DENSIDAD DE ENTRENAMIENTO (corregido para semanas incompletas)
    if (!isWeekIncomplete) {
      // Solo analizar densidad para semanas completas
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
    } else {
      // Para semanas incompletas, dar sugerencias de planificación de densidad
      if (weeklyFrequency > 0) {
        const projectedWeeklyFrequency = weeklyFrequency * 7 / (daysSinceWeekStart + 1);
        if (projectedWeeklyFrequency > 6) {
          suggestions.push({
            category: 'balance',
            priority: 'low',
            icon: Shield,
            title: 'Ritmo de Entrenamiento Intenso',
            description: `${weeklyFrequency} sesiones en ${daysSinceWeekStart + 1} días - ritmo muy activo`,
            action: 'Planifica días de descanso para evitar sobrecarga'
          });
        } else if (projectedWeeklyFrequency < 2) {
          suggestions.push({
            category: 'balance',
            priority: 'low',
            icon: Calendar,
            title: 'Oportunidad de Aumentar Actividad',
            description: `Ritmo actual sugiere baja frecuencia semanal`,
            action: 'Considera añadir más sesiones durante la semana'
          });
        }
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

  // Colores para métricas de fatiga
  const fatigueColors: Record<string, string> = {
    'fatigueLevel': 'from-red-500/80 to-orange-500/80',
    'recoveryRate': 'from-blue-500/80 to-cyan-500/80',
    'recoveryScore': 'from-green-500/80 to-emerald-500/80',
    'workloadTrend': 'from-purple-500/80 to-violet-500/80',
    'overreachingRisk': 'from-indigo-500/80 to-blue-500/80'
  };

  // Función utilitaria para validar valores numéricos (igual que Balance Muscular)
  const safeNumber = (value: any, defaultValue: number = 0): number => {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      return defaultValue;
    }
    return value;
  };

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
                content="Evaluación completa de tu estado de fatiga, recuperación y riesgo de sobreentrenamiento con análisis visual."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Métricas principales rediseñadas como tarjetas */}
              <div className="space-y-4">
                {/* Nivel de Fatiga */}
                <div className="relative p-4 sm:p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-br ${fatigueColors.fatigueLevel}`}>
                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">
                          Nivel de Fatiga
                        </h4>
                        <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${analysis.fatigueAnalysis.fatigueLevel === 'Muy Baja' ? 'bg-green-500 text-white' :
                            analysis.fatigueAnalysis.fatigueLevel === 'Baja' ? 'bg-blue-500 text-white' :
                              analysis.fatigueAnalysis.fatigueLevel === 'Moderada' ? 'bg-yellow-500 text-black' :
                                analysis.fatigueAnalysis.fatigueLevel === 'Alta' ? 'bg-orange-500 text-white' :
                                  'bg-red-500 text-white'
                            }`}>
                            {analysis.fatigueAnalysis.fatigueLevel}
                          </span>
                          {analysis.fatigueAnalysis.fatigueIndex <= 30 && (
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                          )}
                          {analysis.fatigueAnalysis.fatigueIndex > 70 && (
                            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-2 sm:ml-4">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                        {safeNumber(analysis.fatigueAnalysis.fatigueIndex, 0)}%
                      </div>
                      <div className="text-xs text-gray-400">
                        índice fatiga
                      </div>
                      <div className="mt-1 sm:mt-2 flex justify-end">
                        {analysis.fatigueAnalysis.fatigueIndex <= 30 ? (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                        ) : analysis.fatigueAnalysis.fatigueIndex > 70 ? (
                          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                        ) : (
                          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Barra de progreso de fatiga */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span>Índice: {safeNumber(analysis.fatigueAnalysis.fatigueIndex, 0)}%</span>
                      <span className="text-gray-300">
                        Riesgo: {analysis.fatigueAnalysis.overreachingRisk}
                      </span>
                    </div>
                    <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`relative h-full bg-gradient-to-r ${fatigueColors.fatigueLevel} transition-all duration-300`}
                        style={{ width: `${Math.min(100, safeNumber(analysis.fatigueAnalysis.fatigueIndex, 0))}%` }}
                      >
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                        {safeNumber(analysis.fatigueAnalysis.fatigueIndex, 0) > 15 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-white drop-shadow-sm">
                              {safeNumber(analysis.fatigueAnalysis.fatigueIndex, 0)}%
                            </span>
                          </div>
                        )}
                      </div>
                      {safeNumber(analysis.fatigueAnalysis.fatigueIndex, 0) <= 15 && safeNumber(analysis.fatigueAnalysis.fatigueIndex, 0) > 0 && (
                        <div className="absolute top-0 left-2 h-full flex items-center">
                          <span className="text-xs font-medium text-white drop-shadow-sm">
                            {safeNumber(analysis.fatigueAnalysis.fatigueIndex, 0)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grid de métricas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4">
                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">Días Descanso</div>
                      <div className="text-sm sm:text-lg font-semibold text-white">
                        {analysis.fatigueAnalysis.recoveryDays}
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">Tasa Recuperación</div>
                      <div className="text-sm sm:text-lg font-semibold text-white">
                        {safeNumber(analysis.fatigueAnalysis.recoveryRate, 0)}%
                      </div>
                      <div className="relative w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300 relative"
                          style={{ width: `${safeNumber(analysis.fatigueAnalysis.recoveryRate, 0)}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">Score Recuperación</div>
                      <div className="text-sm sm:text-lg font-semibold text-white">
                        {safeNumber(analysis.fatigueAnalysis.recoveryScore, 0)}
                      </div>
                      <div className="relative w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300 relative"
                          style={{ width: `${safeNumber(analysis.fatigueAnalysis.recoveryScore, 0)}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">Tendencia Carga</div>
                      <div className="text-sm sm:text-lg font-semibold text-white">
                        {analysis.fatigueAnalysis.workloadTrend}
                      </div>
                    </div>
                  </div>

                  {/* Factores de estrés como barras de progreso */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <h5 className="text-xs font-medium text-gray-300 mb-2 flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        Factores de Estrés
                      </h5>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Volumen:</span>
                            <span className="text-white">{formatNumber(safeNumber(analysis.fatigueAnalysis.stressFactors.volumeStress, 0))}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${safeNumber(analysis.fatigueAnalysis.stressFactors.volumeStress, 0)}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Frecuencia:</span>
                            <span className="text-white">{formatNumber(safeNumber(analysis.fatigueAnalysis.stressFactors.frequencyStress, 0))}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${safeNumber(analysis.fatigueAnalysis.stressFactors.frequencyStress, 0)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <h5 className="text-xs font-medium text-gray-300 mb-2 flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        Predicción Recuperación
                      </h5>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Tiempo estimado:</span>
                          <span className="text-xs font-medium text-white">
                            {Math.round(safeNumber(analysis.fatigueAnalysis.predictedRecoveryTime, 0))}h
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Tendencia historial:</span>
                          <span className={`text-xs font-medium ${analysis.fatigueAnalysis.fatigueHistory.trend === 'Mejorando' ? 'text-green-400' :
                            analysis.fatigueAnalysis.fatigueHistory.trend === 'Empeorando' ? 'text-red-400' : 'text-gray-400'
                            }`}>
                            {analysis.fatigueAnalysis.fatigueHistory.trend}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Consistencia:</span>
                          <span className="text-xs font-medium text-blue-400">
                            {safeNumber(analysis.fatigueAnalysis.fatigueHistory.consistency, 0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alertas y recomendaciones */}
                  <div className="space-y-2">
                    {/* Alerta de caída de volumen */}
                    {analysis.fatigueAnalysis.volumeDropIndicators && (
                      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-red-300 break-words">
                              Caída significativa en volumen detectada - revisa factores como nutrición, descanso o estrés externo
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recomendaciones */}
                    {analysis.fatigueAnalysis.recoveryRecommendations.length > 0 && (
                      <div className={`${analysis.fatigueAnalysis.volumeDropIndicators ? 'bg-gray-800/50 border-gray-700/30' : 'bg-green-900/20 border-green-500/30'} border rounded-lg p-3`}>
                        <div className="flex items-start gap-2">
                          <CheckCircle className={`w-4 h-4 ${analysis.fatigueAnalysis.volumeDropIndicators ? 'text-gray-400' : 'text-green-400'} mt-0.5 flex-shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${analysis.fatigueAnalysis.volumeDropIndicators ? 'text-gray-300' : 'text-green-300'} break-words`}>
                              {analysis.fatigueAnalysis.recoveryRecommendations[0]}
                            </p>
                            {analysis.fatigueAnalysis.recoveryRecommendations.length > 1 && (
                              <p className="text-xs text-gray-400 mt-1 break-words">
                                {analysis.fatigueAnalysis.recoveryRecommendations[1]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
                                {suggestion.priority === 'high' ? 'PRIORIDAD ALTA' :
                                  suggestion.priority === 'medium' ? 'PRIORIDAD MEDIA' : 'PRIORIDAD BAJA'}
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
    </div>
  );
};