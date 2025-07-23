import { EXERCISE_CATEGORIES } from '../../../constants/exercise-categories';
import type { WorkoutRecord } from '../../../interfaces';

export const calculateBalanceAnalysis = (records: WorkoutRecord[]) => {
  // Calcular métricas básicas
  const totalVolume = records.reduce((sum, record) => sum + (record.weight * record.reps * record.sets), 0);
  const totalWorkouts = new Set(records.map(r => r.date.toDateString())).size;

  // Análisis por categoría
  const categoryAnalysis = EXERCISE_CATEGORIES.reduce((acc, category) => {
    const categoryRecords = records.filter(r => {
      // Filtrar por categoría usando el ejercicio asociado
      return r.exercise?.categories?.includes(category) || false;
    });

    const categoryVolume = categoryRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
    const categoryWorkouts = new Set(categoryRecords.map(r => r.date.toDateString())).size;
    const avgWeight = categoryRecords.length > 0
      ? categoryRecords.reduce((sum, r) => sum + r.weight, 0) / categoryRecords.length
      : 0;

    // Calcular intensidad basada en el peso promedio vs peso máximo
    const maxWeight = Math.max(...categoryRecords.map(r => r.weight), 0);
    const intensityScore = maxWeight > 0 ? (avgWeight / maxWeight) * 100 : 0;

    // Calcular frecuencia semanal
    const weeklyFrequency = categoryWorkouts / Math.max(1, Math.ceil(totalWorkouts / 7));

    // Calcular tendencia (simplificado)
    const recentRecords = categoryRecords.slice(-5);
    const olderRecords = categoryRecords.slice(-10, -5);
    const recentVolume = recentRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
    const olderVolume = olderRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

    let progressTrend = 'stable';
    if (recentVolume > olderVolume * 1.1) progressTrend = 'improving';
    else if (recentVolume < olderVolume * 0.9) progressTrend = 'declining';

    // Calcular PRs (personal records)
    const personalRecords = categoryRecords.filter(r => {
      const sameExerciseRecords = categoryRecords.filter(cr => cr.exercise?.name === r.exercise?.name);
      return sameExerciseRecords.every(cr => r.weight >= cr.weight);
    });

    acc[category] = {
      volume: categoryVolume,
      percentage: totalVolume > 0 ? (categoryVolume / totalVolume) * 100 : 0,
      workouts: categoryWorkouts,
      frequency: totalWorkouts > 0 ? (categoryWorkouts / totalWorkouts) * 100 : 0,
      avgWeight,
      intensityScore,
      weeklyFrequency,
      weightProgression: progressTrend === 'improving' ? 10 : progressTrend === 'declining' ? -10 : 0,
      personalRecords: personalRecords.length
    };
    return acc;
  }, {} as Record<string, any>);

  // Balance muscular con campos adicionales
  const muscleBalance = Object.entries(categoryAnalysis).map(([category, data]) => {
    const idealPercentage = 100 / Object.keys(categoryAnalysis).length;
    const isBalanced = Math.abs(data.percentage - idealPercentage) <= 5;

    // Calcular prioridad basada en desequilibrio
    let priorityLevel = 'normal';
    if (Math.abs(data.percentage - idealPercentage) > 15) priorityLevel = 'critical';
    else if (Math.abs(data.percentage - idealPercentage) > 10) priorityLevel = 'high';

    return {
      category,
      percentage: data.percentage,
      totalVolume: data.volume,
      idealPercentage,
      intensityScore: data.intensityScore,
      weeklyFrequency: data.weeklyFrequency,
      isBalanced,
      priorityLevel,
      progressTrend: data.progressTrend,
      personalRecords: data.personalRecords,
      balanceHistory: {
        trend: data.progressTrend
      }
    };
  });

  // Balance superior/inferior
  const upperCategories = ['Pecho', 'Espalda', 'Hombros', 'Brazos'];
  const lowerCategories = ['Piernas', 'Core'];

  const upperVolume = upperCategories.reduce((sum, cat) => sum + (categoryAnalysis[cat]?.volume || 0), 0);
  const lowerVolume = lowerCategories.reduce((sum, cat) => sum + (categoryAnalysis[cat]?.volume || 0), 0);

  const upperLowerBalance = {
    upper: {
      volume: upperVolume,
      percentage: totalVolume > 0 ? (upperVolume / totalVolume) * 100 : 0
    },
    lower: {
      volume: lowerVolume,
      percentage: totalVolume > 0 ? (lowerVolume / totalVolume) * 100 : 0
    }
  };

  // Calcular consistencia
  const consistency = calculateConsistency(records);

  // Calcular intensidad promedio
  const avgIntensity = records.length > 0
    ? records.reduce((sum, r) => sum + r.weight, 0) / records.length
    : 0;

  // Calcular frecuencia promedio
  const avgFrequency = totalWorkouts;

  // Calcular score de balance
  const balanceScore = calculateBalanceScore(muscleBalance);

  return {
    balanceScore,
    finalConsistency: consistency,
    avgIntensity,
    avgFrequency,
    muscleBalance,
    categoryAnalysis: {
      categoryMetrics: Object.entries(categoryAnalysis).map(([category, data]) => ({
        category,
        ...data
      }))
    },
    upperLowerBalance,
    selectedView: 'general' as const
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

const calculateBalanceScore = (muscleBalance: Array<{ percentage: number; idealPercentage: number }>): number => {
  if (muscleBalance.length === 0) return 0;

  const totalDeviation = muscleBalance.reduce((sum, muscle) => {
    const deviation = Math.abs(muscle.percentage - muscle.idealPercentage);
    return sum + deviation;
  }, 0);

  const avgDeviation = totalDeviation / muscleBalance.length;
  return Math.max(0, 100 - avgDeviation);
}; 