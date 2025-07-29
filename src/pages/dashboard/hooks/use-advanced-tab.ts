import { useAdvancedAnalysis } from '@/hooks/use-advanced-analysis';
import type { WorkoutRecord } from '@/interfaces';
import { generateAdvancedOptimizationSuggestions } from '@/utils/functions/optimization-suggestions.utils';
import { generateEnhancedPerformanceIndicators } from '@/utils/functions/performance-indicators.utils';
import { AlertTriangle, Brain, Calendar, Target, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

export const useAdvancedTab = (records: WorkoutRecord[]) => {
  // ✅ USAR HOOK CENTRALIZADO: Evita duplicación de análisis
  const analysis = useAdvancedAnalysis(records);

  const advancedMetrics = useMemo(() => {
    if (records.length === 0) {
      return {
        timeEfficiencyScore: 0,
        fatigueIndex: 0,
        plateauRisk: 0,
        overtrainingRisk: 0,
        projectedWeight: 0,
        projectedVolume: 0,
        nextPredictedPR: 0,
        monthlyGrowth: 0
      };
    }

    return {
      timeEfficiencyScore: analysis.trainingEfficiency.timeEfficiencyScore || 0,
      fatigueIndex: analysis.fatigueAnalysis.fatigueIndex || 0,
      plateauRisk: analysis.progressPrediction.plateauRisk || 0,
      overtrainingRisk: analysis.fatigueAnalysis.overreachingRisk || 0,
      projectedWeight: analysis.progressPrediction.nextWeekWeight || 0,
      projectedVolume: analysis.progressPrediction.nextWeekVolume || 0,
      nextPredictedPR: analysis.progressPrediction.predictedPR.weight || 0,
      monthlyGrowth: analysis.progressPrediction.monthlyGrowthRate || 0
    };
  }, [analysis, records.length]);

  // Generar indicadores de rendimiento mejorados
  const enhancedPerformanceIndicators = useMemo(() => {
    return generateEnhancedPerformanceIndicators(records);
  }, [records]);

  // Generar sugerencias de optimización categorizadas
  const categorizedSuggestions = useMemo(() => {
    const suggestions = generateAdvancedOptimizationSuggestions(records);

    // Mapear strings a objetos OptimizationSuggestion
    return suggestions.map((suggestion, index) => {
      // Determinar categoría y prioridad basado en el contenido
      let category = 'general';
      let priority: 'high' | 'medium' | 'low' = 'medium';

      if (suggestion.includes('CRÍTICO') || suggestion.includes('riesgo')) {
        category = 'safety';
        priority = 'high';
      } else if (suggestion.includes('aumentar') || suggestion.includes('mejorar')) {
        category = 'performance';
        priority = 'medium';
      } else if (suggestion.includes('consistencia') || suggestion.includes('mantén')) {
        category = 'consistency';
        priority = 'low';
      }

      // Determinar icono basado en categoría
      let Icon = Brain;
      if (category === 'safety') Icon = AlertTriangle;
      else if (category === 'performance') Icon = TrendingUp;
      else if (category === 'consistency') Icon = Calendar;
      else if (category === 'general') Icon = Target;

      return {
        category,
        priority,
        title: `Sugerencia ${index + 1}`,
        description: suggestion,
        action: 'Implementar gradualmente',
        icon: Icon
      };
    });
  }, [records]);

  return {
    analysis,
    advancedMetrics,
    enhancedPerformanceIndicators,
    categorizedSuggestions
  };
}; 