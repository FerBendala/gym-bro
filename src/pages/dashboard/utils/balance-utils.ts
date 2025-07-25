import type { WorkoutRecord } from '@/interfaces';
import { analyzeMuscleBalance, calculateBalanceScore, calculateCategoryAnalysis } from '@/utils';

// Constantes para meta-categorías (como en main)
const META_CATEGORIES = {
  UPPER_BODY: {
    id: 'upper_body',
    name: 'Tren Superior',
    categories: ['Pecho', 'Espalda', 'Hombros', 'Brazos'],
    idealPercentage: 60,
    color: '#3B82F6'
  },
  LOWER_BODY: {
    id: 'lower_body',
    name: 'Tren Inferior',
    categories: ['Piernas', 'Glúteos'],
    idealPercentage: 35,
    color: '#10B981'
  },
  CORE: {
    id: 'core',
    name: 'Core',
    categories: ['Core'],
    idealPercentage: 5,
    color: '#8B5CF6'
  }
};

export const calculateBalanceAnalysis = (records: WorkoutRecord[]) => {
  if (records.length === 0) {
    return {
      balanceScore: 0,
      finalConsistency: 0,
      avgIntensity: 0,
      avgFrequency: 0,
      muscleBalance: [],
      categoryAnalysis: {
        categoryMetrics: []
      },
      upperLowerBalance: {
        upperBody: { volume: 0, percentage: 0, categories: [] },
        lowerBody: { volume: 0, percentage: 0, categories: [] },
        core: { volume: 0, percentage: 0, categories: [] }
      },
      selectedView: 'general' as const
    };
  }

  // Usar las funciones correctas de category-analysis
  const categoryAnalysis = calculateCategoryAnalysis(records);
  const muscleBalance = analyzeMuscleBalance(records);
  const balanceScore = calculateBalanceScore(muscleBalance, records);

  // Calcular balance superior/inferior CORREGIDO: usando la misma lógica que main
  const upperLowerBalance = calculateUpperLowerBalance(categoryAnalysis.categoryMetrics);

  // Calcular consistencia
  const consistency = calculateConsistency(records);

  // Calcular intensidad promedio
  const avgIntensity = records.length > 0
    ? records.reduce((sum, r) => sum + r.weight, 0) / records.length
    : 0;

  // Calcular frecuencia promedio CORREGIDA: como en main, multiplicando por 33.33
  const avgFrequency = Math.min(100, muscleBalance.reduce((sum, b) => sum + (b.weeklyFrequency || 0), 0) / muscleBalance.length * 33.33);

  return {
    balanceScore,
    finalConsistency: consistency,
    avgIntensity,
    avgFrequency,
    muscleBalance: muscleBalance.map(balance => ({
      category: balance.category,
      percentage: balance.percentage,
      totalVolume: balance.volume,
      idealPercentage: balance.idealPercentage,
      intensityScore: balance.intensityScore,
      weeklyFrequency: balance.weeklyFrequency,
      isBalanced: balance.isBalanced,
      priorityLevel: balance.priorityLevel,
      progressTrend: balance.progressTrend,
      personalRecords: categoryAnalysis.categoryMetrics.find(m => m.category === balance.category)?.personalRecords || [],
      balanceHistory: balance.balanceHistory
    })),
    categoryAnalysis,
    upperLowerBalance,
    selectedView: 'general' as const
  };
};

// NUEVA FUNCIÓN: Calcular balance tren superior vs inferior como en main
const calculateUpperLowerBalance = (categoryMetrics: Array<{ category: string; percentage: number; totalVolume: number }>) => {
  const upperBodyCategories = ['Pecho', 'Espalda', 'Hombros', 'Brazos'];
  const lowerBodyCategories = ['Piernas'];
  const coreCategories = ['Core'];

  const upperBody = {
    percentage: categoryMetrics
      .filter(m => upperBodyCategories.includes(m.category))
      .reduce((sum, m) => sum + m.percentage, 0),
    volume: categoryMetrics
      .filter(m => upperBodyCategories.includes(m.category))
      .reduce((sum, m) => sum + m.totalVolume, 0),
    categories: upperBodyCategories
  };

  const lowerBody = {
    percentage: categoryMetrics
      .filter(m => lowerBodyCategories.includes(m.category))
      .reduce((sum, m) => sum + m.percentage, 0),
    volume: categoryMetrics
      .filter(m => lowerBodyCategories.includes(m.category))
      .reduce((sum, m) => sum + m.totalVolume, 0),
    categories: lowerBodyCategories
  };

  const core = {
    percentage: categoryMetrics
      .filter(m => coreCategories.includes(m.category))
      .reduce((sum, m) => sum + m.percentage, 0),
    volume: categoryMetrics
      .filter(m => coreCategories.includes(m.category))
      .reduce((sum, m) => sum + m.totalVolume, 0),
    categories: coreCategories
  };

  // Calcular balance basado en desviación de porcentajes individuales vs ideales
  const upperBodyDeviation = Math.abs(upperBody.percentage - META_CATEGORIES.UPPER_BODY.idealPercentage);
  const lowerBodyDeviation = Math.abs(lowerBody.percentage - META_CATEGORIES.LOWER_BODY.idealPercentage);
  const coreDeviation = Math.abs(core.percentage - META_CATEGORIES.CORE.idealPercentage);

  // Considerar balanceado si ninguna categoría se desvía más de 5% del ideal
  const maxAcceptableDeviation = 5;
  const isBalanced = upperBodyDeviation <= maxAcceptableDeviation &&
    lowerBodyDeviation <= maxAcceptableDeviation &&
    coreDeviation <= maxAcceptableDeviation;

  // Generar recomendación basada en las mayores desviaciones
  let recommendation = 'El balance entre tren superior e inferior es adecuado';

  if (!isBalanced) {
    const deviations = [
      { category: 'Tren Superior', deviation: upperBodyDeviation, current: upperBody.percentage, ideal: META_CATEGORIES.UPPER_BODY.idealPercentage },
      { category: 'Tren Inferior', deviation: lowerBodyDeviation, current: lowerBody.percentage, ideal: META_CATEGORIES.LOWER_BODY.idealPercentage },
      { category: 'Core', deviation: coreDeviation, current: core.percentage, ideal: META_CATEGORIES.CORE.idealPercentage }
    ];

    // Ordenar por desviación descendente
    deviations.sort((a, b) => b.deviation - a.deviation);

    const worstDeviation = deviations[0];
    if (worstDeviation.current > worstDeviation.ideal) {
      recommendation = `Considera reducir el entrenamiento de ${worstDeviation.category} (${worstDeviation.current.toFixed(1)}% vs ${worstDeviation.ideal}% ideal)`;
    } else {
      recommendation = `Considera aumentar el entrenamiento de ${worstDeviation.category} (${worstDeviation.current.toFixed(1)}% vs ${worstDeviation.ideal}% ideal)`;
    }
  }

  return {
    upperBody: {
      percentage: upperBody.percentage,
      volume: upperBody.volume,
      categories: upperBody.categories
    },
    lowerBody: {
      percentage: lowerBody.percentage,
      volume: lowerBody.volume,
      categories: lowerBody.categories
    },
    core: {
      percentage: core.percentage,
      volume: core.volume,
      categories: core.categories
    },
    isBalanced,
    recommendation
  };
};

const calculateConsistency = (records: WorkoutRecord[]): number => {
  if (records.length === 0) return 0;

  const dates = records.map(r => r.date).sort((a, b) => a.getTime() - b.getTime());
  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];

  const totalDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  const workoutDays = new Set(records.map(r => r.date.toDateString())).size;

  return totalDays > 0 ? (workoutDays / totalDays) * 100 : 0;
}; 