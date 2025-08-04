import type { WorkoutRecord } from '@/interfaces';

export interface CategoryTrendData {
  weights: number[];
  trend: number;
  maxWeight: number;
  avgWeight: number;
}

export interface CategoryAnalysisResult {
  day: string;
  category: string;
  maxWeight: number;
  message: string;
  trend: number;
}

/**
 * Analiza las tendencias de mejora por categoría de ejercicio
 */
export const analyzeCategoryTrends = (records: WorkoutRecord[]): Map<string, CategoryTrendData> => {
  const categoryTrends = new Map<string, CategoryTrendData>();

  // Agrupar todos los registros por categoría
  records.forEach(record => {
    const category = record.exercise?.categories?.[0] || 'Sin categoría';
    if (!categoryTrends.has(category)) {
      categoryTrends.set(category, { weights: [], trend: 0, maxWeight: 0, avgWeight: 0 });
    }
    categoryTrends.get(category)!.weights.push(record.weight);
  });

  // Calcular tendencia para cada categoría
  categoryTrends.forEach((data, category) => {
    if (data.weights.length >= 3) {
      // Dividir en dos períodos para calcular tendencia
      const sortedWeights = [...data.weights].sort((a, b) => a - b);
      const halfPoint = Math.floor(sortedWeights.length / 2);
      const olderWeights = sortedWeights.slice(0, halfPoint);
      const recentWeights = sortedWeights.slice(halfPoint);

      const olderAvg = olderWeights.reduce((sum, w) => sum + w, 0) / olderWeights.length;
      const recentAvg = recentWeights.reduce((sum, w) => sum + w, 0) / recentWeights.length;

      if (olderAvg > 0) {
        data.trend = ((recentAvg - olderAvg) / olderAvg) * 100;
      }
    }

    // Calcular métricas adicionales
    data.maxWeight = Math.max(...data.weights);
    data.avgWeight = data.weights.reduce((sum, w) => sum + w, 0) / data.weights.length;
  });

  return categoryTrends;
};

/**
 * Analiza el peso máximo por categoría de ejercicio por día
 */
export const analyzeMaxWeightByCategory = (
  records: WorkoutRecord[],
  daysWithData: Array<{ dayName: string; workouts: number; performanceScore: number }>
): CategoryAnalysisResult => {
  if (!records || records.length === 0) {
    return { day: 'N/A', category: 'N/A', maxWeight: 0, message: 'Sin datos suficientes', trend: 0 };
  }

  // Agrupar registros por día de la semana
  const dayGroups = new Map<string, WorkoutRecord[]>();
  records.forEach(record => {
    const dayName = new Date(record.date).toLocaleDateString('es-ES', { weekday: 'long' });
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    if (!dayGroups.has(capitalizedDay)) {
      dayGroups.set(capitalizedDay, []);
    }
    dayGroups.get(capitalizedDay)!.push(record);
  });

  // Analizar cada día con datos
  const dayAnalysis = daysWithData.map(day => {
    const dayRecords = dayGroups.get(day.dayName) || [];

    // Agrupar por categoría de ejercicio
    const categoryGroups = new Map<string, WorkoutRecord[]>();
    dayRecords.forEach(record => {
      const category = record.exercise?.categories?.[0] || 'Sin categoría';
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, []);
      }
      categoryGroups.get(category)!.push(record);
    });

    // Encontrar la categoría con peso máximo más bajo
    let lowestCategory = { name: 'N/A', maxWeight: 0 };
    let highestCategory = { name: 'N/A', maxWeight: 0 };

    categoryGroups.forEach((records, category) => {
      const maxWeight = Math.max(...records.map(r => r.weight));
      if (lowestCategory.name === 'N/A' || maxWeight < lowestCategory.maxWeight) {
        lowestCategory = { name: category, maxWeight };
      }
      if (highestCategory.name === 'N/A' || maxWeight > highestCategory.maxWeight) {
        highestCategory = { name: category, maxWeight };
      }
    });

    return {
      day: day.dayName,
      lowestCategory,
      highestCategory,
      totalWorkouts: day.workouts,
      performanceScore: day.performanceScore
    };
  });

  // Analizar tendencias de mejora por categoría
  const categoryTrends = analyzeCategoryTrends(records);

  // Encontrar el día con la categoría más débil, pero considerar tendencias
  const dayWithWeakestCategory = dayAnalysis.reduce((weakest, current) => {
    if (weakest.lowestCategory.name === 'N/A') return current;
    if (current.lowestCategory.name === 'N/A') return weakest;

    const currentTrend = categoryTrends.get(current.lowestCategory.name)?.trend || 0;
    const weakestTrend = categoryTrends.get(weakest.lowestCategory.name)?.trend || 0;

    // Si la categoría actual tiene mejor tendencia, darle prioridad
    if (currentTrend > weakestTrend + 5) {
      return weakest; // Mantener el más débil si la tendencia es significativamente mejor
    }

    return current.lowestCategory.maxWeight < weakest.lowestCategory.maxWeight ? current : weakest;
  });

  const selectedCategory = dayWithWeakestCategory.lowestCategory.name;
  const categoryTrend = categoryTrends.get(selectedCategory)?.trend || 0;
  const maxWeight = dayWithWeakestCategory.lowestCategory.maxWeight;

  // Determinar el mensaje basado en la tendencia
  let message = '';
  if (categoryTrend > 10) {
    message = `${dayWithWeakestCategory.day} - ${selectedCategory} (${maxWeight} kg) mejorando (+${categoryTrend.toFixed(1)}%)`;
  } else if (categoryTrend > 0) {
    message = `${dayWithWeakestCategory.day} - ${selectedCategory} (${maxWeight} kg) estable`;
  } else {
    message = `${dayWithWeakestCategory.day} - ${selectedCategory} (${maxWeight} kg) necesita mejora`;
  }

  return {
    day: dayWithWeakestCategory.day,
    category: selectedCategory,
    maxWeight,
    message,
    trend: categoryTrend
  };
}; 